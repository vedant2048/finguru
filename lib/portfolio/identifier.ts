import { AIError, isAIConfigured } from "@/lib/ai/client";
import { resolveStocksWithAI } from "@/lib/ai/stockResolver";
import { MarketDataError, type MarketDataService } from "@/lib/market-data";
import { PortfolioError } from "./errors";
import type { Identification, IdentifiedHolding, NormalizedRow, SecurityCandidate } from "./types";

/** AI matches below this confidence are sent to the user for review instead of being accepted. */
export const MIN_AI_CONFIDENCE = 0.8;
const MAX_CANDIDATES = 6;

const COMPANY_NOISE = /\b(limited|ltd|the|inc|corporation|corp|company|co|plc|pvt|private|eq|equity)\b/g;

export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(COMPANY_NOISE, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** "RELIANCE IND" → every input token is a prefix of the matching company token, in order. */
function isAbbreviationOf(input: string, company: string): boolean {
  const a = normalizeCompanyName(input).split(" ").filter(Boolean);
  const b = normalizeCompanyName(company).split(" ").filter(Boolean);
  if (a.length === 0) return false;
  let j = 0;
  for (const token of a) {
    while (j < b.length && !b[j].startsWith(token)) j++;
    if (j === b.length) return false;
    j++;
  }
  return true;
}

function looksLikeTicker(value: string): boolean {
  return /^[A-Z0-9&\-.]{1,20}$/.test(value.trim());
}

function dedupeCandidates(candidates: SecurityCandidate[]): SecurityCandidate[] {
  const seen = new Set<string>();
  const sorted = [...candidates].sort((x, y) => (x.exchange === y.exchange ? 0 : x.exchange === "NSE" ? -1 : 1));
  return sorted.filter((c) => {
    const key = `${c.exchange}:${c.symbol}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** One company can be listed on both NSE and BSE; prefer the NSE listing. */
function distinctCompanies(candidates: SecurityCandidate[]): SecurityCandidate[] {
  const byName = new Map<string, SecurityCandidate>();
  for (const c of candidates) {
    const key = normalizeCompanyName(c.company);
    const existing = byName.get(key);
    if (!existing || (existing.exchange === "BSE" && c.exchange === "NSE")) byName.set(key, c);
  }
  return [...byName.values()];
}

function identified(
  match: SecurityCandidate,
  method: Identification["method"],
  confidence: number,
  candidates: SecurityCandidate[],
  note: string | null = null
): Identification {
  return {
    status: "identified",
    company: match.company,
    symbol: match.symbol,
    exchange: match.exchange,
    confidence,
    method,
    note,
    candidates,
  };
}

function needsReview(note: string, candidates: SecurityCandidate[], suggestion?: Partial<Identification>): Identification {
  return {
    status: "needs_review",
    company: suggestion?.company ?? null,
    symbol: suggestion?.symbol ?? null,
    exchange: suggestion?.exchange ?? null,
    confidence: suggestion?.confidence ?? null,
    method: suggestion?.method ?? null,
    note,
    candidates,
  };
}

async function validateAnyExchange(market: MarketDataService, symbol: string, preferred: "NSE" | "BSE" = "NSE") {
  const order: ("NSE" | "BSE")[] = preferred === "NSE" ? ["NSE", "BSE"] : ["BSE", "NSE"];
  for (const exchange of order) {
    const listing = await market.validateSymbol(symbol, exchange);
    if (listing) return listing;
  }
  return null;
}

/**
 * Deterministic matching first (exact ticker, exact company name); AI only for what
 * remains. Every symbol — including AI suggestions — is validated against the exchange.
 */
export async function identifyStocks(rows: NormalizedRow[], market: MarketDataService): Promise<IdentifiedHolding[]> {
  let providerFailures = 0;

  const firstPass = await market.mapLimited(rows, async (row) => {
    try {
      const tickerInput = row.symbolHint ?? (looksLikeTicker(row.company) ? row.company : null);
      if (tickerInput) {
        const listing = await validateAnyExchange(market, tickerInput);
        if (listing) return { row, candidates: [listing], result: identified(listing, "symbol_match", 1, [listing]) };
      }

      const searches = await Promise.all(
        [row.company, row.symbolHint].filter((q): q is string => Boolean(q)).map((q) => market.searchSecurities(q))
      );
      const candidates = dedupeCandidates(searches.flat()).slice(0, MAX_CANDIDATES);
      const inputName = normalizeCompanyName(row.company);
      const exact = candidates.find(
        (c) => normalizeCompanyName(c.company) === inputName || c.symbol.toLowerCase() === row.company.trim().toLowerCase()
      );
      if (exact) return { row, candidates, result: identified(exact, "name_match", 0.95, candidates) };

      return { row, candidates, result: null as Identification | null };
    } catch (err) {
      if (!(err instanceof MarketDataError)) throw err;
      providerFailures++;
      return {
        row,
        candidates: [] as SecurityCandidate[],
        result: needsReview("The market-data service could not be reached while identifying this holding.", []),
      };
    }
  });

  if (providerFailures === rows.length) {
    throw new PortfolioError(
      "MARKET_DATA_UNAVAILABLE",
      "The market-data service is not responding right now, so we couldn't identify your holdings. Please try again in a few minutes."
    );
  }

  const pending = firstPass.map((p, id) => ({ ...p, id })).filter((p) => p.result === null);
  const resolved = new Map<number, Identification>();

  if (pending.length > 0 && isAIConfigured()) {
    try {
      const aiResults = await resolveStocksWithAI(
        pending.map((p) => ({ id: p.id, input: p.row.company, symbolHint: p.row.symbolHint, candidates: p.candidates }))
      );
      await market.mapLimited(pending, async (p) => {
        const ai = aiResults.find((r) => r.id === p.id);
        if (!ai || !ai.symbol) {
          resolved.set(p.id, needsReview(ai?.reason ?? `We couldn't identify "${p.row.company}".`, p.candidates));
          return;
        }
        const listing = await validateAnyExchange(market, ai.symbol, ai.exchange ?? "NSE").catch(() => null);
        if (!listing) {
          resolved.set(
            p.id,
            needsReview(`We couldn't verify a listed security for "${p.row.company}".`, p.candidates)
          );
        } else if (ai.confidence < MIN_AI_CONFIDENCE) {
          resolved.set(
            p.id,
            needsReview(ai.reason, p.candidates, {
              company: listing.company,
              symbol: listing.symbol,
              exchange: listing.exchange,
              confidence: ai.confidence,
              method: "ai",
            })
          );
        } else {
          resolved.set(p.id, identified(listing, "ai", ai.confidence, p.candidates, ai.reason));
        }
      });
    } catch (err) {
      if (!(err instanceof AIError)) throw err;
      console.warn("[identifier] AI resolution failed, falling back to deterministic matching:", err.message);
    }
  }

  return firstPass.map((p, id) => {
    const result = p.result ?? resolved.get(id) ?? fallbackMatch(p.row, p.candidates);
    return { ...p.row, identification: result };
  });
}

/** Without AI: accept only when the search yields a single company the input abbreviates. */
function fallbackMatch(row: NormalizedRow, candidates: SecurityCandidate[]): Identification {
  const companies = distinctCompanies(candidates).filter((c) => isAbbreviationOf(row.company, c.company));
  if (companies.length === 1) return identified(companies[0], "name_match", 0.85, candidates);
  if (companies.length > 1) {
    return needsReview(
      `"${row.company}" matches more than one listed company. Please choose the correct one.`,
      candidates
    );
  }
  return needsReview(`We couldn't identify "${row.company}". Please review this holding before continuing.`, candidates);
}

export type UserResolution =
  | { rowNumber: number; action: "select"; symbol: string; exchange: "NSE" | "BSE" }
  | { rowNumber: number; action: "exclude" };

/** Applies the user's choices for holdings that needed review. Symbols are re-validated. */
export async function applyUserResolutions(
  holdings: IdentifiedHolding[],
  resolutions: UserResolution[],
  market: MarketDataService
): Promise<IdentifiedHolding[]> {
  const byRow = new Map(resolutions.map((r) => [r.rowNumber, r]));
  const errors: string[] = [];

  const updated = await market.mapLimited(holdings, async (h) => {
    const r = byRow.get(h.rowNumber);
    if (!r) return h;
    if (r.action === "exclude") {
      return { ...h, identification: { ...h.identification, status: "excluded" as const, note: "Excluded by you during review." } };
    }
    const listing = await market.validateSymbol(r.symbol, r.exchange);
    if (!listing) {
      errors.push(`Row ${h.rowNumber} (${h.company}): "${r.symbol}" is not a valid ${r.exchange} symbol.`);
      return h;
    }
    return { ...h, identification: identified(listing, "user", 1, h.identification.candidates, "Confirmed by you.") };
  });

  if (errors.length > 0) {
    throw new PortfolioError("UNKNOWN_STOCK", "Some of the symbols you entered could not be found.", errors);
  }
  return updated;
}

/**
 * Rows that resolve to the same listing are combined: quantities are summed and the
 * average price becomes the quantity-weighted average of the rows.
 */
export function consolidateHoldings(holdings: IdentifiedHolding[]): IdentifiedHolding[] {
  const out = new Map<string, IdentifiedHolding>();
  for (const h of holdings) {
    const { symbol, exchange } = h.identification;
    const key = `${exchange}:${symbol}`;
    const existing = out.get(key);
    if (!existing) {
      out.set(key, { ...h });
      continue;
    }
    const quantity = existing.quantity + h.quantity;
    out.set(key, {
      ...existing,
      company: existing.company === h.company ? existing.company : `${existing.company} + ${h.company}`,
      quantity,
      avgPrice: (existing.quantity * existing.avgPrice + h.quantity * h.avgPrice) / quantity,
      currentPrice: existing.currentPrice ?? h.currentPrice,
      investedValue: null,
      marketValue: null,
      pnl: null,
      pnlPercentage: null,
    });
  }
  return [...out.values()];
}

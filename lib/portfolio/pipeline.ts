import { AIError, isAIConfigured } from "@/lib/ai/client";
import { generatePortfolioAnalysis } from "@/lib/ai/portfolioAnalysis";
import { getMarketDataService, MarketDataError } from "@/lib/market-data";
import { buildPortfolioHistory, calculatePortfolioMetrics } from "./calculations";
import { PortfolioError } from "./errors";
import { parsePortfolioFile } from "./fileParser";
import { applyUserResolutions, consolidateHoldings, identifyStocks, type UserResolution } from "./identifier";
import { normalizePortfolioColumns, scoreHeaderRow } from "./normalizer";
import {
  deleteUnfinishedPortfolios,
  loadReviewDraft,
  saveAnalysis,
  savePortfolio,
  saveReviewDraft,
} from "./repository";
import type {
  AnalysisStatus,
  CalculatedPortfolio,
  IdentifiedHolding,
  MarketQuote,
  PerformanceHistory,
  PipelineEvent,
  PricePoint,
  ReviewItem,
} from "./types";

export type Emit = (event: PipelineEvent) => void;

const HISTORY_DAYS = 365;

function toReviewItems(holdings: IdentifiedHolding[]): ReviewItem[] {
  return holdings.map((h) => ({
    rowNumber: h.rowNumber,
    input: h.company,
    quantity: h.quantity,
    avgPrice: h.avgPrice,
    status: h.identification.status,
    company: h.identification.company,
    symbol: h.identification.symbol,
    exchange: h.identification.exchange,
    confidence: h.identification.confidence,
    note: h.identification.note,
    candidates: h.identification.candidates,
  }));
}

/** Upload entry point: parse → normalize → identify, then either pause for review or complete. */
export async function processPortfolioUpload(
  input: { userId: string; fileName: string; buffer: Buffer },
  emit: Emit
): Promise<void> {
  emit({ type: "stage", stage: "parsing", message: "Reading your file" });
  const parsed = parsePortfolioFile(input.buffer, input.fileName, scoreHeaderRow);
  const rows = normalizePortfolioColumns(parsed);

  emit({
    type: "stage",
    stage: "identifying",
    message: "Identifying holdings",
    detail: `${rows.length} holding${rows.length === 1 ? "" : "s"} detected`,
  });
  const market = getMarketDataService();
  const identified = await identifyStocks(rows, market);

  await deleteUnfinishedPortfolios(input.userId);

  const unresolved = identified.filter((h) => h.identification.status === "needs_review");
  if (unresolved.length > 0) {
    const portfolioId = await saveReviewDraft(input.userId, input.fileName, identified);
    emit({
      type: "needs_review",
      portfolioId,
      holdings: toReviewItems(identified),
      message: `${unresolved.length} of ${identified.length} holdings need your review before we continue.`,
    });
    return;
  }

  await completePortfolio({ userId: input.userId, draftId: null, fileName: input.fileName, holdings: identified }, emit);
}

/** Continues a paused upload once the user has confirmed or excluded each flagged holding. */
export async function resumePortfolioAfterReview(
  input: { userId: string; portfolioId: number; resolutions: UserResolution[] },
  emit: Emit
): Promise<void> {
  emit({ type: "stage", stage: "identifying", message: "Validating your selections" });
  const draft = await loadReviewDraft(input.userId, input.portfolioId);
  const holdings = await applyUserResolutions(draft.holdings, input.resolutions, getMarketDataService());

  const stillUnresolved = holdings.filter((h) => h.identification.status === "needs_review");
  if (stillUnresolved.length > 0) {
    throw new PortfolioError(
      "INVALID_REQUEST",
      "Please choose a stock or exclude each holding marked Needs Review.",
      stillUnresolved.map((h) => `Row ${h.rowNumber}: ${h.company}`)
    );
  }

  await completePortfolio(
    { userId: input.userId, draftId: input.portfolioId, fileName: draft.fileName, holdings },
    emit
  );
}

async function completePortfolio(
  input: { userId: string; draftId: number | null; fileName: string; holdings: IdentifiedHolding[] },
  emit: Emit
): Promise<void> {
  const market = getMarketDataService();
  const active = consolidateHoldings(input.holdings.filter((h) => h.identification.status === "identified"));
  const excluded = input.holdings.filter((h) => h.identification.status === "excluded");
  if (active.length === 0) {
    throw new PortfolioError("NO_HOLDINGS", "Every holding was excluded, so there is nothing to analyse.");
  }

  emit({ type: "stage", stage: "fetching_market_data", message: "Fetching market data", detail: `${active.length} securities` });
  const { quotes, histories } = await fetchMarketData(active);

  emit({ type: "stage", stage: "calculating", message: "Calculating portfolio metrics" });
  const calculated = calculatePortfolioMetrics(active.map((holding, i) => ({ holding, quote: quotes[i] })));
  const history = buildPortfolioHistory(calculated.holdings, histories);

  emit({ type: "stage", stage: "saving", message: "Saving your portfolio" });
  const portfolioId = await savePortfolio({
    userId: input.userId,
    draftId: input.draftId,
    fileName: input.fileName,
    calculated,
    history,
    excluded,
    identified: active,
    provider: process.env.MARKET_DATA_PROVIDER || "yahoo",
  });

  emit({ type: "stage", stage: "analyzing", message: "Generating analysis" });
  const analysisStatus = await runPortfolioAnalysis(input.userId, portfolioId, calculated, history);

  emit({ type: "completed", portfolioId, analysisStatus, redirectTo: "/dashboard" });

  async function fetchMarketData(holdings: IdentifiedHolding[]) {
    const from = new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000);
    const failures: string[] = [];

    const quotes = await market.mapLimited(holdings, async (h): Promise<MarketQuote | null> => {
      const { symbol, exchange } = h.identification;
      let quote: MarketQuote | null = null;
      try {
        quote = await market.getQuote(symbol!, exchange!);
      } catch (err) {
        if (!(err instanceof MarketDataError)) throw err;
        console.warn("[pipeline] quote failed:", err.message);
      }
      if (!quote && h.currentPrice === null) failures.push(`${symbol} (${h.company})`);
      return quote;
    });

    if (failures.length > 0) {
      throw new PortfolioError(
        "MARKET_DATA_UNAVAILABLE",
        "We couldn't fetch current market prices for some holdings. Please try again in a few minutes.",
        failures.map((f) => `No price available for ${f}`)
      );
    }

    const histories = new Map<string, PricePoint[]>();
    await market.mapLimited(holdings, async (h) => {
      const { symbol, exchange } = h.identification;
      const points = await market.getHistory(symbol!, exchange!, from).catch((err) => {
        console.warn("[pipeline] history failed:", err instanceof Error ? err.message : err);
        return [] as PricePoint[];
      });
      histories.set(`${exchange}:${symbol}`, points);
    });

    return { quotes, histories };
  }
}

/** Generates and stores AI analysis. Failure here never blocks access to the portfolio. */
export async function runPortfolioAnalysis(
  userId: string,
  portfolioId: number,
  calculated: CalculatedPortfolio,
  history: PerformanceHistory
): Promise<AnalysisStatus> {
  if (!isAIConfigured()) {
    await saveAnalysis(userId, portfolioId, "unavailable", null, "AI analysis is not configured.");
    return "unavailable";
  }
  try {
    const analysis = await generatePortfolioAnalysis(calculated, history);
    await saveAnalysis(userId, portfolioId, "completed", analysis, null);
    return "completed";
  } catch (err) {
    if (!(err instanceof AIError)) throw err;
    console.error("[pipeline] analysis failed:", err.message, err.cause);
    await saveAnalysis(userId, portfolioId, "failed", null, err.message);
    return "failed";
  }
}

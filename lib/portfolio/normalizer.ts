import { PortfolioError } from "./errors";
import type { NormalizedRow, ParsedFile } from "./types";

type Field =
  | "company"
  | "symbol"
  | "quantity"
  | "avgPrice"
  | "currentPrice"
  | "investedValue"
  | "marketValue"
  | "pnlPercentage"
  | "pnl";

/**
 * Header aliases after normalizeHeader(). Order matters for partial matching:
 * more specific fields (e.g. P&L %) are checked before broader ones (P&L).
 */
const COLUMN_ALIASES: Record<Field, string[]> = {
  company: [
    "company", "company name", "stock", "stock name", "scrip", "scrip name", "security",
    "security name", "instrument", "instrument name", "name", "share name", "equity name",
  ],
  symbol: ["symbol", "ticker", "trading symbol", "tradingsymbol", "stock symbol", "nse symbol", "scrip code"],
  quantity: [
    "quantity", "qty", "units", "shares", "no of shares", "number of shares", "holding quantity",
    "total quantity", "quantity available", "net qty", "available qty",
  ],
  avgPrice: [
    "average price", "avg price", "average cost", "avg cost", "buy price", "purchase price",
    "avg buy price", "average buy price", "buy avg", "avg cost price", "cost price", "buy average",
    "average cost price", "avg trading price",
  ],
  currentPrice: [
    "current price", "ltp", "last price", "last traded price", "cmp", "market price",
    "close price", "closing price", "current market price",
  ],
  investedValue: [
    "invested value", "invested", "invested amount", "investment value", "buy value",
    "cost value", "total cost", "amount invested", "investment",
  ],
  marketValue: ["market value", "current value", "present value", "cur val", "value at ltp", "holding value"],
  pnlPercentage: [
    "p&l %", "pnl %", "p&l percentage", "pnl percentage", "% p&l", "return %", "returns %",
    "gain %", "net chg %", "change %", "p&l pct",
  ],
  pnl: [
    "p&l", "pnl", "profit loss", "profit and loss", "unrealized p&l", "unrealised p&l",
    "gain loss", "net p&l", "overall p&l", "returns",
  ],
};

const MATCH_ORDER: Field[] = [
  "pnlPercentage", "pnl", "avgPrice", "currentPrice", "investedValue", "marketValue",
  "quantity", "symbol", "company",
];

const SUMMARY_ROW = /^(grand\s+)?(sub\s*)?total\b|^summary\b|^disclaimer\b|^note[s]?\b/i;

export function normalizeHeader(header: string): string {
  return String(header ?? "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ") // "Avg Price (₹)" → "avg price"
    .replace(/\./g, "")
    .replace(/%/g, " % ")
    .replace(/[^a-z0-9%&]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchField(header: string): Field | null {
  const h = normalizeHeader(header);
  if (!h) return null;
  for (const field of MATCH_ORDER) {
    if (COLUMN_ALIASES[field].includes(h)) return field;
  }
  // Partial match on multi-word aliases only, so "cost" or "name" don't swallow unrelated columns.
  for (const field of MATCH_ORDER) {
    for (const alias of COLUMN_ALIASES[field]) {
      if (alias.includes(" ") && new RegExp(`(^| )${escapeRegex(alias)}( |$)`).test(h)) return field;
    }
  }
  return null;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function mapColumns(headers: string[]): Partial<Record<Field, string>> {
  const map: Partial<Record<Field, string>> = {};
  for (const header of headers) {
    const field = matchField(header);
    if (field && !map[field]) map[field] = header;
  }
  return map;
}

/** Used by the file parser to locate the header row inside broker exports. */
export function scoreHeaderRow(cells: string[]): number {
  const map = mapColumns(cells.filter(Boolean));
  const hasName = Boolean(map.company || map.symbol);
  const core = [hasName, Boolean(map.quantity), Boolean(map.avgPrice || map.investedValue)].filter(Boolean).length;
  if (core < 2) return 0;
  return core * 10 + Object.keys(map).length;
}

export function parseNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value === null || value === undefined) return null;
  let s = String(value).trim();
  if (!s || s === "-" || s === "--" || /^n\/?a$/i.test(s)) return null;
  const negative = /^\(.*\)$/.test(s) || /^-/.test(s);
  s = s.replace(/rs\.?|inr|₹|[,\s()%+]/gi, "").replace(/^-/, "");
  if (!/^\d*\.?\d+(e[+-]?\d+)?$/i.test(s)) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}

/**
 * Maps a parsed file's differently-named columns into NormalizedRow.
 * Throws a PortfolioError listing exactly what is missing or invalid.
 */
export function normalizePortfolioColumns(parsed: ParsedFile): NormalizedRow[] {
  const map = mapColumns(parsed.headers);

  const missing: string[] = [];
  if (!map.company && !map.symbol) missing.push("Company / stock name (e.g. Company, Stock Name, Symbol, Scrip)");
  if (!map.quantity) missing.push("Quantity (e.g. Quantity, Qty, Units, Shares)");
  if (!map.avgPrice && !map.investedValue) missing.push("Average price (e.g. Avg Price, Average Cost, Buy Price)");

  if (missing.length > 0) {
    const found = parsed.headers.filter(Boolean);
    throw new PortfolioError(
      "MISSING_COLUMNS",
      `We couldn't find ${missing.length === 1 ? "a required column" : "some required columns"} in your file.`,
      [
        ...missing.map((m) => `Missing: ${m}`),
        `Columns found: ${found.length ? found.join(", ") : "none"}`,
      ]
    );
  }

  const nameCol = map.company ?? map.symbol!;
  const symbolCol = map.company && map.symbol ? map.symbol : undefined;
  const rows: NormalizedRow[] = [];
  const rowErrors: string[] = [];

  for (const raw of parsed.rows) {
    const rowNumber = Number(raw.__rowNumber);
    const company = String(raw[nameCol] ?? "").trim();
    const qtyRaw = raw[map.quantity!];
    const avgRaw = map.avgPrice ? raw[map.avgPrice] : undefined;
    const investedRaw = map.investedValue ? raw[map.investedValue] : undefined;

    if (!company) {
      if (parseNumber(qtyRaw) !== null) rowErrors.push(`Row ${rowNumber}: quantity given but the company name is empty.`);
      continue;
    }
    if (SUMMARY_ROW.test(company)) continue;
    // Footnotes/free text rows: a name with no numeric data at all.
    if (parseNumber(qtyRaw) === null && parseNumber(avgRaw) === null && parseNumber(investedRaw) === null) continue;

    const quantity = parseNumber(qtyRaw);
    if (quantity === null || quantity <= 0) {
      rowErrors.push(`Row ${rowNumber} (${company}): quantity "${String(qtyRaw ?? "")}" is not a positive number.`);
      continue;
    }

    let avgPrice = parseNumber(avgRaw);
    const investedValue = parseNumber(investedRaw);
    if ((avgPrice === null || avgPrice <= 0) && investedValue !== null && investedValue > 0) {
      avgPrice = investedValue / quantity;
    }
    if (avgPrice === null || avgPrice <= 0) {
      rowErrors.push(`Row ${rowNumber} (${company}): average price "${String(avgRaw ?? "")}" is not a positive number.`);
      continue;
    }

    const symbolHint = symbolCol ? String(raw[symbolCol] ?? "").trim() || null : null;

    rows.push({
      rowNumber,
      company,
      symbolHint,
      quantity,
      avgPrice,
      currentPrice: map.currentPrice ? parseNumber(raw[map.currentPrice]) : null,
      investedValue,
      marketValue: map.marketValue ? parseNumber(raw[map.marketValue]) : null,
      pnl: map.pnl ? parseNumber(raw[map.pnl]) : null,
      pnlPercentage: map.pnlPercentage ? parseNumber(raw[map.pnlPercentage]) : null,
    });
  }

  if (rowErrors.length > 0) {
    throw new PortfolioError(
      "INVALID_ROWS",
      `${rowErrors.length} row${rowErrors.length === 1 ? " has" : "s have"} invalid values. Please fix ${rowErrors.length === 1 ? "it" : "them"} and upload again.`,
      rowErrors.slice(0, 20)
    );
  }
  if (rows.length === 0) {
    throw new PortfolioError("NO_HOLDINGS", "The file has the right columns but no holdings rows.");
  }
  return rows;
}

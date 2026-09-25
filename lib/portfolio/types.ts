/**
 * Core data structures for the portfolio import pipeline.
 *
 * FILE PARSER → NORMALIZER → STOCK IDENTIFIER → MARKET DATA SERVICE
 *   → CALCULATION ENGINE → DATABASE → AI ANALYSIS → DASHBOARD
 *
 * Every financial number in these types originates from the uploaded file,
 * the market-data provider, or a programmatic calculation — never from AI.
 */

export type ProcessingStage =
  | "idle"
  | "uploading"
  | "parsing"
  | "identifying"
  | "fetching_market_data"
  | "calculating"
  | "saving"
  | "analyzing"
  | "completed"
  | "needs_review"
  | "error";

export type PortfolioStatus = "needs_review" | "completed" | "error";

/** Output of the file parser: raw rows keyed by their original header text. */
export interface ParsedFile {
  fileName: string;
  headers: string[];
  rows: Record<string, unknown>[];
  /** 1-based spreadsheet row number of the header row. */
  headerRowNumber: number;
  sheetName?: string;
}

/** Output of the normalizer: one row of the user's file in a consistent shape. */
export interface NormalizedRow {
  rowNumber: number;
  company: string;
  /** Ticker from a dedicated Symbol/Ticker column, when the file has one alongside a name column. */
  symbolHint: string | null;
  quantity: number;
  avgPrice: number;
  currentPrice: number | null;
  investedValue: number | null;
  marketValue: number | null;
  pnl: number | null;
  pnlPercentage: number | null;
}

export interface SecurityCandidate {
  symbol: string;
  exchange: "NSE" | "BSE";
  company: string;
}

export type IdentificationMethod = "symbol_match" | "name_match" | "ai" | "user";

export interface Identification {
  status: "identified" | "needs_review" | "excluded";
  company: string | null;
  symbol: string | null;
  exchange: "NSE" | "BSE" | null;
  confidence: number | null;
  method: IdentificationMethod | null;
  /** Human-readable explanation, shown to the user when review is needed. */
  note: string | null;
  candidates: SecurityCandidate[];
}

export interface IdentifiedHolding extends NormalizedRow {
  identification: Identification;
}

/** Normalized market data for one listed security. */
export interface MarketQuote {
  symbol: string;
  exchange: "NSE" | "BSE";
  company: string | null;
  currency: string | null;
  currentPrice: number;
  previousClose: number | null;
  marketCap: number | null;
  pe: number | null;
  eps: number | null;
  week52High: number | null;
  week52Low: number | null;
  volume: number | null;
  sector: string | null;
  industry: string | null;
  dividendYield: number | null;
  asOf: string;
}

export interface PricePoint {
  date: string; // YYYY-MM-DD
  close: number;
}

/** Fully calculated holding — the single source of truth for the dashboard. */
export interface PortfolioHolding {
  id?: number;
  rowNumber: number;
  inputName: string;
  company: string;
  symbol: string;
  exchange: "NSE" | "BSE";
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  priceSource: "market" | "file";
  investedValue: number;
  currentValue: number;
  profitLoss: number;
  returnPercentage: number | null;
  allocationPercentage: number;
  sector: string;
  industry: string | null;
  identificationMethod: IdentificationMethod | null;
  identificationConfidence: number | null;
  market: Omit<MarketQuote, "symbol" | "exchange" | "company" | "currentPrice"> | null;
}

export interface SectorAllocation {
  sector: string;
  currentValue: number;
  allocationPercentage: number;
  holdingsCount: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  totalReturnPercentage: number | null;
  holdingsCount: number;
  largestHolding: { symbol: string; company: string; allocationPercentage: number } | null;
  largestSector: { sector: string; allocationPercentage: number } | null;
}

export interface PerformanceHistory {
  available: boolean;
  /** Why history is unavailable or partial; null when complete. */
  note: string | null;
  points: { date: string; value: number }[];
}

export interface CalculatedPortfolio {
  summary: PortfolioSummary;
  holdings: PortfolioHolding[];
  sectorAllocation: SectorAllocation[];
}

/** Streamed to the client while the pipeline runs. */
export type PipelineEvent =
  | { type: "stage"; stage: ProcessingStage; message: string; detail?: string }
  | {
      type: "needs_review";
      portfolioId: number;
      holdings: ReviewItem[];
      message: string;
    }
  | { type: "completed"; portfolioId: number; analysisStatus: AnalysisStatus; redirectTo: string }
  | { type: "error"; code: string; message: string; details?: string[] };

export interface ReviewItem {
  rowNumber: number;
  input: string;
  quantity: number;
  avgPrice: number;
  status: Identification["status"];
  company: string | null;
  symbol: string | null;
  exchange: "NSE" | "BSE" | null;
  confidence: number | null;
  note: string | null;
  candidates: SecurityCandidate[];
}

export type AnalysisStatus = "completed" | "failed" | "unavailable";

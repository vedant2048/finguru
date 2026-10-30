import type { MarketQuote, PricePoint, SecurityCandidate } from "@/lib/portfolio/types";

export type Exchange = "NSE" | "BSE";

export interface IndexQuote {
  symbol: string;
  ticker: string;
  price: string;
  rawPrice: number;
  change: string;
  rawChange: number;
  percent: string;
  rawPercent: number;
  volume: string;
  positive: boolean;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface MarketStockItem {
  ticker: string;
  name: string;
  price: string;
  rawPrice: number;
  change: string;
  rawChange: number;
  percent: string;
  rawPercent: number;
  volume: string;
  rawVolume: number;
  turnover?: string;
  pe?: string;
  marketCap?: string;
  high52?: string;
  distance52?: string;
  rsi?: string;
  positive: boolean;
}

export interface MarketCategoriesResult {
  gainers: MarketStockItem[];
  losers: MarketStockItem[];
  mostActive: MarketStockItem[];
  fiftyTwoWeekHigh: MarketStockItem[];
}

export interface MarketOverviewData {
  indices: IndexQuote[];
  chart: Record<string, ChartDataPoint[]>;
  gainers: MarketStockItem[];
  losers: MarketStockItem[];
  mostActive: MarketStockItem[];
  fiftyTwoWeekHigh: MarketStockItem[];
  updatedAt: string;
}

export interface StockFundamentals {
  symbol: string;
  exchange: Exchange;
  tickerWithSuffix: string;
  name?: string;
  sector?: string;
  marketCap: number | null;
  trailingPE: number | null;
  returnOnEquity: number | null;
  debtToEquity: number | null;
  industryPe: number | null;
  roce: number | null;
  updatedAt?: string;
  rawData?: Record<string, unknown>;
}

export interface StockDetailResult {
  ticker: string;
  name: string;
  sector: string;
  exchange: string;
  price: string;
  rawPrice: number;
  change: string;
  rawChange: number;
  percent: string;
  rawPercent: number;
  positive: boolean;
  marketCap: string;
  pe: number | null;
  industryPe: number | null;
  pb: number | null;
  evEbitda: number | null;
  peg: number | null;
  roe: number | null;
  roce: number | null;
  debtEquity: number | null;
  operatingMargin: string | null;
  eps: string | null;
  revenue: string | null;
  netProfit: string | null;
  volume: string;
  chart: Record<string, ChartDataPoint[]>;
}

/**
 * Contract every market-data backend must implement. Swap providers by
 * implementing this interface and registering it in lib/market-data/index.ts.
 */
export interface MarketDataProvider {
  readonly name: string;
  /** Listed Indian equities (NSE/BSE) matching a free-text query. */
  searchSecurities(query: string): Promise<SecurityCandidate[]>;
  /** Returns null when the symbol does not exist on the exchange. Throws MarketDataError on provider failure. */
  getQuote(symbol: string, exchange: Exchange): Promise<MarketQuote | null>;
  /** Daily closes from `from` until today. Empty array when unavailable. */
  getHistory(symbol: string, exchange: Exchange, from: Date): Promise<PricePoint[]>;
  /** Real-time benchmark market indices (NIFTY 50, SENSEX, etc.) */
  getMarketIndices?(): Promise<IndexQuote[]>;
  /** Intraday & multi-timeframe trajectory for an index or stock */
  getBenchmarkChart?(symbol: string): Promise<Record<string, ChartDataPoint[]>>;
  /** Gainers, losers, most active, 52-week high stocks */
  getMarketCategories?(): Promise<MarketCategoriesResult>;
  /** Comprehensive detail for a specific stock */
  getStockDetail?(symbol: string, exchange?: Exchange): Promise<StockDetailResult | null>;
  /** Normalized fundamental metrics for Indian equities */
  getStockFundamentals?(symbol: string, exchange?: Exchange): Promise<StockFundamentals | null>;
  getBatchStockFundamentals?(symbols: string[], exchange?: Exchange): Promise<StockFundamentals[]>;
}

/** The provider could not be reached or returned an unusable response. */
export class MarketDataError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "MarketDataError";
  }
}

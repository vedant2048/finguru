import type { MarketQuote, PricePoint, SecurityCandidate } from "@/lib/portfolio/types";

export type Exchange = "NSE" | "BSE";

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
}

/** The provider could not be reached or returned an unusable response. */
export class MarketDataError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "MarketDataError";
  }
}

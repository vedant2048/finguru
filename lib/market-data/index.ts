import type { MarketQuote, PricePoint, SecurityCandidate } from "@/lib/portfolio/types";
import { YahooMarketDataProvider } from "./yahooProvider";
import {
  MarketDataError,
  type Exchange,
  type MarketDataProvider,
  type IndexQuote,
  type ChartDataPoint,
  type MarketCategoriesResult,
  type StockDetailResult,
  type StockFundamentals,
} from "./types";
import { getCachedFundamentals, saveCachedFundamentals } from "./fundamentalsCache";

export { MarketDataError };
export type {
  Exchange,
  MarketDataProvider,
  IndexQuote,
  ChartDataPoint,
  MarketCategoriesResult,
  StockDetailResult,
  StockFundamentals,
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const REALTIME_TTL_MS = 45 * 1000; // 45 seconds for live dashboard feeds
const MAX_CONCURRENCY = 4;

function createProvider(): MarketDataProvider {
  const provider = (process.env.MARKET_DATA_PROVIDER || "yahoo").toLowerCase();
  switch (provider) {
    case "yahoo":
      return new YahooMarketDataProvider();
    default:
      throw new Error(`Unknown MARKET_DATA_PROVIDER "${provider}"`);
  }
}

/**
 * Single entry point for market data. The rest of the app never talks to a
 * provider directly, so the backend can be replaced without touching callers.
 */
export class MarketDataService {
  private cache = new Map<string, { expires: number; value: unknown }>();

  constructor(private readonly provider: MarketDataProvider) {}

  private async cached<T>(key: string, load: () => Promise<T>, ttl: number = CACHE_TTL_MS): Promise<T> {
    const hit = this.cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.value as T;
    const value = await load();
    this.cache.set(key, { expires: Date.now() + ttl, value });
    return value;
  }

  searchSecurities(query: string): Promise<SecurityCandidate[]> {
    return this.cached(`search:${query.toLowerCase()}`, () => this.provider.searchSecurities(query));
  }

  getQuote(symbol: string, exchange: Exchange): Promise<MarketQuote | null> {
    return this.cached(`quote:${exchange}:${symbol.toUpperCase()}`, () => this.provider.getQuote(symbol, exchange));
  }

  getHistory(symbol: string, exchange: Exchange, from: Date): Promise<PricePoint[]> {
    const day = from.toISOString().slice(0, 10);
    return this.cached(`history:${exchange}:${symbol.toUpperCase()}:${day}`, () =>
      this.provider.getHistory(symbol, exchange, from)
    );
  }

  getMarketIndices(): Promise<IndexQuote[]> {
    if (!this.provider.getMarketIndices) {
      return Promise.resolve([]);
    }
    return this.cached("market:indices", () => this.provider.getMarketIndices!(), REALTIME_TTL_MS);
  }

  getBenchmarkChart(symbol: string = "^NSEI"): Promise<Record<string, ChartDataPoint[]>> {
    if (!this.provider.getBenchmarkChart) {
      return Promise.resolve({ "1D": [], "1W": [], "1M": [], "1Y": [] });
    }
    return this.cached(`market:benchmark:${symbol}`, () => this.provider.getBenchmarkChart!(symbol), REALTIME_TTL_MS);
  }

  getMarketCategories(): Promise<MarketCategoriesResult> {
    if (!this.provider.getMarketCategories) {
      return Promise.resolve({ gainers: [], losers: [], mostActive: [], fiftyTwoWeekHigh: [] });
    }
    return this.cached("market:categories", () => this.provider.getMarketCategories!(), REALTIME_TTL_MS);
  }

  getStockDetail(symbol: string, exchange: Exchange = "NSE"): Promise<StockDetailResult | null> {
    if (!this.provider.getStockDetail) {
      return Promise.resolve(null);
    }
    return this.cached(`stock:detail:${exchange}:${symbol.toUpperCase()}`, () => this.provider.getStockDetail!(symbol, exchange), REALTIME_TTL_MS);
  }

  /** Fetch fundamentals for a single Indian stock with Supabase/memory caching */
  async getStockFundamentals(symbol: string, exchange: Exchange = "NSE"): Promise<StockFundamentals | null> {
    const clean = symbol.trim().toUpperCase().replace(/\.(NS|BO)$/i, "");
    const tickerWithSuffix = `${clean}${exchange === "BSE" ? ".BO" : ".NS"}`;
    const cachedMap = await getCachedFundamentals([tickerWithSuffix]);
    const hit = cachedMap.get(tickerWithSuffix);
    if (hit) return hit;

    if (!this.provider.getStockFundamentals) return null;
    const fresh = await this.provider.getStockFundamentals(clean, exchange);
    if (fresh) {
      await saveCachedFundamentals([fresh]);
    }
    return fresh;
  }

  /** Batch fetch fundamentals for Indian stocks with Supabase/memory caching */
  async getBatchStockFundamentals(symbols: string[], exchange: Exchange = "NSE"): Promise<StockFundamentals[]> {
    const cleanSymbols = symbols.map((s) => s.trim().toUpperCase().replace(/\.(NS|BO)$/i, ""));
    const suffix = exchange === "BSE" ? ".BO" : ".NS";
    const tickersWithSuffix = cleanSymbols.map((s) => `${s}${suffix}`);

    const cachedMap = await getCachedFundamentals(tickersWithSuffix);
    const missing: string[] = [];
    const results: StockFundamentals[] = [];

    for (let i = 0; i < cleanSymbols.length; i++) {
      const full = tickersWithSuffix[i];
      const hit = cachedMap.get(full);
      if (hit) {
        results.push(hit);
      } else {
        missing.push(cleanSymbols[i]);
      }
    }

    if (missing.length > 0 && this.provider.getBatchStockFundamentals) {
      const fresh = await this.provider.getBatchStockFundamentals(missing, exchange);
      if (fresh.length > 0) {
        await saveCachedFundamentals(fresh);
        results.push(...fresh);
      }
    }

    return results;
  }

  /** Confirms a symbol really trades on the exchange. Returns the canonical listing or null. */
  async validateSymbol(symbol: string, exchange: Exchange): Promise<SecurityCandidate | null> {
    const cleaned = symbol.trim().toUpperCase().replace(/\.(NS|BO)$/, "");
    if (!/^[A-Z0-9&\-_.]{1,20}$/.test(cleaned)) return null;
    const quote = await this.getQuote(cleaned, exchange);
    return quote ? { symbol: quote.symbol, exchange, company: quote.company ?? quote.symbol } : null;
  }

  /** Runs `fn` over items with bounded concurrency to stay within provider rate limits. */
  async mapLimited<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
    const results = new Array<R>(items.length);
    let next = 0;
    const workers = Array.from({ length: Math.min(MAX_CONCURRENCY, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
      }
    });
    await Promise.all(workers);
    return results;
  }
}

let service: MarketDataService | null = null;

export function getMarketDataService(): MarketDataService {
  if (!service) service = new MarketDataService(createProvider());
  return service;
}

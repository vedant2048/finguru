import type { MarketQuote, PricePoint, SecurityCandidate } from "@/lib/portfolio/types";
import { YahooMarketDataProvider } from "./yahooProvider";
import { MarketDataError, type Exchange, type MarketDataProvider } from "./types";

export { MarketDataError };
export type { Exchange, MarketDataProvider };

const CACHE_TTL_MS = 5 * 60 * 1000;
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

  private async cached<T>(key: string, load: () => Promise<T>): Promise<T> {
    const hit = this.cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.value as T;
    const value = await load();
    this.cache.set(key, { expires: Date.now() + CACHE_TTL_MS, value });
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

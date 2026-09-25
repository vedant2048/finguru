import YahooFinance from "yahoo-finance2";
import type { MarketQuote, PricePoint, SecurityCandidate } from "@/lib/portfolio/types";
import { MarketDataError, type Exchange, type MarketDataProvider } from "./types";

const SUFFIX: Record<Exchange, string> = { NSE: ".NS", BSE: ".BO" };
const EXCHANGE_BY_YAHOO_CODE: Record<string, Exchange> = { NSI: "NSE", BSE: "BSE", BOM: "BSE" };

function toYahooSymbol(symbol: string, exchange: Exchange) {
  return `${symbol.toUpperCase()}${SUFFIX[exchange]}`;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** Yahoo Finance via the yahoo-finance2 client. Requires no API key. Server-side only. */
export class YahooMarketDataProvider implements MarketDataProvider {
  readonly name = "yahoo";
  private readonly yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

  async searchSecurities(query: string): Promise<SecurityCandidate[]> {
    let result: { quotes?: Record<string, unknown>[] };
    try {
      result = (await this.yf.search(query, { quotesCount: 10, newsCount: 0 }, { validateResult: false })) as typeof result;
    } catch (err) {
      throw new MarketDataError(`Security search failed for "${query}"`, err);
    }

    const candidates: SecurityCandidate[] = [];
    for (const q of result?.quotes ?? []) {
      const exchange = EXCHANGE_BY_YAHOO_CODE[String(q.exchange ?? "")];
      const symbol = typeof q.symbol === "string" ? q.symbol : "";
      if (!exchange || q.quoteType !== "EQUITY" || !symbol) continue;
      candidates.push({
        symbol: symbol.replace(/\.(NS|BO)$/i, ""),
        exchange,
        company: String(q.longname ?? q.shortname ?? symbol),
      });
    }
    return candidates;
  }

  async getQuote(symbol: string, exchange: Exchange): Promise<MarketQuote | null> {
    const ySymbol = toYahooSymbol(symbol, exchange);
    let summary: Record<string, Record<string, unknown> | undefined>;
    try {
      summary = (await this.yf.quoteSummary(
        ySymbol,
        { modules: ["price", "summaryDetail", "defaultKeyStatistics", "assetProfile"] },
        { validateResult: false }
      )) as unknown as typeof summary;
    } catch (err) {
      if (err instanceof Error && /not found|no fundamentals data/i.test(err.message)) return null;
      throw new MarketDataError(`Quote request failed for ${ySymbol}`, err);
    }

    const price = summary.price ?? {};
    const detail = summary.summaryDetail ?? {};
    const stats = summary.defaultKeyStatistics ?? {};
    const profile = summary.assetProfile ?? {};

    const currentPrice = num(price.regularMarketPrice);
    if (currentPrice === null || currentPrice <= 0) return null;

    const marketTime = price.regularMarketTime;
    return {
      symbol: symbol.toUpperCase(),
      exchange,
      company: (price.longName as string) ?? (price.shortName as string) ?? null,
      currency: (price.currency as string) ?? null,
      currentPrice,
      previousClose: num(price.regularMarketPreviousClose) ?? num(detail.previousClose),
      marketCap: num(price.marketCap) ?? num(detail.marketCap),
      pe: num(detail.trailingPE),
      eps: num(stats.trailingEps),
      week52High: num(detail.fiftyTwoWeekHigh),
      week52Low: num(detail.fiftyTwoWeekLow),
      volume: num(price.regularMarketVolume) ?? num(detail.volume),
      sector: (profile.sector as string) || null,
      industry: (profile.industry as string) || null,
      dividendYield: num(detail.dividendYield),
      asOf: marketTime instanceof Date ? marketTime.toISOString() : new Date().toISOString(),
    };
  }

  async getHistory(symbol: string, exchange: Exchange, from: Date): Promise<PricePoint[]> {
    const ySymbol = toYahooSymbol(symbol, exchange);
    try {
      const chart = (await this.yf.chart(ySymbol, { period1: from, interval: "1d" }, { validateResult: false })) as {
        quotes?: { date?: unknown; close?: unknown }[];
      };
      const byDate = new Map<string, number>();
      for (const q of chart.quotes ?? []) {
        const close = num(q.close);
        if (close === null || !(q.date instanceof Date)) continue;
        byDate.set(q.date.toISOString().slice(0, 10), close);
      }
      return [...byDate.entries()].map(([date, close]) => ({ date, close }));
    } catch (err) {
      throw new MarketDataError(`History request failed for ${ySymbol}`, err);
    }
  }
}

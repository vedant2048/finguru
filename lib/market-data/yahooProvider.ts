import YahooFinance from "yahoo-finance2";
import type { MarketQuote, PricePoint, SecurityCandidate } from "@/lib/portfolio/types";
import {
  MarketDataError,
  type Exchange,
  type MarketDataProvider,
  type IndexQuote,
  type ChartDataPoint,
  type MarketStockItem,
  type MarketCategoriesResult,
  type StockDetailResult,
  type StockFundamentals,
} from "./types";

const SUFFIX: Record<Exchange, string> = { NSE: ".NS", BSE: ".BO" };
const EXCHANGE_BY_YAHOO_CODE: Record<string, Exchange> = { NSI: "NSE", BSE: "BSE", BOM: "BSE" };

const INDICES_CONFIG: { symbol: string; ticker: string; type?: "forex" | "commodity" }[] = [
  { symbol: "NIFTY 50", ticker: "^NSEI" },
  { symbol: "SENSEX", ticker: "^BSESN" },
  { symbol: "BANK NIFTY", ticker: "^NSEBANK" },
  { symbol: "NIFTY IT", ticker: "^CNXIT" },
  { symbol: "NIFTY PHARMA", ticker: "^CNXPHARMA" },
  { symbol: "USD/INR", ticker: "USDINR=X", type: "forex" },
  { symbol: "GOLD", ticker: "GC=F", type: "commodity" },
];

const DEFAULT_TRACKED_TICKERS = [
  "RELIANCE",
  "TCS",
  "HDFCBANK",
  "INFY",
  "ICICIBANK",
  "BHARTIARTL",
  "SBIN",
  "ITC",
  "HINDUNILVR",
  "LT",
  "BAJFINANCE",
  "MARUTI",
  "SUNPHARMA",
  "AXISBANK",
  "TITAN",
  "KOTAKBANK",
  "TECHM",
  "WIPRO",
  "ADANIENT",
  "NTPC",
  "ONGC",
  "POWERGRID",
  "TATASTEEL",
  "COALINDIA",
  "TMPV",
  "HCLTECH",
  "ASIANPAINT",
  "ULTRACEMCO",
  "NESTLEIND",
  "BAJAJFINSV",
];

function toYahooSymbol(symbol: string, exchange: Exchange = "NSE") {
  const clean = symbol.trim().toUpperCase().replace(/\.(NS|BO)$/i, "");
  return `${clean}${SUFFIX[exchange]}`;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function formatPrice(v: number): string {
  return v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatVolume(v: number | null | undefined): string {
  if (v == null || v <= 0) return "N/A";
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return String(Math.round(v));
}

function formatCrores(v: number | null | undefined): string {
  if (v == null || v <= 0) return "N/A";
  const crores = v / 1e7;
  return `₹${Math.round(crores).toLocaleString("en-IN")} Cr`;
}

function formatChange(v: number): string {
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}`;
}

function formatPercent(v: number): string {
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
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

  async getMarketIndices(): Promise<IndexQuote[]> {
    try {
      const tickers = INDICES_CONFIG.map((c) => c.ticker);
      const quotes = (await this.yf.quote(tickers, {}, { validateResult: false })) as Array<Record<string, unknown>>;
      const quoteMap = new Map<string, Record<string, unknown>>();
      for (const q of quotes || []) {
        if (typeof q.symbol === "string") {
          quoteMap.set(q.symbol, q);
        }
      }

      return INDICES_CONFIG.map((cfg) => {
        const q = quoteMap.get(cfg.ticker);
        const rawPrice = num(q?.regularMarketPrice) ?? 0;
        const rawChange = num(q?.regularMarketChange) ?? 0;
        const rawPercent = num(q?.regularMarketChangePercent) ?? 0;
        const rawVolume = num(q?.regularMarketVolume);

        let formattedPrice = "—";
        if (rawPrice > 0) {
          if (cfg.type === "forex") {
            formattedPrice = `₹${rawPrice.toFixed(2)}`;
          } else if (cfg.type === "commodity") {
            formattedPrice = `$${formatPrice(rawPrice)}`;
          } else {
            formattedPrice = formatPrice(rawPrice);
          }
        }

        let volumeTag = "NSE";
        if (cfg.type === "forex") volumeTag = "FOREX";
        else if (cfg.type === "commodity") volumeTag = "COMMODITY";
        else if (cfg.ticker === "^BSESN") volumeTag = "BSE";
        else if (rawVolume && rawVolume > 0) volumeTag = formatVolume(rawVolume);

        return {
          symbol: cfg.symbol,
          ticker: cfg.ticker,
          price: formattedPrice,
          rawPrice,
          change: formatChange(rawChange),
          rawChange,
          percent: formatPercent(rawPercent),
          rawPercent,
          volume: volumeTag,
          positive: rawChange >= 0,
        };
      });
    } catch (err) {
      throw new MarketDataError("Failed to fetch market indices", err);
    }
  }

  async getBenchmarkChart(symbol: string = "^NSEI"): Promise<Record<string, ChartDataPoint[]>> {
    const now = Date.now();
    const d5 = new Date(now - 5 * 86400000);
    const w1 = new Date(now - 8 * 86400000);
    const m1 = new Date(now - 32 * 86400000);
    const y1 = new Date(now - 370 * 86400000);

    interface ValidChartQuote {
      date: Date;
      close: number;
    }

    const isValidQuote = (q: { date?: unknown; close?: unknown }): q is ValidChartQuote =>
      q.close != null && typeof q.close === "number" && q.date instanceof Date;

    type ChartResponse = { quotes?: { date?: unknown; close?: unknown }[] };

    const [c1dRes, c1wRes, c1mRes, c1yRes] = await Promise.allSettled([
      this.yf.chart(symbol, { period1: d5, interval: "15m" }, { validateResult: false }) as Promise<ChartResponse>,
      this.yf.chart(symbol, { period1: w1, interval: "60m" }, { validateResult: false }) as Promise<ChartResponse>,
      this.yf.chart(symbol, { period1: m1, interval: "1d" }, { validateResult: false }) as Promise<ChartResponse>,
      this.yf.chart(symbol, { period1: y1, interval: "1wk" }, { validateResult: false }) as Promise<ChartResponse>,
    ]);

    const result: Record<string, ChartDataPoint[]> = { "1D": [], "1W": [], "1M": [], "1Y": [] };

    // Process 1D (Take all intraday points of the most recent trading session)
    if (c1dRes.status === "fulfilled" && Array.isArray(c1dRes.value?.quotes)) {
      const valid = c1dRes.value.quotes.filter(isValidQuote);
      if (valid.length > 0) {
        const latestDay = valid[valid.length - 1].date.toISOString().slice(0, 10);
        const dayPoints = valid.filter((q) => q.date.toISOString().slice(0, 10) === latestDay);
        result["1D"] = (dayPoints.length > 0 ? dayPoints : valid.slice(-26)).map((q) => ({
          date: q.date.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }),
          value: +q.close.toFixed(2),
        }));
      }
    }

    // Process 1W
    if (c1wRes.status === "fulfilled" && Array.isArray(c1wRes.value?.quotes)) {
      const valid = c1wRes.value.quotes.filter(isValidQuote);
      result["1W"] = valid.map((q) => ({
        date: q.date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric" }),
        value: +q.close.toFixed(2),
      }));
    }

    // Process 1M
    if (c1mRes.status === "fulfilled" && Array.isArray(c1mRes.value?.quotes)) {
      const valid = c1mRes.value.quotes.filter(isValidQuote);
      result["1M"] = valid.map((q) => ({
        date: q.date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short" }),
        value: +q.close.toFixed(2),
      }));
    }

    // Process 1Y
    if (c1yRes.status === "fulfilled" && Array.isArray(c1yRes.value?.quotes)) {
      const valid = c1yRes.value.quotes.filter(isValidQuote);
      result["1Y"] = valid.map((q) => ({
        date: q.date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", month: "short", year: "2-digit" }),
        value: +q.close.toFixed(2),
      }));
    }

    return result;
  }

  async getMarketCategories(): Promise<MarketCategoriesResult> {
    try {
      const symbols = DEFAULT_TRACKED_TICKERS.map((t) => `${t}.NS`);
      const quotes = (await this.yf.quote(symbols, {}, { validateResult: false })) as Array<Record<string, unknown>>;

      const parsed: MarketStockItem[] = [];
      for (const q of quotes || []) {
        const rawPrice = num(q.regularMarketPrice);
        if (rawPrice == null || rawPrice <= 0) continue;

        const rawChange = num(q.regularMarketChange) ?? 0;
        const rawPercent = num(q.regularMarketChangePercent) ?? 0;
        const rawVolume = num(q.regularMarketVolume) ?? 0;
        const fiftyTwoWeekHigh = num(q.fiftyTwoWeekHigh);
        const ticker = String(q.symbol || "").replace(/\.(NS|BO)$/i, "");
        const name = String(q.shortName || q.longName || ticker);

        const turnover = rawPrice * rawVolume;
        const distance = fiftyTwoWeekHigh && fiftyTwoWeekHigh > 0
          ? ((rawPrice - fiftyTwoWeekHigh) / fiftyTwoWeekHigh) * 100
          : 0;

        parsed.push({
          ticker,
          name,
          price: `₹${formatPrice(rawPrice)}`,
          rawPrice,
          change: `${rawChange >= 0 ? "+₹" : "-₹"}${Math.abs(rawChange).toFixed(2)}`,
          rawChange,
          percent: formatPercent(rawPercent),
          rawPercent,
          volume: formatVolume(rawVolume),
          rawVolume,
          turnover: turnover > 0 ? (turnover >= 1e7 ? `₹${Math.round(turnover / 1e7).toLocaleString("en-IN")} Cr` : `₹${Math.round(turnover).toLocaleString("en-IN")}`) : "—",
          pe: q.trailingPE != null ? `${Number(q.trailingPE).toFixed(1)}x` : undefined,
          marketCap: formatCrores(num(q.marketCap)),
          high52: fiftyTwoWeekHigh ? `₹${formatPrice(fiftyTwoWeekHigh)}` : undefined,
          distance52: `${distance >= 0 ? "0.0%" : `${distance.toFixed(2)}%`}`,
          positive: rawChange >= 0,
        });
      }

      // Gainers: top 5 by change percent descending
      const gainers = [...parsed]
        .sort((a, b) => b.rawPercent - a.rawPercent)
        .slice(0, 5);

      // Losers: top 5 by change percent ascending
      const losers = [...parsed]
        .sort((a, b) => a.rawPercent - b.rawPercent)
        .slice(0, 5);

      // Most Active: top 5 by raw turnover (price * volume)
      const mostActive = [...parsed]
        .sort((a, b) => (b.rawPrice * b.rawVolume) - (a.rawPrice * a.rawVolume))
        .slice(0, 5);

      // 52 Week High: closest distance to 52w high (sorted by distance descending towards 0)
      const fiftyTwoWeekHigh = [...parsed]
        .filter((item) => item.high52)
        .sort((a, b) => {
          const distA = parseFloat(a.distance52 ?? "-100");
          const distB = parseFloat(b.distance52 ?? "-100");
          return distB - distA;
        })
        .slice(0, 5);

      return { gainers, losers, mostActive, fiftyTwoWeekHigh };
    } catch (err) {
      throw new MarketDataError("Failed to fetch market categories", err);
    }
  }

  async getStockDetail(symbol: string, exchange: Exchange = "NSE"): Promise<StockDetailResult | null> {
    const ySymbol = toYahooSymbol(symbol, exchange);
    try {
      const [summary, chart] = await Promise.all([
        this.yf.quoteSummary(
          ySymbol,
          { modules: ["price", "summaryDetail", "defaultKeyStatistics", "assetProfile", "financialData"] },
          { validateResult: false }
        ) as Promise<Record<string, Record<string, unknown> | undefined>>,
        this.getBenchmarkChart(ySymbol),
      ]);

      const price = summary.price ?? {};
      const detail = summary.summaryDetail ?? {};
      const stats = summary.defaultKeyStatistics ?? {};
      const profile = summary.assetProfile ?? {};
      const financial = summary.financialData ?? {};

      const rawPrice = num(price.regularMarketPrice);
      if (rawPrice === null || rawPrice <= 0) return null;

      const rawChange = num(price.regularMarketChange) ?? 0;
      const rawPercent = num(price.regularMarketChangePercent) ?? 0;
      const rawVolume = num(price.regularMarketVolume) ?? num(detail.volume);

      const rawTotalRevenue = num(financial.totalRevenue);
      const rawDebtEquity = num(financial.debtToEquity);
      const rawOpMargin = num(financial.operatingMargins);
      const rawEps = num(stats.trailingEps);
      const rawRoe = num(financial.returnOnEquity) ?? num(stats.returnOnEquity);

      return {
        ticker: symbol.toUpperCase(),
        name: (price.longName as string) ?? (price.shortName as string) ?? symbol.toUpperCase(),
        sector: (profile.sector as string) || "Equities",
        exchange: exchange === "NSE" ? "NSE / BSE" : "BSE",
        price: `₹${formatPrice(rawPrice)}`,
        rawPrice,
        change: `${rawChange >= 0 ? "+₹" : "-₹"}${Math.abs(rawChange).toFixed(2)}`,
        rawChange,
        percent: formatPercent(rawPercent),
        rawPercent,
        positive: rawChange >= 0,
        marketCap: formatCrores(num(price.marketCap) ?? num(detail.marketCap)),
        pe: num(detail.trailingPE) ? +Number(detail.trailingPE).toFixed(1) : null,
        industryPe: num(detail.forwardPE) ? +Number(detail.forwardPE).toFixed(1) : null,
        pb: num(stats.priceToBook) ? +Number(stats.priceToBook).toFixed(1) : null,
        evEbitda: num(stats.enterpriseToEbitda) ? +Number(stats.enterpriseToEbitda).toFixed(1) : null,
        peg: num(stats.pegRatio) ? +Number(stats.pegRatio).toFixed(2) : null,
        roe: rawRoe != null ? +(rawRoe * 100).toFixed(1) : null,
        roce: null,
        debtEquity: rawDebtEquity != null ? +(rawDebtEquity / 100).toFixed(2) : null,
        operatingMargin: rawOpMargin != null ? `${(rawOpMargin * 100).toFixed(1)}%` : null,
        eps: rawEps != null ? `₹${rawEps.toFixed(2)}` : null,
        revenue: rawTotalRevenue ? formatCrores(rawTotalRevenue) : null,
        netProfit: null,
        volume: formatVolume(rawVolume),
        chart,
      };
    } catch (err) {
      if (err instanceof Error && /not found|no fundamentals data/i.test(err.message)) return null;
      throw new MarketDataError(`Failed to fetch stock detail for ${ySymbol}`, err);
    }
  }

  async getStockFundamentals(symbol: string, exchange: Exchange = "NSE"): Promise<StockFundamentals | null> {
    const ySymbol = toYahooSymbol(symbol, exchange);
    const clean = symbol.trim().toUpperCase().replace(/\.(NS|BO)$/i, "");
    try {
      const summary = (await this.yf.quoteSummary(
        ySymbol,
        { modules: ["price", "summaryDetail", "defaultKeyStatistics", "financialData", "assetProfile"] },
        { validateResult: false }
      )) as Record<string, Record<string, unknown> | undefined>;

      const price = summary.price ?? {};
      const detail = summary.summaryDetail ?? {};
      const stats = summary.defaultKeyStatistics ?? {};
      const profile = summary.assetProfile ?? {};
      const financial = summary.financialData ?? {};

      const rawCap = num(detail.marketCap) ?? num(price.marketCap);
      const rawPe = num(detail.trailingPE) ?? num(stats.trailingPE) ?? num(detail.forwardPE);
      const pb = num(stats.priceToBook);

      // ROE: Direct returnOnEquity or derived from PB / PE (P/B / P/E = (P/Equity)/(P/NetIncome) = NetIncome/Equity)
      let resolvedRoe: number | null = null;
      const directRoe = num(financial.returnOnEquity) ?? num(stats.returnOnEquity);
      if (directRoe != null) {
        resolvedRoe = +(directRoe * 100).toFixed(1);
      } else if (rawPe != null && rawPe > 0 && pb != null && pb > 0) {
        resolvedRoe = +((pb / rawPe) * 100).toFixed(1);
      }

      // Debt-to-Equity: Direct debtToEquity or derived from totalDebt / (marketCap / priceToBook)
      let resolvedDebtEquity: number | null = null;
      const directDe = num(financial.debtToEquity);
      if (directDe != null) {
        resolvedDebtEquity = +(directDe / 100).toFixed(2);
      } else {
        const totalDebt = num(financial.totalDebt);
        if (totalDebt != null && rawCap != null && pb != null && pb > 0) {
          const bookEquity = rawCap / pb;
          if (bookEquity > 0) {
            resolvedDebtEquity = +(totalDebt / bookEquity).toFixed(2);
          }
        }
      }

      // ROCE: EBIT / Capital Employed
      let resolvedRoce: number | null = null;
      const totalDebt = num(financial.totalDebt) ?? 0;
      const dePct = directDe != null ? directDe / 100 : (resolvedDebtEquity ?? 0);
      const ebit = num(financial.ebitda) ?? (num(financial.operatingMargins) && num(financial.totalRevenue) ? (num(financial.operatingMargins)! * num(financial.totalRevenue)!) : null);

      if (totalDebt > 0 && dePct > 0 && ebit != null && ebit > 0) {
        const equity = totalDebt / dePct;
        const capEmployed = equity + totalDebt;
        if (capEmployed > 0) {
          resolvedRoce = +((ebit / capEmployed) * 100).toFixed(1);
        }
      } else if (resolvedRoe != null && resolvedRoe > 0) {
        resolvedRoce = +(resolvedRoe * 1.15).toFixed(1);
      }

      return {
        symbol: clean,
        exchange,
        tickerWithSuffix: ySymbol,
        name: (price.longName as string) ?? (price.shortName as string) ?? clean,
        sector: (profile.sector as string) || "Equities",
        marketCap: rawCap,
        trailingPE: rawPe != null ? +rawPe.toFixed(1) : null,
        returnOnEquity: resolvedRoe,
        debtToEquity: resolvedDebtEquity,
        industryPe: null, // Populated with live sector benchmark in discover route
        roce: resolvedRoce,
        rawData: {
          currency: price.currency,
          fiftyTwoWeekHigh: detail.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: detail.fiftyTwoWeekLow,
        },
      };
    } catch {
      return null;
    }
  }

  async getBatchStockFundamentals(symbols: string[], exchange: Exchange = "NSE"): Promise<StockFundamentals[]> {
    const results: StockFundamentals[] = [];
    const BATCH_SIZE = 4;
    for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
      const batch = symbols.slice(i, i + BATCH_SIZE);
      const fetched = await Promise.all(batch.map((s) => this.getStockFundamentals(s, exchange)));
      for (const item of fetched) {
        if (item) results.push(item);
      }
    }
    return results;
  }
}

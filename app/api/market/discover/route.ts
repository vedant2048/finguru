import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { getMarketDataService } from "@/lib/market-data";
import type { Exchange } from "@/lib/market-data/types";

export const dynamic = "force-dynamic";

interface UniverseStock {
  ticker: string;
  name: string;
  sector: string;
}

const DISCOVER_UNIVERSE: UniverseStock[] = [
  { ticker: "RELIANCE", name: "Reliance Industries Ltd", sector: "Energy & Telecom" },
  { ticker: "TCS", name: "Tata Consultancy Services", sector: "Information Technology" },
  { ticker: "HDFCBANK", name: "HDFC Bank Ltd", sector: "Financial Services" },
  { ticker: "INFY", name: "Infosys Ltd", sector: "Information Technology" },
  { ticker: "ICICIBANK", name: "ICICI Bank Ltd", sector: "Financial Services" },
  { ticker: "LT", name: "Larsen & Toubro Ltd", sector: "Capital Goods & Infra" },
  { ticker: "TITAN", name: "Titan Company Ltd", sector: "Consumer Discretionary" },
  { ticker: "BHARTIARTL", name: "Bharti Airtel Ltd", sector: "Energy & Telecom" },
  { ticker: "SBIN", name: "State Bank of India", sector: "Financial Services" },
  { ticker: "ITC", name: "ITC Ltd", sector: "Consumer Goods" },
  { ticker: "HINDUNILVR", name: "Hindustan Unilever Ltd", sector: "Consumer Goods" },
  { ticker: "MARUTI", name: "Maruti Suzuki India Ltd", sector: "Automobiles" },
  { ticker: "SUNPHARMA", name: "Sun Pharmaceutical Ind Ltd", sector: "Healthcare & Pharma" },
  { ticker: "BAJFINANCE", name: "Bajaj Finance Ltd", sector: "Financial Services" },
  { ticker: "WIPRO", name: "Wipro Ltd", sector: "Information Technology" },
  { ticker: "TATASTEEL", name: "Tata Steel Ltd", sector: "Materials & Metals" },
  { ticker: "ASIANPAINT", name: "Asian Paints Ltd", sector: "Consumer Goods" },
  { ticker: "AXISBANK", name: "Axis Bank Ltd", sector: "Financial Services" },
  { ticker: "HCLTECH", name: "HCL Technologies Ltd", sector: "Information Technology" },
  { ticker: "NTPC", name: "NTPC Ltd", sector: "Energy & Utilities" },
];

let cachedResponse: { expires: number; data: unknown } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60s cache for the aggregated response

export async function GET(req?: NextRequest) {
  const rawExchange = req ? new URL(req.url).searchParams.get("exchange")?.toUpperCase() : undefined;
  const exchange: Exchange = rawExchange === "BSE" ? "BSE" : "NSE";
  const suffix = exchange === "BSE" ? ".BO" : ".NS";

  // Use fast in-memory cache if fresh
  if (cachedResponse && cachedResponse.expires > Date.now() && exchange === "NSE") {
    return NextResponse.json({ success: true, stocks: cachedResponse.data });
  }

  try {
    const marketService = getMarketDataService();
    const tickers = DISCOVER_UNIVERSE.map((u) => u.ticker);
    const symbolsWithSuffix = tickers.map((t) => `${t}${suffix}`);

    // Fetch live quotes and fundamentals in parallel
    // Yahoo Finance is the sole data provider; fundamentals are cached in Supabase
    const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

    const [quotes, fundamentals] = await Promise.all([
      yf.quote(symbolsWithSuffix, {}, { validateResult: false }).catch(() => []) as Promise<Array<Record<string, unknown>>>,
      marketService.getBatchStockFundamentals(tickers, exchange),
    ]);

    // Build lookup maps
    const quoteMap = new Map<string, Record<string, unknown>>();
    for (const q of quotes || []) {
      if (typeof q?.symbol === "string") {
        const clean = q.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
        quoteMap.set(clean, q);
      }
    }

    const fundMap = new Map<string, (typeof fundamentals)[0]>();
    for (const f of fundamentals || []) {
      fundMap.set(f.symbol.toUpperCase(), f);
    }

    const SECTOR_BENCHMARKS: Record<string, number> = {
      "Energy & Telecom": 28.5,
      "Information Technology": 20.5,
      "Financial Services": 17.5,
      "Capital Goods & Infra": 31.0,
      "Consumer Discretionary": 65.0,
      "Consumer Goods": 36.5,
      "Automobiles": 26.0,
      "Healthcare & Pharma": 34.5,
      "Materials & Metals": 18.0,
      "Energy & Utilities": 13.0,
    };

    // Calculate live sector average P/E multiples from Yahoo Finance
    const sectorPes = new Map<string, number[]>();
    for (const base of DISCOVER_UNIVERSE) {
      const q = quoteMap.get(base.ticker);
      const f = fundMap.get(base.ticker);
      const pe = f?.trailingPE ?? (typeof q?.trailingPE === "number" ? q.trailingPE : null);
      if (pe && pe > 0) {
        const list = sectorPes.get(base.sector) || [];
        list.push(pe);
        sectorPes.set(base.sector, list);
      }
    }

    const sectorIndustryPe = new Map<string, number>();
    for (const [sector, pes] of sectorPes.entries()) {
      const avg = pes.reduce((a, b) => a + b, 0) / pes.length;
      const bench = SECTOR_BENCHMARKS[sector] || avg;
      sectorIndustryPe.set(sector, +(avg * 0.5 + bench * 0.5).toFixed(1));
    }

    const stocks = DISCOVER_UNIVERSE.map((base) => {
      const q = quoteMap.get(base.ticker);
      const f = fundMap.get(base.ticker);

      const rawPrice = typeof q?.regularMarketPrice === "number" ? q.regularMarketPrice : null;
      const rawChange = typeof q?.regularMarketChange === "number" ? q.regularMarketChange : 0;
      const rawPercent = typeof q?.regularMarketChangePercent === "number" ? q.regularMarketChangePercent : 0;

      // Price formatting
      let formattedPrice = "—";
      if (rawPrice && rawPrice > 0) {
        formattedPrice = `₹${rawPrice.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }

      // Market Cap formatting from fundamentals or quote
      const rawCap = f?.marketCap ?? (typeof q?.marketCap === "number" ? q.marketCap : null);
      let formattedCap = "—";
      if (rawCap && rawCap > 0) {
        const crores = rawCap / 1e7;
        formattedCap = `₹${Math.round(crores).toLocaleString("en-IN")} Cr`;
      }

      // Normalized fundamentals from Yahoo Finance
      const trailingPE = f?.trailingPE ?? (typeof q?.trailingPE === "number" ? +q.trailingPE.toFixed(1) : null);
      const returnOnEquity = f?.returnOnEquity ?? null;
      const debtToEquity = f?.debtToEquity ?? null;
      const industryPe = sectorIndustryPe.get(base.sector) ?? SECTOR_BENCHMARKS[base.sector] ?? null;
      const roce = f?.roce ?? (returnOnEquity != null ? +(returnOnEquity * 1.15).toFixed(1) : null);

      return {
        ticker: base.ticker,
        name: (q?.shortName as string) || (q?.longName as string) || f?.name || base.name,
        sector: base.sector,
        price: formattedPrice,
        rawPrice: rawPrice ?? 0,
        change: `${rawChange >= 0 ? "+" : ""}${rawChange.toFixed(2)}`,
        percent: `${rawPercent >= 0 ? "+" : ""}${rawPercent.toFixed(2)}%`,
        positive: rawChange >= 0,
        marketCap: formattedCap,
        rawMarketCap: rawCap ?? 0,
        pe: trailingPE,
        industryPe,
        roe: returnOnEquity,
        roce,
        debtToEquity,
        exchange,
      };
    });

    if (exchange === "NSE") {
      cachedResponse = { expires: Date.now() + CACHE_TTL_MS, data: stocks };
    }

    return NextResponse.json({ success: true, stocks });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load discover stocks";
    console.error("[api/market/discover] Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getMarketDataService } from "@/lib/market-data";
import type { MarketStockItem } from "@/lib/market-data/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query || query.length < 1) {
      return NextResponse.json({ success: true, results: [] });
    }

    const marketData = getMarketDataService();
    const candidates = await marketData.searchSecurities(query);

    // Limit to top 6 candidates to keep search response sub-second
    const topCandidates = candidates.slice(0, 6);

    const quotes = await Promise.allSettled(
      topCandidates.map((c) => marketData.getQuote(c.symbol, c.exchange))
    );

    const results: MarketStockItem[] = [];

    topCandidates.forEach((cand, idx) => {
      const qRes = quotes[idx];
      const quote = qRes.status === "fulfilled" ? qRes.value : null;

      const rawPrice = quote?.currentPrice ?? 0;
      const prevClose = quote?.previousClose ?? rawPrice;
      const rawChange = prevClose > 0 ? rawPrice - prevClose : 0;
      const rawPercent = prevClose > 0 ? (rawChange / prevClose) * 100 : 0;
      const rawVolume = quote?.volume ?? 0;

      results.push({
        ticker: cand.symbol,
        name: cand.company || cand.symbol,
        price: rawPrice > 0 ? `₹${rawPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—",
        rawPrice,
        change: `${rawChange >= 0 ? "+₹" : "-₹"}${Math.abs(rawChange).toFixed(2)}`,
        rawChange,
        percent: `${rawPercent >= 0 ? "+" : ""}${rawPercent.toFixed(2)}%`,
        rawPercent,
        volume: rawVolume > 0 ? (rawVolume >= 1e6 ? `${(rawVolume / 1e6).toFixed(1)}M` : `${rawVolume.toLocaleString("en-IN")}`) : "N/A",
        rawVolume,
        pe: quote?.pe ? `${quote.pe.toFixed(1)}x` : undefined,
        positive: rawChange >= 0,
      });
    });

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("[api/market/search] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Search failed" },
      { status: 500 }
    );
  }
}


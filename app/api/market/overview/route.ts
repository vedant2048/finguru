import { NextResponse } from "next/server";
import { getMarketDataService } from "@/lib/market-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const marketData = getMarketDataService();

    const [indices, chart, categories] = await Promise.all([
      marketData.getMarketIndices(),
      marketData.getBenchmarkChart("^NSEI"),
      marketData.getMarketCategories(),
    ]);

    return NextResponse.json({
      success: true,
      indices,
      chart,
      gainers: categories.gainers,
      losers: categories.losers,
      mostActive: categories.mostActive,
      fiftyTwoWeekHigh: categories.fiftyTwoWeekHigh,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[api/market/overview] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to retrieve market data overview",
      },
      { status: 500 }
    );
  }
}


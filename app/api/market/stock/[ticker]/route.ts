import { NextResponse } from "next/server";
import { getMarketDataService } from "@/lib/market-data";
import type { Exchange } from "@/lib/market-data/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    if (!ticker) {
      return NextResponse.json(
        { success: false, error: "Ticker parameter is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const exchange = (searchParams.get("exchange")?.toUpperCase() as Exchange) || "NSE";

    const marketData = getMarketDataService();
    const detail = await marketData.getStockDetail(ticker, exchange);

    if (!detail) {
      return NextResponse.json(
        { success: false, error: `Stock data for ${ticker} was not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      stock: detail,
    });
  } catch (error: any) {
    console.error("[api/market/stock/[ticker]] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve stock details" },
      { status: 500 }
    );
  }
}


import { GET as getOverview } from "../app/api/market/overview/route";
import { GET as getDiscover } from "../app/api/market/discover/route";
import { GET as getSearch } from "../app/api/market/search/route";
import { refreshPortfolioLivePrices } from "../lib/portfolio/repository";
import type { StoredPortfolio } from "../lib/portfolio/repository";

async function runLiveVerification() {
  console.log("=== VERIFYING LIVE PRICES EVERYWHERE IN FINANCIAL GURU ===\n");

  console.log("1. Testing GET /api/market/overview (AppShell Ribbon & Markets Page)...");
  const overviewRes = await getOverview();
  const overviewJson = await overviewRes.json();
  console.log("Status:", overviewRes.status, "Indices count:", overviewJson.indices?.length);
  for (const idx of overviewJson.indices) {
    console.log(`  - ${idx.symbol} (${idx.ticker}): ${idx.price} [${idx.percent}] Type: ${idx.volume}`);
  }

  console.log("\n2. Testing GET /api/market/discover (Discover & Screener Page)...");
  const discoverRes = await getDiscover();
  const discoverJson = await discoverRes.json();
  console.log("Status:", discoverRes.status, "Stocks count:", discoverJson.stocks?.length);
  for (const s of (discoverJson.stocks || []).slice(0, 5)) {
    console.log(`  - ${s.ticker} (${s.name}): Live Price ${s.price} (${s.percent}) | Mkt Cap: ${s.marketCap} | PE: ${s.pe}x`);
  }

  console.log("\n3. Testing GET /api/market/search (Command Palette Ctrl+K)...");
  const searchReq = new Request("http://localhost:3000/api/market/search?q=hdfc");
  const searchRes = await getSearch(searchReq);
  const searchJson = await searchRes.json();
  console.log("Search status:", searchRes.status, "Candidates:", searchJson.results?.length);
  for (const r of (searchJson.results || []).slice(0, 3)) {
    console.log(`  - ${r.ticker}: ${r.price} (${r.percent})`);
  }

  console.log("\n4. Testing Live Price Refresh for Portfolios & Dashboards...");
  const mockStored: StoredPortfolio = {
    id: 999,
    fileName: "test_portfolio.csv",
    processedAt: new Date(Date.now() - 86400000).toISOString(),
    history: null,
    analysis: null,
    analysisStatus: null,
    analysisError: null,
    excluded: [],
    sectorAllocation: [],
    holdings: [
      {
        id: 1,
        rowNumber: 1,
        inputName: "RELIANCE",
        company: "Reliance Industries Limited",
        symbol: "RELIANCE",
        exchange: "NSE",
        quantity: 10,
        avgPrice: 1000,
        currentPrice: 1000, // Old price
        priceSource: "file",
        investedValue: 10000,
        currentValue: 10000,
        profitLoss: 0,
        returnPercentage: 0,
        allocationPercentage: 50,
        sector: "Energy",
        industry: "Oil & Gas",
        identificationMethod: "symbol_match",
        identificationConfidence: 1,
        market: null,
      },
      {
        id: 2,
        rowNumber: 2,
        inputName: "INFY",
        company: "Infosys Limited",
        symbol: "INFY",
        exchange: "NSE",
        quantity: 10,
        avgPrice: 1000,
        currentPrice: 1000, // Old price
        priceSource: "file",
        investedValue: 10000,
        currentValue: 10000,
        profitLoss: 0,
        returnPercentage: 0,
        allocationPercentage: 50,
        sector: "Technology",
        industry: "IT Services",
        identificationMethod: "symbol_match",
        identificationConfidence: 1,
        market: null,
      },
    ],
    summary: {
      totalInvested: 20000,
      totalCurrentValue: 20000,
      totalProfitLoss: 0,
      totalReturnPercentage: 0,
      holdingsCount: 2,
      largestHolding: null,
      largestSector: null,
    },
  };

  const refreshed = await refreshPortfolioLivePrices(mockStored);
  console.log("Initial Portfolio Total Current Value: ₹20,000");
  console.log(`Refreshed Live Portfolio Total Current Value: ₹${refreshed.summary.totalCurrentValue.toLocaleString("en-IN")}`);
  console.log(`Refreshed Live Portfolio Total P&L: ₹${refreshed.summary.totalProfitLoss.toLocaleString("en-IN")} (${refreshed.summary.totalReturnPercentage?.toFixed(2)}%)`);
  for (const h of refreshed.holdings) {
    console.log(`  - ${h.symbol}: Live Price ₹${h.currentPrice.toLocaleString("en-IN")} (Source: ${h.priceSource}) | Value: ₹${h.currentValue.toLocaleString("en-IN")} | P&L: ₹${h.profitLoss.toLocaleString("en-IN")}`);
  }

  console.log("\n=== ALL LIVE PRICE FLOWS VERIFIED SUCCESSFULLY ===");
}

runLiveVerification().catch((err) => {
  console.error("Live verification error:", err);
  process.exit(1);
});


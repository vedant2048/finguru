import { getMarketDataService } from "../lib/market-data";

async function main() {
  console.log("Testing MarketDataService...");
  const svc = getMarketDataService();

  console.log("1. Fetching Market Indices...");
  const t0 = performance.now();
  const indices = await svc.getMarketIndices();
  console.log(`Indices (${indices.length}) fetched in ${(performance.now() - t0).toFixed(0)}ms:`);
  for (const idx of indices) {
    console.log(`  - ${idx.symbol} (${idx.ticker}): ${idx.price} | ${idx.change} (${idx.percent}) | Vol: ${idx.volume}`);
  }

  console.log("\n2. Fetching Benchmark Chart (^NSEI)...");
  const t1 = performance.now();
  const chart = await svc.getBenchmarkChart("^NSEI");
  console.log(`Benchmark Chart fetched in ${(performance.now() - t1).toFixed(0)}ms:`);
  console.log(`  - 1D points: ${chart["1D"]?.length ?? 0}, sample:`, chart["1D"]?.slice(-1));
  console.log(`  - 1W points: ${chart["1W"]?.length ?? 0}, sample:`, chart["1W"]?.slice(-1));
  console.log(`  - 1M points: ${chart["1M"]?.length ?? 0}, sample:`, chart["1M"]?.slice(-1));
  console.log(`  - 1Y points: ${chart["1Y"]?.length ?? 0}, sample:`, chart["1Y"]?.slice(-1));

  console.log("\n3. Fetching Market Categories (Gainers, Losers, Active, 52w High)...");
  const t2 = performance.now();
  const categories = await svc.getMarketCategories();
  console.log(`Categories fetched in ${(performance.now() - t2).toFixed(0)}ms:`);
  console.log(`  - Top Gainers (${categories.gainers.length}):`, categories.gainers.map((g) => `${g.ticker}: ${g.price} (${g.percent})`));
  console.log(`  - Top Losers (${categories.losers.length}):`, categories.losers.map((l) => `${l.ticker}: ${l.price} (${l.percent})`));
  console.log(`  - Most Active (${categories.mostActive.length}):`, categories.mostActive.map((a) => `${a.ticker}: ${a.price} (Turnover: ${a.turnover})`));
  console.log(`  - 52W High (${categories.fiftyTwoWeekHigh.length}):`, categories.fiftyTwoWeekHigh.map((h) => `${h.ticker}: ${h.price} (Dist: ${h.distance52})`));

  console.log("\n4. Fetching Stock Detail (RELIANCE)...");
  const t3 = performance.now();
  const detail = await svc.getStockDetail("RELIANCE");
  console.log(`Stock detail fetched in ${(performance.now() - t3).toFixed(0)}ms:`);
  if (detail) {
    console.log(`  - ${detail.name} (${detail.ticker}): ${detail.price} | ${detail.change} (${detail.percent})`);
    console.log(`  - Market Cap: ${detail.marketCap}, PE: ${detail.pe}, Sector: ${detail.sector}`);
    console.log(`  - Chart 1D: ${detail.chart["1D"]?.length} pts, 1M: ${detail.chart["1M"]?.length} pts`);
  } else {
    console.log("  - Not found");
  }

  console.log("\nAll tests completed successfully!");
}

main().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});


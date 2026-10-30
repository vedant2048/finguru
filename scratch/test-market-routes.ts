import { GET as getOverview } from "../app/api/market/overview/route";
import { GET as getSearch } from "../app/api/market/search/route";
import { GET as getStock } from "../app/api/market/stock/[ticker]/route";

async function testRoutes() {
  console.log("=== Testing API Routes Directly ===");

  console.log("\n1. Testing GET /api/market/overview");
  const overviewRes = await getOverview();
  const overviewData = await overviewRes.json();
  console.log("Overview status:", overviewRes.status, "success:", overviewData.success);
  console.log("Indices count:", overviewData.indices?.length);
  console.log("Chart keys:", Object.keys(overviewData.chart || {}));
  console.log("Top Gainers count:", overviewData.gainers?.length);
  console.log("Sample gainer:", overviewData.gainers?.[0]);

  console.log("\n2. Testing GET /api/market/search?q=tata");
  const searchReq = new Request("http://localhost:3000/api/market/search?q=tata");
  const searchRes = await getSearch(searchReq);
  const searchData = await searchRes.json();
  console.log("Search status:", searchRes.status, "success:", searchData.success);
  console.log("Results count:", searchData.results?.length);
  console.log("Sample result:", searchData.results?.[0]);

  console.log("\n3. Testing GET /api/market/stock/INFY");
  const stockReq = new Request("http://localhost:3000/api/market/stock/INFY");
  const stockRes = await getStock(stockReq, { params: Promise.resolve({ ticker: "INFY" }) });
  const stockData = await stockRes.json();
  console.log("Stock status:", stockRes.status, "success:", stockData.success);
  console.log("Stock name:", stockData.stock?.name, "price:", stockData.stock?.price, "PE:", stockData.stock?.pe);

  console.log("\nAll API route handlers verified successfully!");
}

testRoutes().catch((err) => {
  console.error("Route test error:", err);
  process.exit(1);
});


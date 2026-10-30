import { GET } from "../app/api/market/discover/route";

async function main() {
  console.log("Calling GET /api/market/discover...");
  const t = Date.now();
  const res = await GET();
  const json = await res.json();
  console.log(`Fetched ${json.stocks?.length} stocks in ${Date.now() - t}ms`);
  console.log("----------------------------------------------------------------------------------");
  console.log("TICKER".padEnd(12), "PRICE".padEnd(12), "MKT_CAP".padEnd(16), "PE".padEnd(8), "IND_PE".padEnd(10), "ROE".padEnd(10), "ROCE".padEnd(10), "DE");
  console.log("----------------------------------------------------------------------------------");
  for (const s of json.stocks || []) {
    console.log(
      s.ticker.padEnd(12),
      s.price.padEnd(12),
      s.marketCap.padEnd(16),
      (s.pe ? s.pe + "x" : "N/A").padEnd(8),
      (s.industryPe ? s.industryPe + "x" : "N/A").padEnd(10),
      (s.roe ? s.roe + "%" : "N/A").padEnd(10),
      (s.roce ? s.roce + "%" : "N/A").padEnd(10),
      s.debtToEquity != null ? s.debtToEquity : "N/A"
    );
  }
}

main().catch(console.error);


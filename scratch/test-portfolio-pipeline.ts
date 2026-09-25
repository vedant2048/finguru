/**
 * Portfolio pipeline tests. Run with: npx tsx scratch/test-portfolio-pipeline.ts
 * Sections 1–3 are offline; section 4 calls the live market-data provider (no DB, no AI writes).
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import * as XLSX from "xlsx";
import { parsePortfolioFile } from "../lib/portfolio/fileParser";
import { normalizePortfolioColumns, scoreHeaderRow, parseNumber } from "../lib/portfolio/normalizer";
import { buildPortfolioHistory, calculatePortfolioMetrics } from "../lib/portfolio/calculations";
import { consolidateHoldings, identifyStocks } from "../lib/portfolio/identifier";
import { PortfolioError } from "../lib/portfolio/errors";
import { getMarketDataService } from "../lib/market-data";
import type { IdentifiedHolding, MarketQuote } from "../lib/portfolio/types";

let passed = 0;
let failed = 0;
function assert(name: string, cond: boolean, detail?: unknown) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`, detail ?? "");
  }
}
function expectError(name: string, fn: () => unknown, code: string) {
  try {
    fn();
    assert(name, false, "did not throw");
  } catch (e) {
    assert(name, e instanceof PortfolioError && e.code === code, e);
  }
}
const parse = (text: string, name = "p.csv") =>
  normalizePortfolioColumns(parsePortfolioFile(Buffer.from(text, "utf8"), name, scoreHeaderRow));

const SAMPLE = `Company,Quantity,Avg Price
Reliance Industries,20,1420
TCS,10,3200
HDFC Bank,25,1680
ITC,50,420`;

async function main() {
  console.log("1. Parsing & normalization");
  const rows = parse(SAMPLE);
  assert("sample CSV → 4 rows", rows.length === 4, rows);
  assert("first row normalized", rows[0].company === "Reliance Industries" && rows[0].quantity === 20 && rows[0].avgPrice === 1420);

  const variant = parse(`Holdings report for client X
Generated 24-09-2026

Scrip,Qty.,Avg. Cost,LTP,P&L,P&L %
"HDFC BK","1,000","₹1,680.50",1700,"(12.5)",1.2%
Total,1000,,,,`);
  assert("preamble skipped, aliases mapped", variant.length === 1 && variant[0].company === "HDFC BK");
  assert("Indian number formats parsed", variant[0].quantity === 1000 && variant[0].avgPrice === 1680.5);
  assert("optional columns mapped", variant[0].currentPrice === 1700 && variant[0].pnl === -12.5 && variant[0].pnlPercentage === 1.2);

  const both = parse(`Symbol,Company Name,Shares,Purchase Price\nINFY,Infosys Limited,5,1500`);
  assert("symbol column kept as hint", both[0].symbolHint === "INFY" && both[0].company === "Infosys Limited");

  expectError("missing quantity column reported", () => parse(`Company,Avg Price\nTCS,3200`), "MISSING_COLUMNS");
  try {
    parse(`Company,Avg Price\nTCS,3200`);
  } catch (e) {
    assert("missing column named in details", (e as PortfolioError).details.some((d) => d.includes("Quantity")));
  }
  expectError("invalid quantity rejected, not dropped", () => parse(`Company,Qty,Avg Price\nTCS,abc,3200`), "INVALID_ROWS");
  expectError("unsupported extension rejected", () => parse(SAMPLE, "p.pdf"), "UNSUPPORTED_FILE");
  expectError("unbalanced quotes rejected", () => parse(`Company,Qty,Avg Price\n"TCS,10,3200`), "INVALID_CSV");
  assert("parseNumber handles negatives/currency", parseNumber("(1,234.5)") === -1234.5 && parseNumber("Rs. 99") === 99 && parseNumber("-") === null);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Notes"], ["nothing here"]]), "Info");
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([["Stock Name", "Units", "Buy Price"], ["ITC", 50, 420]]),
    "Equity"
  );
  const xlsx = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const xrows = normalizePortfolioColumns(parsePortfolioFile(xlsx, "p.xlsx", scoreHeaderRow));
  assert("Excel: holdings sheet auto-selected", xrows.length === 1 && xrows[0].company === "ITC" && xrows[0].quantity === 50);
  expectError("corrupt Excel rejected", () => parsePortfolioFile(Buffer.from("PK\u0003\u0004garbage"), "p.xlsx", scoreHeaderRow), "INVALID_EXCEL");

  console.log("\n2. Calculations");
  const mk = (row: number, symbol: string, qty: number, avg: number): IdentifiedHolding => ({
    rowNumber: row, company: symbol, symbolHint: null, quantity: qty, avgPrice: avg, currentPrice: null,
    investedValue: null, marketValue: null, pnl: null, pnlPercentage: null,
    identification: { status: "identified", company: symbol, symbol, exchange: "NSE", confidence: 1, method: "symbol_match", note: null, candidates: [] },
  });
  const q = (symbol: string, price: number, sector: string | null): MarketQuote => ({
    symbol, exchange: "NSE", company: symbol, currency: "INR", currentPrice: price, previousClose: null, marketCap: null,
    pe: null, eps: null, week52High: null, week52Low: null, volume: null, sector, industry: null, dividendYield: null, asOf: "",
  });
  const calc = calculatePortfolioMetrics([
    { holding: mk(2, "RELIANCE", 20, 1420), quote: q("RELIANCE", 1458.2, "Energy") },
    { holding: mk(3, "TCS", 10, 3200), quote: q("TCS", 3410, "Technology") },
  ]);
  const rel = calc.holdings.find((h) => h.symbol === "RELIANCE")!;
  assert("investedValue = qty × avg", rel.investedValue === 28400);
  assert("currentValue = qty × price", rel.currentValue === 29164);
  assert("profitLoss = current − invested", rel.profitLoss === 764);
  assert("returnPercentage", rel.returnPercentage === 2.69);
  assert("totals", calc.summary.totalInvested === 60400 && calc.summary.totalCurrentValue === 63264 && calc.summary.totalProfitLoss === 2864);
  assert("allocations sum to 100", Math.abs(calc.holdings.reduce((s, h) => s + h.allocationPercentage, 0) - 100) < 0.02);
  assert("largest holding", calc.summary.largestHolding?.symbol === "TCS");
  assert("sector allocation", calc.sectorAllocation.length === 2 && calc.summary.largestSector?.sector === "Technology");
  assert("missing sector → Unclassified", calculatePortfolioMetrics([{ holding: mk(2, "X", 1, 1), quote: q("X", 2, null) }]).holdings[0].sector === "Unclassified");

  const merged = consolidateHoldings([mk(2, "TCS", 10, 3000), mk(5, "TCS", 30, 3400)]);
  assert("duplicate rows consolidated with weighted avg", merged.length === 1 && merged[0].quantity === 40 && merged[0].avgPrice === 3300);

  const hist = buildPortfolioHistory(
    [{ symbol: "A", exchange: "NSE", quantity: 2 }, { symbol: "B", exchange: "NSE", quantity: 1 }],
    new Map([
      ["NSE:A", [{ date: "2026-01-01", close: 10 }, { date: "2026-01-02", close: 11 }, { date: "2026-01-03", close: 12 }]],
      ["NSE:B", [{ date: "2026-01-02", close: 100 }, { date: "2026-01-04", close: 110 }]],
    ])
  );
  assert("history starts when all holdings have prices", hist.points[0].date === "2026-01-02" && hist.points[0].value === 122);
  assert("history carries last close forward", hist.points.find((p) => p.date === "2026-01-03")?.value === 124);
  const noHist = buildPortfolioHistory([{ symbol: "A", exchange: "NSE", quantity: 1 }], new Map());
  assert("no fabricated history when data missing", !noHist.available && noHist.points.length === 0);

  console.log("\n3. Live identification + market data (acceptance sample)");
  const market = getMarketDataService();
  const identified = await identifyStocks(rows, market);
  for (const h of identified) {
    const id = h.identification;
    console.log(`    ${h.company.padEnd(22)} → ${id.status.padEnd(12)} ${id.symbol ?? "-"} ${id.exchange ?? ""} (${id.method}, ${id.confidence})`);
  }
  const bySym = Object.fromEntries(identified.map((h) => [h.company, h.identification.symbol]));
  assert("Reliance Industries → RELIANCE", bySym["Reliance Industries"] === "RELIANCE");
  assert("TCS → TCS", bySym["TCS"] === "TCS");
  assert("HDFC Bank → HDFCBANK", bySym["HDFC Bank"] === "HDFCBANK");
  assert("ITC → ITC", bySym["ITC"] === "ITC");

  const unknown = await identifyStocks(parse(`Company,Qty,Avg Price\nABC Industries Zqxw,5,100`), market);
  assert("unknown company → Needs Review, not guessed", unknown[0].identification.status === "needs_review" && unknown[0].identification.symbol === null, unknown[0].identification);

  const ambiguous = await identifyStocks(parse(`Company,Qty,Avg Price\nRELIANCE IND,5,100`), market);
  console.log(`    RELIANCE IND → ${ambiguous[0].identification.status} ${ambiguous[0].identification.symbol ?? "-"} (${ambiguous[0].identification.note})`);
  assert("ambiguous name is not silently assigned without AI", ambiguous[0].identification.status === "needs_review" || ambiguous[0].identification.method === "ai");

  const active = identified.filter((h) => h.identification.status === "identified");
  const quotes = await Promise.all(active.map((h) => market.getQuote(h.identification.symbol!, h.identification.exchange!)));
  assert("quotes fetched for all", quotes.every((x) => x && x.currentPrice > 0));
  quotes.forEach((x) => console.log(`    ${x!.symbol.padEnd(9)} ₹${x!.currentPrice}  PE ${x!.pe?.toFixed(1) ?? "n/a"}  ${x!.sector ?? "n/a"}`));

  const live = calculatePortfolioMetrics(active.map((holding, i) => ({ holding, quote: quotes[i] })));
  const from = new Date(Date.now() - 365 * 864e5);
  const histories = new Map<string, Awaited<ReturnType<typeof market.getHistory>>>();
  for (const h of live.holdings) histories.set(`${h.exchange}:${h.symbol}`, await market.getHistory(h.symbol, h.exchange, from));
  const liveHist = buildPortfolioHistory(live.holdings, histories);
  console.log(`    Invested ₹${live.summary.totalInvested}  Current ₹${live.summary.totalCurrentValue}  P&L ₹${live.summary.totalProfitLoss} (${live.summary.totalReturnPercentage}%)`);
  console.log(`    History points: ${liveHist.points.length} (${liveHist.points[0]?.date} → ${liveHist.points.at(-1)?.date})`);
  assert("live portfolio calculated", live.summary.totalInvested === 20 * 1420 + 10 * 3200 + 25 * 1680 + 50 * 420);
  assert("live history available", liveHist.available && liveHist.points.length > 100);

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

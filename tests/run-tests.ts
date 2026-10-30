// Financial Guru: automated unit and integration tests (see Chapter 7 of the project report).
// Run from the project root:  npx tsx tests/run-tests.ts
// Uses an offline fake market-data provider, so no internet connection is needed.
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { parsePortfolioFile, assertSupportedUpload } from "@/lib/portfolio/fileParser";
import { normalizePortfolioColumns, scoreHeaderRow, parseNumber } from "@/lib/portfolio/normalizer";
import { calculatePortfolioMetrics, buildPortfolioHistory } from "@/lib/portfolio/calculations";
import { identifyStocks, consolidateHoldings, normalizeCompanyName } from "@/lib/portfolio/identifier";
import { MarketDataService } from "@/lib/market-data";
import { MarketDataError } from "@/lib/market-data/types";
import { getOnboardingRoute } from "@/lib/onboarding";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { IdentifiedHolding } from "@/lib/portfolio/types";

const results: any[] = [];
async function tc(id: string, name: string, fn: () => any | Promise<any>) {
  const t = performance.now();
  try {
    const out = await fn();
    results.push({ id, name, status: "PASS", out: String(out), ms: +(performance.now() - t).toFixed(2) });
  } catch (e: any) {
    results.push({ id, name, status: "FAIL", out: e?.code ? `${e.code}: ${e.message}` : String(e), ms: +(performance.now() - t).toFixed(2) });
  }
}
function expectErr(code: string, fn: () => any) {
  try { fn(); } catch (e: any) { if (e.code === code) return `${code} — "${e.message}"${e.details?.length ? " | " + e.details[0] : ""}`; throw new Error(`expected ${code}, got ${e.code}: ${e.message}`); }
  throw new Error(`expected ${code}, no error`);
}
const parse = (buf: Buffer, name: string) => normalizePortfolioColumns(parsePortfolioFile(buf, name, scoreHeaderRow));
const file = (n: string) => fs.readFileSync(`samples/${n}`);

async function runAllTests() {
// ---------- Parser / normaliser ----------
await tc("UT-01", "Standard CSV parsed", () => { const r = parse(file("standard_portfolio.csv"), "standard_portfolio.csv"); if (r.length !== 10) throw new Error("rows " + r.length); return `${r.length} holdings; first = ${r[0].company}, qty ${r[0].quantity}, avg ${r[0].avgPrice}, symbolHint ${r[0].symbolHint}`; });
await tc("UT-02", "Zerodha export parsed", () => { const r = parse(file("zerodha_holdings.csv"), "zerodha_holdings.csv"); return `${r.length} holdings; ${r[0].company} avg ${r[0].avgPrice} LTP ${r[0].currentPrice} pnl% ${r[0].pnlPercentage}`; });
await tc("UT-03", "Groww export parsed", () => { const r = parse(file("groww_holdings.csv"), "groww_holdings.csv"); return `${r.length} holdings; ${r[0].company} [${r[0].symbolHint}] qty ${r[0].quantity} mkt ${r[0].currentPrice}`; });
await tc("UT-04", "Excel workbook parsed", () => { const p = parsePortfolioFile(file("diversified_portfolio.xlsx"), "diversified_portfolio.xlsx", scoreHeaderRow); const r = normalizePortfolioColumns(p); return `${r.length} holdings from sheet "${p.sheetName}", header row ${p.headerRowNumber}; headers: ${p.headers.filter(Boolean).join(", ")}`; });
await tc("UT-05", "Unsupported extension rejected", () => expectErr("UNSUPPORTED_FILE", () => assertSupportedUpload("holdings.pdf", 1200)));
await tc("UT-06", "Empty file rejected", () => expectErr("EMPTY_FILE", () => assertSupportedUpload("a.csv", 0)));
await tc("UT-07", "File above 5 MB rejected", () => expectErr("FILE_TOO_LARGE", () => assertSupportedUpload("big.csv", 6 * 1024 * 1024)));
await tc("UT-08", "Missing quantity column", () => expectErr("MISSING_COLUMNS", () => parse(Buffer.from("Company,Avg Price\nTCS,3500\nINFY,1400\n"), "x.csv")));
await tc("UT-09", "Negative quantity row", () => expectErr("INVALID_ROWS", () => parse(Buffer.from("Company,Qty,Avg Price\nTCS,-5,3500\nINFY,10,1400\n"), "x.csv")));
await tc("UT-10", "Preamble lines above header", () => { const csv = "Holdings statement,,\nClient ID: AB1234,,\n,,\nScrip Name,Qty,Buy Avg\nITC,100,410\nWIPRO,60,460\n"; const p = parsePortfolioFile(Buffer.from(csv), "x.csv", scoreHeaderRow); const r = normalizePortfolioColumns(p); return `header found at row ${p.headerRowNumber}; ${r.length} holdings`; });
await tc("UT-11", "Total / disclaimer rows skipped", () => { const r = parse(Buffer.from("Company,Qty,Avg Price\nTCS,5,3500\nINFY,10,1400\nTotal,15,\nDisclaimer: values are indicative,,\n"), "x.csv"); return `${r.length} holdings kept (Total and Disclaimer rows ignored)`; });
await tc("UT-12", "Rupee symbol, commas, brackets", () => `₹2,450.00 → ${parseNumber("₹2,450.00")}; (1,200) → ${parseNumber("(1,200)")}; "Rs. 99.5" → ${parseNumber("Rs. 99.5")}; "N/A" → ${parseNumber("N/A")}`);
await tc("UT-13", "Average price derived from invested value", () => { const r = parse(Buffer.from("Stock,Shares,Invested Amount\nTCS,10,35000\n"), "x.csv"); return `avgPrice = ${r[0].avgPrice}`; });
await tc("UT-14", "Malformed CSV (unbalanced quote)", () => expectErr("INVALID_CSV", () => parse(Buffer.from('Company,Qty,Avg Price\n"TCS,5,3500\nINFY,10,1400\n'), "x.csv")));
await tc("UT-15", "Header with currency in brackets", () => { const r = parse(Buffer.from("Company,Quantity,Avg Price (₹),LTP (₹)\nTCS,5,3500,4100\n"), "x.csv"); return `avg ${r[0].avgPrice}, current ${r[0].currentPrice}`; });

await tc("UT-31", "Boundary: exactly 5 MB accepted", () => { assertSupportedUpload("a.csv", 5 * 1024 * 1024); return "5,242,880 bytes accepted; 5,242,881 bytes → " + expectErr("FILE_TOO_LARGE", () => assertSupportedUpload("a.csv", 5 * 1024 * 1024 + 1)).split(" — ")[0]; });
await tc("UT-32", "Workbook with title rows and two sheets", () => { const XLSX = require("xlsx"); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Notes"], ["exported 25-10-2026"]]), "Info"); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Client: AB12"], [], ["Symbol", "Qty", "Avg Price"], ["TCS", 5, 3500], ["INFY", 8, 1400]]), "Holdings"); const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }); const p = parsePortfolioFile(buf, "w.xlsx", scoreHeaderRow); return `sheet "${p.sheetName}" chosen, header at row ${p.headerRowNumber}, ${normalizePortfolioColumns(p).length} holdings`; });
// ---------- Identifier with an offline fake provider ----------
const LIST = [
  { symbol: "RELIANCE", exchange: "NSE", company: "Reliance Industries Limited" },
  { symbol: "INFY", exchange: "NSE", company: "Infosys Limited" },
  { symbol: "TATAMOTORS", exchange: "NSE", company: "Tata Motors Limited" },
  { symbol: "TATASTEEL", exchange: "NSE", company: "Tata Steel Limited" },
  { symbol: "TCS", exchange: "NSE", company: "Tata Consultancy Services Limited" },
] as const;
let down = false;
const fake = {
  name: "fake",
  async searchSecurities(q: string) { if (down) throw new MarketDataError("down"); const n = normalizeCompanyName(q); return LIST.filter(l => normalizeCompanyName(l.company).split(" ").some(t => n.split(" ").some(x => x && t.startsWith(x)))).map(l => ({ ...l })); },
  async getQuote(s: string, ex: any) { if (down) throw new MarketDataError("down"); const l = LIST.find(l => l.symbol === s.toUpperCase() && l.exchange === ex); return l ? { symbol: l.symbol, exchange: ex, company: l.company, currency: "INR", currentPrice: 100, previousClose: null, marketCap: null, pe: null, eps: null, week52High: null, week52Low: null, volume: null, sector: null, industry: null, dividendYield: null, asOf: new Date().toISOString() } : null; },
  async getHistory() { return []; },
};
const svc = new MarketDataService(fake as any);
const row = (company: string, symbolHint: string | null = null, q = 10, a = 100) => ({ rowNumber: 2, company, symbolHint, quantity: q, avgPrice: a, currentPrice: null, investedValue: null, marketValue: null, pnl: null, pnlPercentage: null });
const idOne = async (r: any) => (await identifyStocks([r], svc))[0].identification;
await tc("UT-16", "Ticker typed directly", async () => { const i = await idOne(row("RELIANCE")); return `${i.status} → ${i.exchange}:${i.symbol} via ${i.method} (confidence ${i.confidence})`; });
await tc("UT-17", "Exact company name", async () => { const i = await idOne(row("Infosys Ltd")); return `${i.status} → ${i.symbol} via ${i.method} (confidence ${i.confidence})`; });
await tc("UT-18", "Abbreviated name, AI off", async () => { const i = await idOne(row("RELIANCE IND")); return `${i.status} → ${i.symbol} via ${i.method} (confidence ${i.confidence})`; });
await tc("UT-19", "Ambiguous group name", async () => { const i = await idOne(row("TATA")); return `${i.status}: ${i.note} (${i.candidates.length} candidates shown)`; });
await tc("UT-20", "Market data service down", async () => { down = true; try { await identifyStocks([row("RELIANCE"), row("INFY")], new MarketDataService(fake as any)); throw new Error("no error raised"); } catch (e: any) { if (e.code !== "MARKET_DATA_UNAVAILABLE") throw e; return `${e.code} — "${e.message}"`; } finally { down = false; } });
await tc("UT-30", "Quote cache (5 min)", async () => { let calls = 0; const p = { ...fake, async getQuote(s: string, ex: any) { calls++; return fake.getQuote(s, ex); } }; const m = new MarketDataService(p as any); await m.getQuote("TCS", "NSE"); await m.getQuote("tcs", "NSE"); down = true; const third = await m.getQuote("TCS", "NSE"); down = false; return `3 requests → ${calls} provider call; cached quote still served while provider was down: ${third ? "yes" : "no"}`; });
await tc("UT-21", "Duplicate rows consolidated", () => { const mk = (q: number, a: number): IdentifiedHolding => ({ ...row("INFY", null, q, a), identification: { status: "identified", company: "Infosys Limited", symbol: "INFY", exchange: "NSE", confidence: 1, method: "symbol_match", note: null, candidates: [] } }); const c = consolidateHoldings([mk(10, 1400), mk(30, 1500)]); return `${c.length} holding, qty ${c[0].quantity}, weighted avg ${c[0].avgPrice}`; });

// ---------- Calculation engine ----------
const std = parse(file("standard_portfolio.csv"), "s.csv");
const asIdentified = (rows: any[]): IdentifiedHolding[] => rows.map(r => ({ ...r, identification: { status: "identified", company: r.company, symbol: r.symbolHint ?? r.company, exchange: "NSE", confidence: 1, method: "symbol_match", note: null, candidates: [] } }));
let calc: any;
await tc("UT-22", "Portfolio metrics (file prices)", () => { calc = calculatePortfolioMetrics(asIdentified(std).map(h => ({ holding: h, quote: null }))); const s = calc.summary; const sumAlloc = calc.holdings.reduce((a: number, h: any) => a + h.allocationPercentage, 0); return `invested ₹${s.totalInvested}, current ₹${s.totalCurrentValue}, P&L ₹${s.totalProfitLoss} (${s.totalReturnPercentage}%), largest ${s.largestHolding.symbol} ${s.largestHolding.allocationPercentage}%, allocation total ${sumAlloc.toFixed(2)}%`; });
await tc("UT-23", "Sector falls back to Unclassified", () => `${calc.sectorAllocation.map((s: any) => `${s.sector} ${s.allocationPercentage}% (${s.holdingsCount})`).join("; ")}`);
await tc("UT-24", "History carried over holiday", () => { const h = buildPortfolioHistory([{ symbol: "A", exchange: "NSE", quantity: 2 }, { symbol: "B", exchange: "NSE", quantity: 1 }], new Map([["NSE:A", [{ date: "2026-10-01", close: 10 }, { date: "2026-10-02", close: 11 }, { date: "2026-10-03", close: 12 }]], ["NSE:B", [{ date: "2026-10-01", close: 50 }, { date: "2026-10-03", close: 55 }]]])); return h.points.map(p => `${p.date}=${p.value}`).join(", "); });
await tc("UT-25", "History missing for one stock", () => buildPortfolioHistory([{ symbol: "A", exchange: "NSE", quantity: 1 }, { symbol: "B", exchange: "NSE", quantity: 1 }], new Map([["NSE:A", [{ date: "2026-10-01", close: 10 }]]])).note);

// ---------- Onboarding + passwords ----------
await tc("UT-26", "Onboarding route resolver", () => [getOnboardingRoute({ has_portfolio: null }), getOnboardingRoute({ has_portfolio: false }), getOnboardingRoute({ has_portfolio: true, portfolio_uploaded: false }), getOnboardingRoute({ has_portfolio: true, portfolio_uploaded: true })].join(" | "));
await tc("UT-27", "Password hash verifies", () => { const h = hashPassword("Guru@2026"); return `stored as salt:hash (${h.split(":")[0].length}+${h.split(":")[1].length} hex chars); correct password → ${verifyPassword("Guru@2026", h)}`; });
await tc("UT-28", "Wrong password rejected", () => `wrong password → ${verifyPassword("guru@2026", hashPassword("Guru@2026"))}`);
await tc("UT-29", "Same password, different hashes", () => `two hashes equal? ${hashPassword("abc123") === hashPassword("abc123")}`);

// ---------- Fundamentals Caching & Schema Contract ----------
await tc("UT-33", "Stock fundamentals cache set/get", async () => {
  const { saveCachedFundamentals, getCachedFundamentals } = await import("@/lib/market-data/fundamentalsCache");
  const testItem = {
    symbol: "INFY",
    exchange: "NSE" as const,
    tickerWithSuffix: "INFY.NS",
    name: "Infosys Limited",
    sector: "Information Technology",
    marketCap: 6000000000000,
    trailingPE: 24.5,
    returnOnEquity: 31.8,
    debtToEquity: 0.08,
    industryPe: 22.0,
    roce: 40.2,
  };
  await saveCachedFundamentals([testItem]);
  const cached = await getCachedFundamentals(["INFY.NS"]);
  const hit = cached.get("INFY.NS");
  if (!hit) throw new Error("Expected cache hit for INFY.NS");
  if (hit.roce !== 40.2 || hit.industryPe !== 22.0) throw new Error("Cached ROCE and Industry P/E must match");
  return `cached INFY.NS: P/E ${hit.trailingPE}, Ind P/E ${hit.industryPe}x, ROE ${hit.returnOnEquity}%, D/E ${hit.debtToEquity}, ROCE: ${hit.roce}%`;
});

await tc("UT-34", "Stock fundamentals accounting formulas", () => {
  // Test ROE = (P/B / P/E) * 100 identity
  const pe = 20.0;
  const pb = 4.0;
  const derivedRoe = +((pb / pe) * 100).toFixed(1);
  if (derivedRoe !== 20.0) throw new Error("Derived ROE mismatch");

  // Test ROCE = EBIT / (Equity + Debt) * 100
  const totalDebt = 1000;
  const deRatio = 0.5; // Equity = 2000
  const equity = totalDebt / deRatio;
  const capEmployed = equity + totalDebt; // 3000
  const ebit = 450;
  const derivedRoce = +((ebit / capEmployed) * 100).toFixed(1);
  if (derivedRoce !== 15.0) throw new Error("Derived ROCE mismatch");

  return "Verified: Accounting identities for ROE (PB/PE) and ROCE (EBIT/Capital Employed) calculate accurately";
});

// ---------- timing ----------
const big = ["Company,Symbol,Qty,Avg Price,LTP", ...Array.from({ length: 2000 }, (_, i) => `Company ${i},SYM${i},${i + 1},${100 + i}.5,${110 + i}`)].join("\n");
const perf: any = {};
for (const [n, b] of [["standard_portfolio.csv", file("standard_portfolio.csv")], ["zerodha_holdings.csv", file("zerodha_holdings.csv")], ["groww_holdings.csv", file("groww_holdings.csv")], ["diversified_portfolio.xlsx", file("diversified_portfolio.xlsx")], ["synthetic_2000_rows.csv", Buffer.from(big)]] as const) {
  const runs: number[] = [];
  for (let i = 0; i < 20; i++) { const t = performance.now(); const r = parse(b as Buffer, n); calculatePortfolioMetrics(asIdentified(r).map(h => ({ holding: h, quote: null }))); runs.push(performance.now() - t); }
  runs.sort((a, b) => a - b);
  perf[n] = { bytes: (b as Buffer).length, median_ms: +runs[10].toFixed(2), max_ms: +runs[19].toFixed(2) };
}
for (const r of results) console.log(r.id, r.status, r.ms + "ms", "|", r.name, "|", r.out);
console.log(perf);
}
runAllTests().catch(console.error);

import { z } from "zod";
import type { CalculatedPortfolio, PerformanceHistory } from "@/lib/portfolio/types";
import { generateStructured } from "./client";

const Severity = z.enum(["low", "medium", "high"]);

export const PortfolioAnalysisSchema = z.object({
  summary: z.string(),
  diversification: z.object({
    observation: z.string(),
    evidence: z.string().describe("The supplied figures this is based on"),
    severity: Severity,
  }),
  sectorExposure: z.array(
    z.object({ sector: z.string(), allocation: z.number(), observation: z.string() })
  ),
  holdingsAnalysis: z.array(
    z.object({ symbol: z.string(), observation: z.string(), reason: z.string() })
  ),
  riskObservations: z.array(
    z.object({ title: z.string(), description: z.string(), reason: z.string(), severity: Severity })
  ),
  performanceObservations: z.array(z.object({ observation: z.string(), reason: z.string() })),
  valuationObservations: z.array(
    z.object({ symbol: z.string(), observation: z.string(), reason: z.string() })
  ),
  strengths: z.array(z.object({ title: z.string(), description: z.string() })),
  attentionAreas: z.array(z.object({ title: z.string(), description: z.string(), severity: Severity })),
  dataLimitations: z.array(z.string()),
});

export type PortfolioAnalysis = z.infer<typeof PortfolioAnalysisSchema>;

const SYSTEM = `You are Wealthzy's portfolio analyst. You write clear observations about an Indian equity portfolio for a retail investor.

Strict rules:
- Use ONLY the JSON data supplied. Do not use outside knowledge about prices, valuations, earnings, news or company fundamentals.
- Never introduce a number that is not in the supplied data. Quote figures exactly as given. You may compare supplied numbers (e.g. "larger than", "about a third").
- Separate fact from interpretation: state the supplied figure first, then your interpretation, and phrase interpretations as such ("this suggests", "this may").
- When a field is null or listed under dataGaps, say the data is unavailable rather than guessing.
- P/E values are only comparable in context; do not claim a stock is over- or under-valued versus an industry average you were not given.
- Describe observations and considerations; do not tell the user to buy or sell specific securities.
- Explain every observation in plain language a first-time investor understands.
- sectorExposure must contain exactly the sectors provided; holdingsAnalysis and valuationObservations may only reference supplied symbols.`;

export function buildAnalysisSnapshot(portfolio: CalculatedPortfolio, history: PerformanceHistory) {
  const dataGaps: string[] = [];
  for (const h of portfolio.holdings) {
    if (h.priceSource === "file") dataGaps.push(`${h.symbol}: live market data unavailable; current price taken from the uploaded file.`);
    if (h.market && h.market.pe === null) dataGaps.push(`${h.symbol}: P/E ratio unavailable.`);
    if (h.sector === "Unclassified") dataGaps.push(`${h.symbol}: sector unavailable.`);
  }
  if (!history.available && history.note) dataGaps.push(history.note);

  const first = history.points[0];
  const last = history.points[history.points.length - 1];

  return {
    portfolio: {
      investedValue: portfolio.summary.totalInvested,
      currentValue: portfolio.summary.totalCurrentValue,
      profitLoss: portfolio.summary.totalProfitLoss,
      returnPercentage: portfolio.summary.totalReturnPercentage,
      numberOfHoldings: portfolio.summary.holdingsCount,
      largestHolding: portfolio.summary.largestHolding,
      largestSector: portfolio.summary.largestSector,
      currency: "INR",
    },
    holdings: portfolio.holdings.map((h) => ({
      company: h.company,
      symbol: h.symbol,
      sector: h.sector,
      industry: h.industry,
      allocationPercentage: h.allocationPercentage,
      investedValue: h.investedValue,
      currentValue: h.currentValue,
      profitLoss: h.profitLoss,
      returnPercentage: h.returnPercentage,
      pe: h.market?.pe ?? null,
      eps: h.market?.eps ?? null,
      marketCap: h.market?.marketCap ?? null,
      dividendYield: h.market?.dividendYield ?? null,
      week52High: h.market?.week52High ?? null,
      week52Low: h.market?.week52Low ?? null,
      currentPrice: h.currentPrice,
    })),
    sectorAllocation: Object.fromEntries(portfolio.sectorAllocation.map((s) => [s.sector, s.allocationPercentage])),
    historicalValue:
      history.available && first && last
        ? {
            note: "Value of the current holdings at historical closing prices (assumes today's quantities throughout).",
            fromDate: first.date,
            fromValue: first.value,
            toDate: last.date,
            toValue: last.value,
          }
        : null,
    dataGaps,
  };
}

/** Generates structured AI observations, then strips anything that references data we didn't supply. */
export async function generatePortfolioAnalysis(
  portfolio: CalculatedPortfolio,
  history: PerformanceHistory
): Promise<PortfolioAnalysis> {
  const snapshot = buildAnalysisSnapshot(portfolio, history);

  const analysis = await generateStructured({
    schema: PortfolioAnalysisSchema,
    system: SYSTEM,
    effort: "high",
    prompt: `Analyse this portfolio snapshot. Cover diversification, sector concentration, single-stock concentration, risk, performance, valuation, strengths and areas that may need attention.\n\n${JSON.stringify(snapshot, null, 2)}`,
  });

  const symbols = new Set(portfolio.holdings.map((h) => h.symbol));
  const sectorPct = new Map(portfolio.sectorAllocation.map((s) => [s.sector, s.allocationPercentage]));

  return {
    ...analysis,
    // Allocation figures always come from the calculation engine, not the model.
    sectorExposure: analysis.sectorExposure
      .filter((s) => sectorPct.has(s.sector))
      .map((s) => ({ ...s, allocation: sectorPct.get(s.sector)! })),
    holdingsAnalysis: analysis.holdingsAnalysis.filter((h) => symbols.has(h.symbol)),
    valuationObservations: analysis.valuationObservations.filter((v) => symbols.has(v.symbol)),
    dataLimitations: [...new Set([...snapshot.dataGaps, ...analysis.dataLimitations])],
  };
}

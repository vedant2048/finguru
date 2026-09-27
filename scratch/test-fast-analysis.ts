import { generateStructured } from "../lib/ai/client";
import { PortfolioAnalysisSchema } from "../lib/ai/portfolioAnalysis";
import { buildAnalysisSnapshot } from "../lib/ai/portfolioAnalysis";
import { calculatePortfolioMetrics } from "../lib/portfolio/calculations";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function testFastAnalysis() {
  const start = Date.now();
  console.log("Testing generatePortfolioAnalysis with enableReasoning: false...");

  const calculated = calculatePortfolioMetrics([
    {
      holding: {
        rowNumber: 1,
        company: "Reliance Industries",
        symbolHint: "RELIANCE",
        quantity: 20,
        avgPrice: 1420,
        currentPrice: 1450,
        investedValue: 28400,
        marketValue: 29000,
        pnl: 600,
        pnlPercentage: 2.11,
        identification: {
          status: "identified",
          company: "Reliance Industries",
          symbol: "RELIANCE",
          exchange: "NSE",
          confidence: 1,
          method: "symbol_match",
          note: null,
          candidates: [],
        },
      },
      quote: {
        symbol: "RELIANCE",
        exchange: "NSE",
        company: "Reliance Industries Ltd",
        currency: "INR",
        currentPrice: 1450,
        previousClose: 1440,
        marketCap: 1900000000000,
        pe: 24.5,
        eps: 59.2,
        week52High: 1600,
        week52Low: 1200,
        volume: 5000000,
        sector: "Energy",
        industry: "Oil & Gas Refining",
        dividendYield: 0.35,
        asOf: new Date().toISOString(),
      },
    },
    {
      holding: {
        rowNumber: 2,
        company: "TCS",
        symbolHint: "TCS",
        quantity: 10,
        avgPrice: 3200,
        currentPrice: 3500,
        investedValue: 32000,
        marketValue: 35000,
        pnl: 3000,
        pnlPercentage: 9.38,
        identification: {
          status: "identified",
          company: "Tata Consultancy Services",
          symbol: "TCS",
          exchange: "NSE",
          confidence: 1,
          method: "symbol_match",
          note: null,
          candidates: [],
        },
      },
      quote: {
        symbol: "TCS",
        exchange: "NSE",
        company: "Tata Consultancy Services",
        currency: "INR",
        currentPrice: 3500,
        previousClose: 3480,
        marketCap: 1200000000000,
        pe: 28.1,
        eps: 124.5,
        week52High: 4000,
        week52Low: 3000,
        volume: 2000000,
        sector: "Technology",
        industry: "Information Technology Services",
        dividendYield: 1.2,
        asOf: new Date().toISOString(),
      },
    },
  ]);

  const history = {
    available: true,
    note: null,
    points: [
      { date: "2025-01-01", value: 60400 },
      { date: "2026-09-25", value: 64000 },
    ],
  };

  const snapshot = buildAnalysisSnapshot(calculated, history);

  try {
    const analysis = await generateStructured({
      schema: PortfolioAnalysisSchema,
      system: "You are Wealthzy's portfolio analyst. Write concise observations for an Indian equity portfolio.",
      effort: "low",
      enableReasoning: false,
      prompt: `Analyze this portfolio snapshot. Keep observations concise and factual.\n\n${JSON.stringify(snapshot, null, 2)}`,
    });

    console.log(`✓ Completed in ${(Date.now() - start) / 1000}s!`);
    console.log("Summary:", analysis.summary);
  } catch (err: any) {
    console.error(`✗ Failed in ${(Date.now() - start) / 1000}s:`, err.message);
  }
}

testFastAnalysis();

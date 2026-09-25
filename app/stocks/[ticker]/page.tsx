"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { FinancialLineChart, ValuationBarComparison } from "@/components/ui/financial-charts";

interface StockDetailPageProps {
  params: Promise<{ ticker: string }>;
}

const STOCK_PROFILES: Record<string, any> = {
  RELIANCE: {
    ticker: "RELIANCE",
    name: "Reliance Industries Ltd",
    sector: "Energy & Telecom",
    exchange: "NSE / BSE",
    price: "₹2,940.50",
    change: "+₹31.20",
    percent: "+1.07%",
    positive: true,
    marketCap: "₹19,85,000 Cr",
    pe: 24.5,
    industryPe: 28.2,
    pb: 2.1,
    evEbitda: 13.4,
    peg: 1.45,
    roe: 9.8,
    roce: 11.2,
    debtEquity: 0.38,
    operatingMargin: "16.8%",
    eps: "₹118.20",
    revenue: "₹9,01,064 Cr",
    netProfit: "₹69,621 Cr",
    news: [
      {
        headline: "Jio Infocomm reports 12% YoY ARPU expansion in enterprise segment.",
        source: "Bloomberg Quint",
        date: "2h ago",
        sentiment: "positive",
        signal: "Revenue Growth Acceleration",
      },
      {
        headline: "Global crude crack spreads compress slightly in European trading.",
        source: "Reuters Financial",
        date: "5h ago",
        sentiment: "neutral",
        signal: "Macro Refining Margin Neutrality",
      },
      {
        headline: "Green energy giga-factory Phase 1 trial run commences in Jamnagar.",
        source: "Mint Markets",
        date: "1d ago",
        sentiment: "positive",
        signal: "Clean Energy Capex Execution",
      },
    ],
  },
  TCS: {
    ticker: "TCS",
    name: "Tata Consultancy Services Ltd",
    sector: "Information Technology",
    exchange: "NSE / BSE",
    price: "₹4,120.10",
    change: "+₹112.40",
    percent: "+2.80%",
    positive: true,
    marketCap: "₹14,92,000 Cr",
    pe: 31.2,
    industryPe: 30.5,
    pb: 12.8,
    evEbitda: 22.1,
    peg: 2.1,
    roe: 48.5,
    roce: 62.1,
    debtEquity: 0.02,
    operatingMargin: "26.1%",
    eps: "₹132.10",
    revenue: "₹2,40,893 Cr",
    netProfit: "₹46,099 Cr",
    news: [
      {
        headline: "TCS signs $1.2B digital transformation deal with UK insurance conglomerate.",
        source: "Financial Times",
        date: "3h ago",
        sentiment: "positive",
        signal: "Order Book Acceleration",
      },
      {
        headline: "IT attrition levels stabilize across tier-1 service providers in Q2.",
        source: "Economic Times",
        date: "1d ago",
        sentiment: "neutral",
        signal: "Labor Cost Normalization",
      },
    ],
  },
};

const DEFAULT_CHART = {
  "1D": [
    { date: "09:15", value: 2915 },
    { date: "11:00", value: 2928 },
    { date: "13:00", value: 2922 },
    { date: "14:30", value: 2936 },
    { date: "15:30", value: 2940.5 },
  ],
  "1M": [
    { date: "01 Sep", value: 2840 },
    { date: "08 Sep", value: 2890 },
    { date: "15 Sep", value: 2865 },
    { date: "22 Sep", value: 2910 },
    { date: "28 Sep", value: 2940.5 },
  ],
  "1Y": [
    { date: "Q3 25", value: 2350 },
    { date: "Q4 25", value: 2540 },
    { date: "Q1 26", value: 2710 },
    { date: "Q2 26", value: 2850 },
    { date: "Q3 26", value: 2940.5 },
  ],
};

export default function StockDetailPage({ params }: StockDetailPageProps) {
  const resolvedParams = use(params);
  const ticker = resolvedParams.ticker.toUpperCase();
  const stock = STOCK_PROFILES[ticker] || {
    ...STOCK_PROFILES.RELIANCE,
    ticker: ticker,
    name: `${ticker} Corporation Ltd`,
  };

  const [activeTab, setActiveTab] = useState<
    "overview" | "fundamentals" | "valuation" | "news" | "risk"
  >("overview");

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#A9A39B]">
          <Link href="/discover" className="hover:underline text-[#3A7BD5]">
            Discover
          </Link>
          <span>/</span>
          <span>{stock.sector}</span>
          <span>/</span>
          <span className="text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514] font-bold">
            {stock.ticker}
          </span>
        </div>

        {/* Company Header Card */}
        <div className="p-6 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                {stock.ticker}
              </span>
              <Badge variant="neutral">{stock.exchange}</Badge>
              <Badge variant="info">{stock.sector}</Badge>
            </div>
            <h1 className="text-sm font-medium text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
              {stock.name}
            </h1>
          </div>

          <div className="flex items-baseline md:items-end flex-col">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
              {stock.price}
            </div>
            <div
              className={`text-xs font-mono font-semibold flex items-center gap-1.5 ${
                stock.positive
                  ? "text-[#4E9F76] dark:text-[#4E9F76] light:text-[#2E8555]"
                  : "text-[#D9534F] dark:text-[#D9534F] light:text-[#C0392B]"
              }`}
            >
              <span>{stock.change}</span>
              <span>({stock.percent})</span>
              <span className="text-[10px] text-[#6F6A64] font-normal">TODAY</span>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8] pb-1 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Overview" },
            { id: "fundamentals", label: "Fundamentals" },
            { id: "valuation", label: "Valuation Benchmark" },
            { id: "news", label: "News Sentiment" },
            { id: "risk", label: "Risk & Capital Structure" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#211F1D] text-[#FAF7F2] border border-[#2E2925] dark:bg-[#211F1D] dark:text-[#FAF7F2] light:bg-[#ECE8E1] light:text-[#171514]"
                  : "text-[#A9A39B] hover:text-[#FAF7F2] dark:text-[#A9A39B] dark:hover:text-[#FAF7F2] light:text-[#6F6A64] light:hover:text-[#171514]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B]">
                  Price Action Trajectory
                </span>
                <Badge variant="positive">VOL: 11.4M</Badge>
              </div>
              <FinancialLineChart data={DEFAULT_CHART} initialTimeframe="1M" height={220} />
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
              <div className="p-3 rounded border bg-[#181615] border-[#24201D] dark:bg-[#181615] dark:border-[#24201D] light:bg-[#FAF7F2] light:border-[#E8E2D8]">
                <span className="text-[#A9A39B] block text-[10px]">Market Cap</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{stock.marketCap}</span>
              </div>
              <div className="p-3 rounded border bg-[#181615] border-[#24201D] dark:bg-[#181615] dark:border-[#24201D] light:bg-[#FAF7F2] light:border-[#E8E2D8]">
                <span className="text-[#A9A39B] block text-[10px]">P/E Ratio</span>
                <span className="font-bold text-[#4E9F76]">{stock.pe}x</span>
              </div>
              <div className="p-3 rounded border bg-[#181615] border-[#24201D] dark:bg-[#181615] dark:border-[#24201D] light:bg-[#FAF7F2] light:border-[#E8E2D8]">
                <span className="text-[#A9A39B] block text-[10px]">P/B Ratio</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{stock.pb}x</span>
              </div>
              <div className="p-3 rounded border bg-[#181615] border-[#24201D] dark:bg-[#181615] dark:border-[#24201D] light:bg-[#FAF7F2] light:border-[#E8E2D8]">
                <span className="text-[#A9A39B] block text-[10px]">ROE</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{stock.roe}%</span>
              </div>
              <div className="p-3 rounded border bg-[#181615] border-[#24201D] dark:bg-[#181615] dark:border-[#24201D] light:bg-[#FAF7F2] light:border-[#E8E2D8]">
                <span className="text-[#A9A39B] block text-[10px]">Debt / Equity</span>
                <span className="font-bold text-[#4E9F76]">{stock.debtEquity}</span>
              </div>
              <div className="p-3 rounded border bg-[#181615] border-[#24201D] dark:bg-[#181615] dark:border-[#24201D] light:bg-[#FAF7F2] light:border-[#E8E2D8]">
                <span className="text-[#A9A39B] block text-[10px]">EPS (TTM)</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{stock.eps}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FUNDAMENTALS */}
        {activeTab === "fundamentals" && (
          <div className="p-6 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B] block">
              Core Financial &amp; Profitability Indicators
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded border border-[#2E2925] dark:border-[#2E2925] light:border-[#E8E2D8] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] space-y-2">
                <span className="text-[#A9A39B]">Total Revenue (TTM)</span>
                <div className="text-lg font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{stock.revenue}</div>
                <p className="text-[11px] text-[#4E9F76]">+11.4% YoY Expansion</p>
              </div>

              <div className="p-4 rounded border border-[#2E2925] dark:border-[#2E2925] light:border-[#E8E2D8] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] space-y-2">
                <span className="text-[#A9A39B]">Net Profit (PAT)</span>
                <div className="text-lg font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{stock.netProfit}</div>
                <p className="text-[11px] text-[#4E9F76]">Operating Margin: {stock.operatingMargin}</p>
              </div>

              <div className="p-4 rounded border border-[#2E2925] dark:border-[#2E2925] light:border-[#E8E2D8] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] space-y-2">
                <span className="text-[#A9A39B]">Return on Capital (ROCE)</span>
                <div className="text-lg font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{stock.roce}%</div>
                <p className="text-[11px] text-[#6F6A64]">Above cost of debt (8.2%)</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VALUATION BENCHMARK */}
        {activeTab === "valuation" && (
          <div className="p-6 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B] block">
                  Relative Valuation vs Industry Benchmark
                </span>
                <p className="text-xs text-[#6F6A64] mt-1">
                  Contextual comparisons against peer group averages.
                </p>
              </div>
              <Badge variant="positive">BELOW INDUSTRY AVERAGE P/E</Badge>
            </div>

            <div className="space-y-5 max-w-2xl">
              <ValuationBarComparison
                label="Price to Earnings (P/E)"
                companyValue={stock.pe}
                industryValue={stock.industryPe}
                unit="x"
                isLowerBetter={true}
              />
              <ValuationBarComparison
                label="EV / EBITDA"
                companyValue={stock.evEbitda}
                industryValue={15.2}
                unit="x"
                isLowerBetter={true}
              />
              <ValuationBarComparison
                label="Price to Book (P/B)"
                companyValue={stock.pb}
                industryValue={2.8}
                unit="x"
                isLowerBetter={true}
              />
            </div>
          </div>
        )}

        {/* TAB 4: NEWS SENTIMENT */}
        {activeTab === "news" && (
          <div className="p-6 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B] block">
                  FinBERT-Powered News Sentiment Stream
                </span>
                <p className="text-[11px] text-[#6F6A64] mt-0.5">
                  Sentiment is an analytical signal extracted from media feeds, not an absolute market forecast.
                </p>
              </div>
              <Badge variant="info">MODEL: FinBERT v2</Badge>
            </div>

            <div className="divide-y divide-[#24201D]/40 dark:divide-[#24201D]/40 light:divide-[#E8E2D8] space-y-3">
              {stock.news.map((item: any, idx: number) => (
                <div key={idx} className="pt-3 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#A9A39B]">{item.source} &bull; {item.date}</span>
                    <Badge variant={item.sentiment === "positive" ? "positive" : "neutral"}>
                      {item.sentiment.toUpperCase()}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                    {item.headline}
                  </h3>
                  <div className="text-[11px] text-[#3A7BD5]">
                    Analytical Signal: {item.signal}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: RISK & CAPITAL */}
        {activeTab === "risk" && (
          <div className="p-6 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4 font-mono text-xs">
            <span className="text-xs uppercase tracking-wider font-bold text-[#A9A39B] block">
              Capital Structure &amp; Solvency Analysis
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded border border-[#2E2925] dark:border-[#2E2925] light:border-[#E8E2D8] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] space-y-1">
                <span className="text-[#A9A39B]">Debt-to-Equity Ratio</span>
                <div className="text-base font-bold text-[#4E9F76]">{stock.debtEquity}</div>
                <p className="text-[10px] text-[#6F6A64]">Conservative leverage profile (&lt; 0.5x)</p>
              </div>

              <div className="p-4 rounded border border-[#2E2925] dark:border-[#2E2925] light:border-[#E8E2D8] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] space-y-1">
                <span className="text-[#A9A39B]">Interest Coverage Ratio</span>
                <div className="text-base font-bold text-[#4E9F76]">7.8x</div>
                <p className="text-[10px] text-[#6F6A64]">Strong operating earnings cushion</p>
              </div>

              <div className="p-4 rounded border border-[#2E2925] dark:border-[#2E2925] light:border-[#E8E2D8] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] space-y-1">
                <span className="text-[#A9A39B]">Beta (5-Year Volatility)</span>
                <div className="text-base font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">0.92</div>
                <p className="text-[10px] text-[#6F6A64]">Lower volatility than NIFTY benchmark</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

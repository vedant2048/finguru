"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";

interface StockRecord {
  ticker: string;
  name: string;
  sector: string;
  price: string;
  marketCap: string;
  pe: number;
  industryPe: number;
  roe: number;
  roce: number;
  revenueGrowth: number;
  debtToEquity: number;
  dividendYield: number;
}

const STOCK_DATABASE: StockRecord[] = [
  {
    ticker: "RELIANCE",
    name: "Reliance Industries Ltd",
    sector: "Energy & Telecom",
    price: "₹2,940.50",
    marketCap: "₹19,85,000 Cr",
    pe: 24.5,
    industryPe: 28.2,
    roe: 9.8,
    roce: 11.2,
    revenueGrowth: 11.4,
    debtToEquity: 0.38,
    dividendYield: 0.35,
  },
  {
    ticker: "TCS",
    name: "Tata Consultancy Services",
    sector: "Information Technology",
    price: "₹4,120.10",
    marketCap: "₹14,92,000 Cr",
    pe: 31.2,
    industryPe: 30.5,
    roe: 48.5,
    roce: 62.1,
    revenueGrowth: 8.2,
    debtToEquity: 0.02,
    dividendYield: 1.85,
  },
  {
    ticker: "HDFCBANK",
    name: "HDFC Bank Ltd",
    sector: "Financial Services",
    price: "₹1,645.80",
    marketCap: "₹12,50,000 Cr",
    pe: 19.1,
    industryPe: 18.5,
    roe: 16.4,
    roce: 17.8,
    revenueGrowth: 18.5,
    debtToEquity: 1.25,
    dividendYield: 1.15,
  },
  {
    ticker: "INFY",
    name: "Infosys Ltd",
    sector: "Information Technology",
    price: "₹1,780.25",
    marketCap: "₹7,38,000 Cr",
    pe: 26.4,
    industryPe: 30.5,
    roe: 31.8,
    roce: 40.2,
    revenueGrowth: 7.9,
    debtToEquity: 0.04,
    dividendYield: 2.10,
  },
  {
    ticker: "ICICIBANK",
    name: "ICICI Bank Ltd",
    sector: "Financial Services",
    price: "₹1,180.00",
    marketCap: "₹8,25,000 Cr",
    pe: 17.8,
    industryPe: 18.5,
    roe: 18.2,
    roce: 19.5,
    revenueGrowth: 22.1,
    debtToEquity: 1.10,
    dividendYield: 0.85,
  },
  {
    ticker: "LT",
    name: "Larsen & Toubro Ltd",
    sector: "Capital Goods & Infra",
    price: "₹3,560.40",
    marketCap: "₹4,89,000 Cr",
    pe: 33.1,
    industryPe: 35.8,
    roe: 15.2,
    roce: 18.1,
    revenueGrowth: 16.4,
    debtToEquity: 0.72,
    dividendYield: 0.95,
  },
  {
    ticker: "TITAN",
    name: "Titan Company Ltd",
    sector: "Consumer Discretionary",
    price: "₹3,420.00",
    marketCap: "₹3,03,000 Cr",
    pe: 82.4,
    industryPe: 65.2,
    roe: 30.1,
    roce: 36.4,
    revenueGrowth: 21.0,
    debtToEquity: 0.85,
    dividendYield: 0.32,
  },
];

export default function DiscoverPage() {
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [maxPe, setMaxPe] = useState<number>(100);
  const [minRoe, setMinRoe] = useState<number>(0);
  const [maxDebt, setMaxDebt] = useState<number>(2.0);

  // Filter logic
  const filteredStocks = STOCK_DATABASE.filter((stock) => {
    if (selectedSector !== "all" && stock.sector !== selectedSector) return false;
    if (stock.pe > maxPe) return false;
    if (stock.roe < minRoe) return false;
    if (stock.debtToEquity > maxDebt) return false;
    if (naturalLanguageQuery.trim()) {
      const q = naturalLanguageQuery.toLowerCase();
      const matchesText =
        stock.ticker.toLowerCase().includes(q) ||
        stock.name.toLowerCase().includes(q) ||
        stock.sector.toLowerCase().includes(q);
      if (!matchesText && !q.includes("roe") && !q.includes("large-cap")) return false;
    }
    return true;
  });

  const handleApplyPreset = (preset: string) => {
    if (preset === "high_roe") {
      setMinRoe(20);
      setMaxPe(40);
      setNaturalLanguageQuery("Strong ROE (>20%) with reasonable valuation");
    } else if (preset === "low_debt") {
      setMaxDebt(0.1);
      setNaturalLanguageQuery("Virtually debt-free companies");
    } else if (preset === "below_pe") {
      setMaxPe(25);
      setNaturalLanguageQuery("Valuation below 25x P/E");
    }
  };

  const handleResetFilters = () => {
    setSelectedSector("all");
    setMaxPe(100);
    setMinRoe(0);
    setMaxDebt(2.0);
    setNaturalLanguageQuery("");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-2 border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8]">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Discover
          </h1>
          <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
            Find companies that match your investment criteria using fundamental screener parameters.
          </p>
        </div>

        {/* Natural Language Prompt & Presets */}
        <div className="p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
              Natural Language Screening Query
            </span>
            <Badge variant="info">PARSER: QUANTITATIVE FILTERS</Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={naturalLanguageQuery}
              onChange={(e) => setNaturalLanguageQuery(e.target.value)}
              placeholder="e.g. Find profitable large-cap companies with strong ROE and moderate valuation."
              className="flex-1 h-11 px-3.5 rounded border text-xs font-mono outline-none transition-colors bg-[#181615] border-[#2A2420] text-[#FAF7F2] focus:border-[#3A7BD5] placeholder-[#6F6A64] dark:bg-[#181615] dark:border-[#2A2420] dark:text-[#FAF7F2] light:bg-[#FAF7F2] light:border-[#DDD5C9] light:text-[#171514]"
            />
            <button
              onClick={() => handleApplyPreset("high_roe")}
              type="button"
              className="px-4 py-2 rounded text-xs font-mono font-semibold transition-colors bg-[#FAF7F2] text-[#0F0D0C] hover:bg-[#E6E1D8] dark:bg-[#FAF7F2] dark:text-[#0F0D0C] light:bg-[#171514] light:text-[#FAF7F2] cursor-pointer"
            >
              Apply Filter
            </button>
          </div>

          {/* Prompt Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-[#6F6A64]">Quick Presets:</span>
            <button
              onClick={() => handleApplyPreset("high_roe")}
              className="px-2.5 py-1 rounded text-[11px] font-mono border border-[#2E2925] text-[#A9A39B] hover:text-[#FAF7F2] hover:border-[#3A7BD5]"
            >
              High ROE &gt; 20%
            </button>
            <button
              onClick={() => handleApplyPreset("low_debt")}
              className="px-2.5 py-1 rounded text-[11px] font-mono border border-[#2E2925] text-[#A9A39B] hover:text-[#FAF7F2] hover:border-[#3A7BD5]"
            >
              Zero / Low Debt (&lt; 0.1)
            </button>
            <button
              onClick={() => handleApplyPreset("below_pe")}
              className="px-2.5 py-1 rounded text-[11px] font-mono border border-[#2E2925] text-[#A9A39B] hover:text-[#FAF7F2] hover:border-[#3A7BD5]"
            >
              Moderate P/E (&lt; 25x)
            </button>
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1 rounded text-[11px] font-mono text-[#D9534F] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Quantitative Filter Panel */}
        <div className="p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64] block">
            Filter Parameters
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            {/* Sector */}
            <div>
              <label className="block text-[#A9A39B] mb-1.5 font-semibold">Sector</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full h-9 px-2 rounded border bg-[#181615] border-[#2A2420] text-[#FAF7F2] outline-none dark:bg-[#181615] dark:border-[#2A2420] dark:text-[#FAF7F2] light:bg-[#FAF7F2] light:border-[#DDD5C9] light:text-[#171514]"
              >
                <option value="all">All Sectors</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Energy & Telecom">Energy &amp; Telecom</option>
                <option value="Consumer Discretionary">Consumer Discretionary</option>
                <option value="Capital Goods & Infra">Capital Goods &amp; Infra</option>
              </select>
            </div>

            {/* Max P/E */}
            <div>
              <div className="flex justify-between text-[#A9A39B] mb-1.5 font-semibold">
                <span>Max P/E Multiple</span>
                <span className="text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{maxPe}x</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={maxPe}
                onChange={(e) => setMaxPe(Number(e.target.value))}
                className="w-full accent-[#3A7BD5]"
              />
            </div>

            {/* Min ROE */}
            <div>
              <div className="flex justify-between text-[#A9A39B] mb-1.5 font-semibold">
                <span>Min ROE (%)</span>
                <span className="text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{minRoe}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={minRoe}
                onChange={(e) => setMinRoe(Number(e.target.value))}
                className="w-full accent-[#3A7BD5]"
              />
            </div>

            {/* Max Debt/Equity */}
            <div>
              <div className="flex justify-between text-[#A9A39B] mb-1.5 font-semibold">
                <span>Max Debt / Equity</span>
                <span className="text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{maxDebt}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2.0"
                step="0.1"
                value={maxDebt}
                onChange={(e) => setMaxDebt(Number(e.target.value))}
                className="w-full accent-[#3A7BD5]"
              />
            </div>
          </div>
        </div>

        {/* Screener Results Table */}
        <div className="p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
              Screened Results ({filteredStocks.length} Companies)
            </span>
            <span className="text-[11px] font-mono text-[#6F6A64]">
              ORDER: MARKET CAPITALIZATION (DESC)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8] text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
                  <th className="py-2.5 px-3 font-semibold uppercase">Company</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Price</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Market Cap</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">P/E</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Ind. P/E</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">ROE</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">ROCE</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">D/E</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24201D]/40 dark:divide-[#24201D]/40 light:divide-[#E8E2D8]">
                {filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-xs font-mono text-[#A9A39B]">
                      No companies match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stock) => {
                    const peFavorable = stock.pe <= stock.industryPe;
                    return (
                      <tr key={stock.ticker} className="hover:bg-[#181615] dark:hover:bg-[#181615] light:hover:bg-[#FAF7F2]">
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{stock.ticker}</div>
                          <div className="text-[11px] text-[#A9A39B]">{stock.name}</div>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{stock.price}</td>
                        <td className="py-3 px-3 text-right text-[#A9A39B]">{stock.marketCap}</td>
                        <td className={`py-3 px-3 text-right font-semibold ${peFavorable ? "text-[#4E9F76]" : "text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]"}`}>
                          {stock.pe}x
                        </td>
                        <td className="py-3 px-3 text-right text-[#A9A39B]">{stock.industryPe}x</td>
                        <td className="py-3 px-3 text-right font-semibold text-[#4E9F76]">{stock.roe}%</td>
                        <td className="py-3 px-3 text-right text-[#A9A39B]">{stock.roce}%</td>
                        <td className="py-3 px-3 text-right text-[#A9A39B]">{stock.debtToEquity}</td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/stocks/${stock.ticker}`}
                            className="px-2.5 py-1 rounded border border-[#2E2925] text-[#3A7BD5] hover:bg-[#3A7BD5] hover:text-white transition-colors"
                          >
                            View Analysis &rarr;
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

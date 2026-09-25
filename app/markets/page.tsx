"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { FinancialLineChart } from "@/components/ui/financial-charts";

const MARKET_INDICES = [
  { symbol: "NIFTY 50", price: "24,850.20", change: "+104.30", percent: "+0.42%", volume: "312.4M", positive: true },
  { symbol: "SENSEX", price: "81,620.40", change: "+312.10", percent: "+0.38%", volume: "248.1M", positive: true },
  { symbol: "BANK NIFTY", price: "51,280.15", change: "-78.40", percent: "-0.15%", volume: "185.6M", positive: false },
  { symbol: "NIFTY IT", price: "41,920.80", change: "+496.25", percent: "+1.20%", volume: "94.2M", positive: true },
  { symbol: "NIFTY PHARMA", price: "21,410.50", change: "+85.10", percent: "+0.40%", volume: "62.8M", positive: true },
];

const MARKET_CHART_DATA = {
  "1D": [
    { date: "09:15", value: 24745.9 },
    { date: "10:30", value: 24790.2 },
    { date: "11:45", value: 24810.0 },
    { date: "13:00", value: 24785.4 },
    { date: "14:15", value: 24830.1 },
    { date: "15:30", value: 24850.2 },
  ],
  "1W": [
    { date: "Mon", value: 24650 },
    { date: "Tue", value: 24710 },
    { date: "Wed", value: 24690 },
    { date: "Thu", value: 24800 },
    { date: "Fri", value: 24850 },
  ],
  "1M": [
    { date: "01 Sep", value: 24100 },
    { date: "08 Sep", value: 24350 },
    { date: "15 Sep", value: 24200 },
    { date: "22 Sep", value: 24680 },
    { date: "28 Sep", value: 24850 },
  ],
  "1Y": [
    { date: "Q3 25", value: 19800 },
    { date: "Q4 25", value: 21200 },
    { date: "Q1 26", value: 22400 },
    { date: "Q2 26", value: 23600 },
    { date: "Q3 26", value: 24850 },
  ],
};

const GAINERS = [
  { ticker: "TCS", name: "Tata Consultancy Services", price: "₹4,120.10", change: "+₹112.40", percent: "+2.80%", volume: "4.2M", pe: "31.2x" },
  { ticker: "INFY", name: "Infosys Ltd", price: "₹1,780.25", change: "+₹38.50", percent: "+2.21%", volume: "8.1M", pe: "26.4x" },
  { ticker: "TECHM", name: "Tech Mahindra Ltd", price: "₹1,560.80", change: "+₹29.10", percent: "+1.90%", volume: "3.5M", pe: "28.1x" },
  { ticker: "SUNPHARMA", name: "Sun Pharmaceutical", price: "₹1,720.00", change: "+₹24.00", percent: "+1.41%", volume: "2.1M", pe: "34.5x" },
  { ticker: "RELIANCE", name: "Reliance Industries", price: "₹2,940.50", change: "+₹31.20", percent: "+1.07%", volume: "11.4M", pe: "24.5x" },
];

const LOSERS = [
  { ticker: "KOTAKBANK", name: "Kotak Mahindra Bank", price: "₹1,740.20", change: "-₹32.40", percent: "-1.83%", volume: "3.1M", pe: "18.2x" },
  { ticker: "BAJFINANCE", name: "Bajaj Finance Ltd", price: "₹6,890.00", change: "-₹85.00", percent: "-1.22%", volume: "1.8M", pe: "27.8x" },
  { ticker: "HDFCBANK", name: "HDFC Bank Ltd", price: "₹1,645.80", change: "-₹14.20", percent: "-0.86%", volume: "14.2M", pe: "19.1x" },
  { ticker: "TATAMOTORS", name: "Tata Motors Ltd", price: "₹960.50", change: "-₹7.10", percent: "-0.73%", volume: "7.9M", pe: "10.4x" },
  { ticker: "MARUTI", name: "Maruti Suzuki India", price: "₹12,240.00", change: "-₹62.00", percent: "-0.50%", volume: "0.8M", pe: "26.1x" },
];

const MOST_ACTIVE = [
  { ticker: "HDFCBANK", name: "HDFC Bank Ltd", price: "₹1,645.80", change: "-₹14.20", percent: "-0.86%", volume: "14.2M", turnover: "₹2,340 Cr" },
  { ticker: "RELIANCE", name: "Reliance Industries", price: "₹2,940.50", change: "+₹31.20", percent: "+1.07%", volume: "11.4M", turnover: "₹3,350 Cr" },
  { ticker: "INFY", name: "Infosys Ltd", price: "₹1,780.25", change: "+₹38.50", percent: "+2.21%", volume: "8.1M", turnover: "₹1,440 Cr" },
  { ticker: "ICICIBANK", name: "ICICI Bank Ltd", price: "₹1,180.00", change: "+₹4.50", percent: "+0.38%", volume: "6.8M", turnover: "₹802 Cr" },
];

const FIFTY_TWO_WEEK_HIGH = [
  { ticker: "TCS", name: "Tata Consultancy Services", price: "₹4,120.10", high: "₹4,120.10", distance: "0.0%", rsi: "68.2" },
  { ticker: "SUNPHARMA", name: "Sun Pharmaceutical", price: "₹1,720.00", high: "₹1,725.00", distance: "-0.29%", rsi: "64.1" },
  { ticker: "BHARTIARTL", name: "Bharti Airtel Ltd", price: "₹1,540.00", high: "₹1,552.00", distance: "-0.77%", rsi: "71.0" },
];

export default function MarketsPage() {
  const [selectedTab, setSelectedTab] = useState<"gainers" | "losers" | "active" | "52whigh">("gainers");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Market Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8]">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Market Intelligence
            </h1>
            <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
              Real-time index feeds, benchmark movements, and sector volume activity.
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search index or stock ticker..."
              className="w-full h-9 px-3 rounded border text-xs font-mono outline-none transition-colors bg-[#151312] border-[#24201D] text-[#FAF7F2] focus:border-[#3A7BD5] placeholder-[#6F6A64] dark:bg-[#151312] dark:border-[#24201D] dark:text-[#FAF7F2] light:bg-[#FFFFFF] light:border-[#DDD5C9] light:text-[#171514]"
            />
          </div>
        </div>

        {/* Top Indices Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {MARKET_INDICES.map((index) => (
            <div
              key={index.symbol}
              className="p-4 rounded border transition-colors bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-1 font-mono"
            >
              <div className="flex justify-between items-center text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
                <span className="font-bold">{index.symbol}</span>
                <span className="text-[10px]">VOL: {index.volume}</span>
              </div>
              <div className="text-base font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                {index.price}
              </div>
              <div
                className={`text-[11px] font-semibold ${
                  index.positive
                    ? "text-[#4E9F76] dark:text-[#4E9F76] light:text-[#2E8555]"
                    : "text-[#D9534F] dark:text-[#D9534F] light:text-[#C0392B]"
                }`}
              >
                {index.change} ({index.percent})
              </div>
            </div>
          ))}
        </div>

        {/* Benchmark Chart Area */}
        <div className="p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
                NIFTY 50 Benchmark Intraday &amp; Historical Trajectory
              </span>
            </div>
            <Badge variant="info">SESSION: ACTIVE</Badge>
          </div>
          <FinancialLineChart data={MARKET_CHART_DATA} initialTimeframe="1D" height={220} currencyPrefix="" />
        </div>

        {/* Dense Financial Tables & Tabs */}
        <div className="p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8]">
            <div className="flex items-center gap-1">
              {[
                { id: "gainers", label: "Top Gainers" },
                { id: "losers", label: "Top Losers" },
                { id: "active", label: "Most Active" },
                { id: "52whigh", label: "52 Week High" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                    selectedTab === tab.id
                      ? "bg-[#211F1D] text-[#FAF7F2] border border-[#2E2925] dark:bg-[#211F1D] dark:text-[#FAF7F2] light:bg-[#ECE8E1] light:text-[#171514]"
                      : "text-[#A9A39B] hover:text-[#FAF7F2] dark:text-[#A9A39B] dark:hover:text-[#FAF7F2] light:text-[#6F6A64] light:hover:text-[#171514]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono text-[#A9A39B]">
              UPDATED EVERY 15 SECONDS
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8] text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
                  <th className="py-2.5 px-3 font-semibold uppercase">Company</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Price</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Change</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Change %</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Volume</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24201D]/40 dark:divide-[#24201D]/40 light:divide-[#E8E2D8]">
                {selectedTab === "gainers" &&
                  GAINERS.map((stock) => (
                    <tr key={stock.ticker} className="hover:bg-[#181615] dark:hover:bg-[#181615] light:hover:bg-[#FAF7F2]">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{stock.ticker}</div>
                        <div className="text-[11px] text-[#A9A39B]">{stock.name}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{stock.price}</td>
                      <td className="py-3 px-3 text-right text-[#4E9F76] font-semibold">{stock.change}</td>
                      <td className="py-3 px-3 text-right text-[#4E9F76] font-semibold">{stock.percent}</td>
                      <td className="py-3 px-3 text-right text-[#A9A39B]">{stock.volume}</td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/stocks/${stock.ticker}`}
                          className="px-2.5 py-1 rounded border border-[#2E2925] text-[#3A7BD5] hover:bg-[#3A7BD5] hover:text-white transition-colors"
                        >
                          Analysis &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}

                {selectedTab === "losers" &&
                  LOSERS.map((stock) => (
                    <tr key={stock.ticker} className="hover:bg-[#181615] dark:hover:bg-[#181615] light:hover:bg-[#FAF7F2]">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{stock.ticker}</div>
                        <div className="text-[11px] text-[#A9A39B]">{stock.name}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{stock.price}</td>
                      <td className="py-3 px-3 text-right text-[#D9534F] font-semibold">{stock.change}</td>
                      <td className="py-3 px-3 text-right text-[#D9534F] font-semibold">{stock.percent}</td>
                      <td className="py-3 px-3 text-right text-[#A9A39B]">{stock.volume}</td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/stocks/${stock.ticker}`}
                          className="px-2.5 py-1 rounded border border-[#2E2925] text-[#3A7BD5] hover:bg-[#3A7BD5] hover:text-white transition-colors"
                        >
                          Analysis &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}

                {selectedTab === "active" &&
                  MOST_ACTIVE.map((stock) => (
                    <tr key={stock.ticker} className="hover:bg-[#181615] dark:hover:bg-[#181615] light:hover:bg-[#FAF7F2]">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{stock.ticker}</div>
                        <div className="text-[11px] text-[#A9A39B]">{stock.name}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{stock.price}</td>
                      <td className="py-3 px-3 text-right font-semibold">{stock.change}</td>
                      <td className="py-3 px-3 text-right font-semibold">{stock.percent}</td>
                      <td className="py-3 px-3 text-right text-[#A9A39B]">{stock.volume} ({stock.turnover})</td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/stocks/${stock.ticker}`}
                          className="px-2.5 py-1 rounded border border-[#2E2925] text-[#3A7BD5] hover:bg-[#3A7BD5] hover:text-white transition-colors"
                        >
                          Analysis &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}

                {selectedTab === "52whigh" &&
                  FIFTY_TWO_WEEK_HIGH.map((stock) => (
                    <tr key={stock.ticker} className="hover:bg-[#181615] dark:hover:bg-[#181615] light:hover:bg-[#FAF7F2]">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{stock.ticker}</div>
                        <div className="text-[11px] text-[#A9A39B]">{stock.name}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{stock.price}</td>
                      <td className="py-3 px-3 text-right text-[#4E9F76] font-semibold">High: {stock.high}</td>
                      <td className="py-3 px-3 text-right text-[#A9A39B] font-semibold">{stock.distance} from High</td>
                      <td className="py-3 px-3 text-right text-[#A9A39B]">RSI: {stock.rsi}</td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/stocks/${stock.ticker}`}
                          className="px-2.5 py-1 rounded border border-[#2E2925] text-[#3A7BD5] hover:bg-[#3A7BD5] hover:text-white transition-colors"
                        >
                          Analysis &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

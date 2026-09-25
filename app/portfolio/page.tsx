"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { AssetDonutChart } from "@/components/ui/financial-charts";
import { Modal } from "@/components/ui/modal";

interface Holding {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  invested: number;
  currentValue: number;
  returns: number;
  returnsPercent: number;
  allocation: number;
}

const INITIAL_HOLDINGS: Holding[] = [
  {
    id: "h1",
    ticker: "RELIANCE",
    name: "Reliance Industries Ltd",
    sector: "Energy & Telecom",
    quantity: 120,
    avgPrice: 2650.0,
    currentPrice: 2940.5,
    invested: 318000,
    currentValue: 352860,
    returns: 34860,
    returnsPercent: 10.96,
    allocation: 26.88,
  },
  {
    id: "h2",
    ticker: "TCS",
    name: "Tata Consultancy Services",
    sector: "Information Technology",
    quantity: 65,
    avgPrice: 3820.0,
    currentPrice: 4120.1,
    invested: 248300,
    currentValue: 267806,
    returns: 19506,
    returnsPercent: 7.86,
    allocation: 20.40,
  },
  {
    id: "h3",
    ticker: "HDFCBANK",
    name: "HDFC Bank Ltd",
    sector: "Financial Services",
    quantity: 140,
    avgPrice: 1580.0,
    currentPrice: 1645.8,
    invested: 221200,
    currentValue: 230412,
    returns: 9212,
    returnsPercent: 4.16,
    allocation: 17.55,
  },
  {
    id: "h4",
    ticker: "INFY",
    name: "Infosys Ltd",
    sector: "Information Technology",
    quantity: 90,
    avgPrice: 1620.0,
    currentPrice: 1780.25,
    invested: 145800,
    currentValue: 160222,
    returns: 14422,
    returnsPercent: 9.89,
    allocation: 12.21,
  },
  {
    id: "h5",
    ticker: "TITAN",
    name: "Titan Company Ltd",
    sector: "Consumer Discretionary",
    quantity: 35,
    avgPrice: 3150.0,
    currentPrice: 3420.0,
    invested: 110250,
    currentValue: 119700,
    returns: 9450,
    returnsPercent: 8.57,
    allocation: 9.12,
  },
  {
    id: "h6",
    ticker: "GOLD BEES",
    name: "Nippon India Gold ETF",
    sector: "Commodities & Gold",
    quantity: 2500,
    avgPrice: 52.0,
    currentPrice: 58.5,
    invested: 130000,
    currentValue: 146250,
    returns: 16250,
    returnsPercent: 12.50,
    allocation: 11.14,
  },
];

const SECTOR_SLICES = [
  { label: "Information Tech", value: 428028, percentage: 32.6, color: "#3A7BD5" },
  { label: "Energy & Telecom", value: 352860, percentage: 26.9, color: "#4E9F76" },
  { label: "Financial Services", value: 230412, percentage: 17.6, color: "#D9822B" },
  { label: "Commodities/Gold", value: 146250, percentage: 11.1, color: "#FED5A2" },
  { label: "Consumer Goods", value: 119700, percentage: 9.1, color: "#8E8880" },
  { label: "Cash Reserves", value: 35250, percentage: 2.7, color: "#9C6ADE" },
];

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>(INITIAL_HOLDINGS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Holding Form state
  const [newCompany, setNewCompany] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newAvgPrice, setNewAvgPrice] = useState("");
  const [newDate, setNewDate] = useState("");

  const totalInvested = holdings.reduce((sum, h) => sum + h.invested, 0);
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalReturns = totalCurrentValue - totalInvested;
  const totalReturnsPercent = ((totalReturns / (totalInvested || 1)) * 100).toFixed(2);

  const handleAddHolding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newQuantity || !newAvgPrice) return;

    const qty = parseFloat(newQuantity);
    const price = parseFloat(newAvgPrice);
    const invested = qty * price;
    const ticker = newCompany.toUpperCase().slice(0, 8);

    const newH: Holding = {
      id: `h_${Date.now()}`,
      ticker,
      name: `${newCompany} Ltd`,
      sector: "Equity Holdings",
      quantity: qty,
      avgPrice: price,
      currentPrice: price,
      invested,
      currentValue: invested,
      returns: 0,
      returnsPercent: 0,
      allocation: 5.0,
    };

    setHoldings([newH, ...holdings]);
    setIsAddModalOpen(false);
    setNewCompany("");
    setNewQuantity("");
    setNewAvgPrice("");
    setNewDate("");
  };

  const handleDeleteHolding = (id: string) => {
    setHoldings(holdings.filter((h) => h.id !== id));
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8]">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Your Portfolio
            </h1>
            <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
              Track holdings, asset allocation, sector concentration, and structural risk.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            type="button"
            className="px-4 py-2 rounded text-xs font-mono font-semibold transition-colors bg-[#FAF7F2] text-[#0F0D0C] hover:bg-[#E6E1D8] dark:bg-[#FAF7F2] dark:text-[#0F0D0C] light:bg-[#171514] light:text-[#FAF7F2] cursor-pointer"
          >
            + Add Holding
          </button>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Portfolio Value"
            value={`₹${totalCurrentValue.toLocaleString("en-IN")}`}
            change={`₹${totalReturns.toLocaleString("en-IN")}`}
            changePercent={`${totalReturnsPercent}%`}
            isPositive={totalReturns >= 0}
            secondaryText="Holdings: 6 Asset Classes"
          />
          <MetricCard
            label="Invested Amount"
            value={`₹${totalInvested.toLocaleString("en-IN")}`}
            secondaryText="Unrealized Capital Gain"
          />
          <MetricCard
            label="Total Returns"
            value={`+₹${totalReturns.toLocaleString("en-IN")}`}
            changePercent={`+${totalReturnsPercent}%`}
            isPositive={true}
            secondaryText="Annualized IRR: 14.8%"
          />
          <MetricCard
            label="Today's Change"
            value="+₹8,420"
            changePercent="+0.65%"
            isPositive={true}
            secondaryText="Beta-weighted vs NIFTY"
          />
        </div>

        {/* Holdings Table */}
        <div className="p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
              Current Holdings ({holdings.length} Positions)
            </span>
            <span className="text-[11px] font-mono text-[#A9A39B]">PRICING: LIVE BSE/NSE</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8] text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
                  <th className="py-2.5 px-3 font-semibold uppercase">Company</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Quantity</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Avg Price</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Current Price</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Invested</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Current Value</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Returns</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Alloc %</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24201D]/40 dark:divide-[#24201D]/40 light:divide-[#E8E2D8]">
                {holdings.map((h) => {
                  const isPos = h.returns >= 0;
                  return (
                    <tr key={h.id} className="hover:bg-[#181615] dark:hover:bg-[#181615] light:hover:bg-[#FAF7F2]">
                      <td className="py-3 px-3">
                        <Link href={`/stocks/${h.ticker}`} className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514] hover:text-[#3A7BD5] hover:underline">
                          {h.ticker}
                        </Link>
                        <div className="text-[11px] text-[#A9A39B]">{h.sector}</div>
                      </td>
                      <td className="py-3 px-3 text-right text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{h.quantity}</td>
                      <td className="py-3 px-3 text-right text-[#A9A39B]">₹{h.avgPrice.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-3 text-right font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">₹{h.currentPrice.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-3 text-right text-[#A9A39B]">₹{h.invested.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-3 text-right font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">₹{h.currentValue.toLocaleString("en-IN")}</td>
                      <td className={`py-3 px-3 text-right font-semibold ${isPos ? "text-[#4E9F76] dark:text-[#4E9F76] light:text-[#2E8555]" : "text-[#D9534F] dark:text-[#D9534F] light:text-[#C0392B]"}`}>
                        {isPos ? "+" : ""}₹{h.returns.toLocaleString("en-IN")} ({isPos ? "+" : ""}{h.returnsPercent}%)
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{h.allocation}%</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteHolding(h.id)}
                          aria-label={`Delete ${h.ticker}`}
                          className="text-[#D9534F] hover:underline text-[11px] p-1"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sector Diversification & Portfolio Review */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sector Diversification (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64] block mb-4">
                Sector Concentration Breakdown
              </span>
              <AssetDonutChart slices={SECTOR_SLICES} totalValue="100%" />
            </div>

            <div className="mt-4 pt-3 border-t border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8] text-[11px] font-mono text-[#6F6A64] dark:text-[#6F6A64] light:text-[#9E978F]">
              Top 3 sectors comprise 77.1% of equity exposure.
            </div>
          </div>

          {/* Wealthzy Portfolio Review (7 cols) */}
          <div className="lg:col-span-7 p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-inherit">
              <span className="text-xs font-mono uppercase tracking-wider font-bold">
                Wealthzy Portfolio Review
              </span>
              <Badge variant="positive">HEALTH RATING: ROBUST</Badge>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded border border-[#2E2925] dark:border-[#2E2925] light:border-[#E8E2D8] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] space-y-1">
                <div className="flex justify-between font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                  <span>1. Diversification &amp; Concentration</span>
                  <span className="text-[#4E9F76]">Score: 82/100</span>
                </div>
                <p className="text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64] leading-relaxed">
                  Holdings are distributed across 5 core industry segments. Technology weighting is slightly elevated at 32.6%.
                </p>
              </div>

              <div className="p-3 rounded border border-[#2E2925] dark:border-[#2E2925] light:border-[#E8E2D8] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] space-y-1">
                <div className="flex justify-between font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                  <span>2. Valuation &amp; Quality Metrics</span>
                  <span className="text-[#4E9F76]">Score: 88/100</span>
                </div>
                <p className="text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64] leading-relaxed">
                  Portfolio weighted average ROE stands at 24.8% against an aggregate P/E multiple of 26.2x, indicating above-average business quality.
                </p>
              </div>

              <div className="p-3 rounded border border-[#2E2925] dark:border-[#2E2925] light:border-[#E8E2D8] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] space-y-1">
                <div className="flex justify-between font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                  <span>3. Drawdown Cushion</span>
                  <span className="text-[#3A7BD5]">Score: 78/100</span>
                </div>
                <p className="text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64] leading-relaxed">
                  11.1% allocation to Gold ETF provides negative correlation hedge during equity consolidation phases.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Holding Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Portfolio Holding"
          subtitle="Log a purchased asset to update your portfolio intelligence analytics."
        >
          <form onSubmit={handleAddHolding} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-[#A9A39B] uppercase tracking-wider mb-1.5 font-semibold">
                Company / Asset Ticker
              </label>
              <input
                type="text"
                required
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                placeholder="e.g. INFY or ICICIBANK"
                className="w-full h-10 px-3 rounded border bg-[#181615] border-[#2A2420] text-[#FAF7F2] outline-none dark:bg-[#181615] dark:border-[#2A2420] dark:text-[#FAF7F2] light:bg-[#FAF7F2] light:border-[#DDD5C9] light:text-[#171514]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#A9A39B] uppercase tracking-wider mb-1.5 font-semibold">
                  Quantity
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  placeholder="50"
                  className="w-full h-10 px-3 rounded border bg-[#181615] border-[#2A2420] text-[#FAF7F2] outline-none dark:bg-[#181615] dark:border-[#2A2420] dark:text-[#FAF7F2] light:bg-[#FAF7F2] light:border-[#DDD5C9] light:text-[#171514]"
                />
              </div>

              <div>
                <label className="block text-[#A9A39B] uppercase tracking-wider mb-1.5 font-semibold">
                  Avg Buy Price (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={newAvgPrice}
                  onChange={(e) => setNewAvgPrice(e.target.value)}
                  placeholder="1450.00"
                  className="w-full h-10 px-3 rounded border bg-[#181615] border-[#2A2420] text-[#FAF7F2] outline-none dark:bg-[#181615] dark:border-[#2A2420] dark:text-[#FAF7F2] light:bg-[#FAF7F2] light:border-[#DDD5C9] light:text-[#171514]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#A9A39B] uppercase tracking-wider mb-1.5 font-semibold">
                Purchase Date
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full h-10 px-3 rounded border bg-[#181615] border-[#2A2420] text-[#FAF7F2] outline-none dark:bg-[#181615] dark:border-[#2A2420] dark:text-[#FAF7F2] light:bg-[#FAF7F2] light:border-[#DDD5C9] light:text-[#171514]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded border border-[#2E2925] text-[#A9A39B] hover:text-[#FAF7F2]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded font-semibold bg-[#FAF7F2] text-[#0F0D0C] hover:bg-[#E6E1D8] dark:bg-[#FAF7F2] dark:text-[#0F0D0C] light:bg-[#171514] light:text-[#FAF7F2]"
              >
                Add Holding
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}

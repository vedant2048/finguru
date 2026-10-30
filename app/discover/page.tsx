"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";

interface StockRecord {
  ticker: string;
  name: string;
  sector: string;
  price: string;
  rawPrice?: number;
  change?: string;
  percent?: string;
  positive?: boolean;
  marketCap: string;
  rawMarketCap?: number;
  pe: number | null;
  industryPe: number | null;
  roe: number | null;
  roce: number | null;
  debtToEquity: number | null;
  exchange?: string;
}

type SortField = "ticker" | "rawPrice" | "rawMarketCap" | "pe" | "industryPe" | "roe" | "roce" | "debtToEquity";
type SortOrder = "asc" | "desc";

export default function DiscoverPage() {
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [maxPe, setMaxPe] = useState<number>(100);
  const [minRoe, setMinRoe] = useState<number>(0);
  const [maxDebt, setMaxDebt] = useState<number>(3.5);
  const [stocks, setStocks] = useState<StockRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [sortField, setSortField] = useState<SortField>("rawMarketCap");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadDiscoverStocks() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/market/discover");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.stocks) && data.stocks.length > 0) {
          setStocks(data.stocks);
          setIsLive(true);
        }
      } catch {
        // Handled gracefully
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadDiscoverStocks();
  }, []);

  // In-memory filter logic ensures slider adjustments never cause redundant API calls
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      if (selectedSector !== "all" && stock.sector !== selectedSector) return false;

      // P/E filter
      if (maxPe < 100) {
        if (stock.pe == null || stock.pe > maxPe) return false;
      }

      // Min ROE filter
      if (minRoe > 0) {
        if (stock.roe == null || stock.roe < minRoe) return false;
      }

      // Max Debt/Equity filter
      if (maxDebt < 3.5) {
        if (stock.debtToEquity != null && stock.debtToEquity > maxDebt) return false;
      }

      // Search & Natural language filtering
      if (naturalLanguageQuery.trim()) {
        const q = naturalLanguageQuery.toLowerCase();
        const matchesText =
          stock.ticker.toLowerCase().includes(q) ||
          stock.name.toLowerCase().includes(q) ||
          stock.sector.toLowerCase().includes(q);

        const mentionsRoe = q.includes("roe") && (stock.roe == null || stock.roe >= 15);
        const mentionsDebt = (q.includes("debt") || q.includes("debt-free")) && (stock.debtToEquity == null || stock.debtToEquity <= 0.2);
        const mentionsLargeCap = q.includes("large-cap") || q.includes("large cap");

        if (!matchesText && !mentionsRoe && !mentionsDebt && !mentionsLargeCap) {
          return false;
        }
      }

      return true;
    });
  }, [stocks, selectedSector, maxPe, minRoe, maxDebt, naturalLanguageQuery]);

  // In-memory sorting logic
  const sortedStocks = useMemo(() => {
    return [...filteredStocks].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Always push null / undefined to the bottom
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }

      const diff = (aVal as number) - (bVal as number);
      return sortOrder === "asc" ? diff : -diff;
    });
  }, [filteredStocks, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder(field === "ticker" ? "asc" : "desc");
    }
  };

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
    setMaxDebt(3.5);
    setNaturalLanguageQuery("");
  };

  const toggleCompare = (ticker: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(ticker)) {
        return prev.filter((t) => t !== ticker);
      }
      if (prev.length >= 4) {
        alert("You can compare up to 4 stocks at a time.");
        return prev;
      }
      return [...prev, ticker];
    });
  };

  const comparedStocks = useMemo(() => {
    return stocks.filter((s) => selectedForCompare.includes(s.ticker));
  }, [stocks, selectedForCompare]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-2 border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Discover</h1>
              {isLive ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#4E9F76]/15 text-[#4E9F76] border border-[#4E9F76]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4E9F76] animate-pulse" />
                  YAHOO FINANCE FUNDAMENTALS (CACHED)
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#3A7BD5]/15 text-[#3A7BD5] border border-[#3A7BD5]/30">
                  LOADING MARKET DATA...
                </span>
              )}
            </div>
            <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
              Find Indian equities using authentic Yahoo Finance quotes and fundamental metrics cached in your database.
            </p>
          </div>

          {selectedForCompare.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="px-3.5 py-1.5 rounded bg-[#3A7BD5] text-white text-xs font-mono font-semibold flex items-center gap-2 hover:bg-[#2F66B2] transition-colors cursor-pointer"
            >
              <span>Compare Selected ({selectedForCompare.length})</span>
            </button>
          )}
        </div>

        {/* Natural Language Prompt & Presets */}
        <div className="p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
              Natural Language Screening Query
            </span>
            <Badge variant="info">SCREENER: CLIENT-SIDE EXECUTION</Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={naturalLanguageQuery}
              onChange={(e) => setNaturalLanguageQuery(e.target.value)}
              placeholder="e.g. Find large-cap companies with strong ROE and moderate valuation."
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
              className="px-2.5 py-1 rounded text-[11px] font-mono border border-[#2E2925] text-[#A9A39B] hover:text-[#FAF7F2] hover:border-[#3A7BD5] transition-colors cursor-pointer"
            >
              High ROE &gt; 20%
            </button>
            <button
              onClick={() => handleApplyPreset("low_debt")}
              className="px-2.5 py-1 rounded text-[11px] font-mono border border-[#2E2925] text-[#A9A39B] hover:text-[#FAF7F2] hover:border-[#3A7BD5] transition-colors cursor-pointer"
            >
              Virtually Debt-Free (&lt;0.1)
            </button>
            <button
              onClick={() => handleApplyPreset("below_pe")}
              className="px-2.5 py-1 rounded text-[11px] font-mono border border-[#2E2925] text-[#A9A39B] hover:text-[#FAF7F2] hover:border-[#3A7BD5] transition-colors cursor-pointer"
            >
              Valuation &lt; 25x P/E
            </button>
          </div>
        </div>

        {/* Screener Controls */}
        <div className="p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8]">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
              Parametric Constraints &amp; Sliders
            </span>
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-mono text-[#3A7BD5] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            {/* Sector Select */}
            <div>
              <label className="block text-[#A9A39B] mb-1.5 font-semibold">Sector Allocation</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full h-9 px-2 rounded border bg-[#181615] border-[#2E2925] text-[#FAF7F2] outline-none dark:bg-[#181615] dark:border-[#2E2925] dark:text-[#FAF7F2] light:bg-[#FAF7F2] light:border-[#DDD5C9] light:text-[#171514]"
              >
                <option value="all">All Sectors</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Energy & Telecom">Energy & Telecom</option>
                <option value="Consumer Discretionary">Consumer Discretionary</option>
                <option value="Consumer Goods">Consumer Goods</option>
                <option value="Capital Goods & Infra">Capital Goods & Infra</option>
                <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                <option value="Automobiles">Automobiles</option>
                <option value="Materials & Metals">Materials & Metals</option>
                <option value="Energy & Utilities">Energy & Utilities</option>
              </select>
            </div>

            {/* Max P/E */}
            <div>
              <div className="flex justify-between items-center text-[#A9A39B] mb-1.5 font-semibold">
                <span>Max P/E Multiple</span>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={maxPe}
                  onChange={(e) => setMaxPe(Math.max(5, Math.min(100, Number(e.target.value) || 0)))}
                  className="w-14 h-6 px-1.5 text-right rounded border bg-[#181615] border-[#2E2925] text-[#FAF7F2] text-[11px] outline-none"
                />
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={maxPe}
                onChange={(e) => setMaxPe(Number(e.target.value))}
                className="w-full accent-[#3A7BD5] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#6F6A64]">
                <span>5x</span>
                <span>100x (Any)</span>
              </div>
            </div>

            {/* Min ROE */}
            <div>
              <div className="flex justify-between items-center text-[#A9A39B] mb-1.5 font-semibold">
                <span>Min ROE (%)</span>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={minRoe}
                  onChange={(e) => setMinRoe(Math.max(0, Math.min(50, Number(e.target.value) || 0)))}
                  className="w-14 h-6 px-1.5 text-right rounded border bg-[#181615] border-[#2E2925] text-[#FAF7F2] text-[11px] outline-none"
                />
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={minRoe}
                onChange={(e) => setMinRoe(Number(e.target.value))}
                className="w-full accent-[#3A7BD5] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#6F6A64]">
                <span>0% (Any)</span>
                <span>50%</span>
              </div>
            </div>

            {/* Max Debt/Equity */}
            <div>
              <div className="flex justify-between items-center text-[#A9A39B] mb-1.5 font-semibold">
                <span>Max Debt / Equity</span>
                <input
                  type="number"
                  min="0"
                  max="3.5"
                  step="0.1"
                  value={maxDebt}
                  onChange={(e) => setMaxDebt(Math.max(0, Math.min(3.5, Number(e.target.value) || 0)))}
                  className="w-14 h-6 px-1.5 text-right rounded border bg-[#181615] border-[#2E2925] text-[#FAF7F2] text-[11px] outline-none"
                />
              </div>
              <input
                type="range"
                min="0"
                max="3.5"
                step="0.1"
                value={maxDebt}
                onChange={(e) => setMaxDebt(Number(e.target.value))}
                className="w-full accent-[#3A7BD5] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#6F6A64]">
                <span>0.0</span>
                <span>3.5 (Any)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Screener Results Table */}
        <div className="p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
              Screened Results ({sortedStocks.length} of {stocks.length} Companies)
            </span>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#6F6A64]">
              <span>Click column headers to sort</span>
              <span>•</span>
              <span>YAHOO FINANCE LIVE</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8] text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
                  <th className="py-2.5 px-2 w-8 text-center">Compare</th>
                  <th
                    onClick={() => handleSort("ticker")}
                    className="py-2.5 px-3 font-semibold uppercase cursor-pointer hover:text-[#FAF7F2] transition-colors"
                  >
                    Company {sortField === "ticker" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th
                    onClick={() => handleSort("rawPrice")}
                    className="py-2.5 px-3 font-semibold uppercase text-right cursor-pointer hover:text-[#FAF7F2] transition-colors"
                  >
                    Live Price {sortField === "rawPrice" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th
                    onClick={() => handleSort("rawMarketCap")}
                    className="py-2.5 px-3 font-semibold uppercase text-right cursor-pointer hover:text-[#FAF7F2] transition-colors"
                  >
                    Market Cap {sortField === "rawMarketCap" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th
                    onClick={() => handleSort("pe")}
                    className="py-2.5 px-3 font-semibold uppercase text-right cursor-pointer hover:text-[#FAF7F2] transition-colors"
                  >
                    P/E {sortField === "pe" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th
                    onClick={() => handleSort("industryPe")}
                    className="py-2.5 px-3 font-semibold uppercase text-right cursor-pointer hover:text-[#FAF7F2] transition-colors"
                  >
                    Ind. P/E {sortField === "industryPe" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th
                    onClick={() => handleSort("roe")}
                    className="py-2.5 px-3 font-semibold uppercase text-right cursor-pointer hover:text-[#FAF7F2] transition-colors"
                  >
                    ROE {sortField === "roe" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th
                    onClick={() => handleSort("roce")}
                    className="py-2.5 px-3 font-semibold uppercase text-right cursor-pointer hover:text-[#FAF7F2] transition-colors"
                  >
                    ROCE {sortField === "roce" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th
                    onClick={() => handleSort("debtToEquity")}
                    className="py-2.5 px-3 font-semibold uppercase text-right cursor-pointer hover:text-[#FAF7F2] transition-colors"
                  >
                    D/E {sortField === "debtToEquity" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24201D]/40 dark:divide-[#24201D]/40 light:divide-[#E8E2D8]">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-xs font-mono text-[#A9A39B]">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#3A7BD5] animate-ping" />
                        Fetching live fundamentals...
                      </div>
                    </td>
                  </tr>
                ) : sortedStocks.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-xs font-mono text-[#A9A39B]">
                      No companies match the current filter criteria. Try adjusting the sliders or reset filters.
                    </td>
                  </tr>
                ) : (
                  sortedStocks.map((stock) => {
                    const isChecked = selectedForCompare.includes(stock.ticker);
                    return (
                      <tr
                        key={stock.ticker}
                        className={`hover:bg-[#181615] dark:hover:bg-[#181615] light:hover:bg-[#FAF7F2] transition-colors ${isChecked ? "bg-[#3A7BD5]/10" : ""
                          }`}
                      >
                        <td className="py-3 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCompare(stock.ticker)}
                            className="cursor-pointer accent-[#3A7BD5]"
                            title="Select for side-by-side comparison"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                            {stock.ticker}
                          </div>
                          <div className="text-[11px] text-[#A9A39B]">{stock.name}</div>
                          <div className="text-[10px] text-[#6F6A64]">{stock.sector}</div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                            {stock.price}
                          </div>
                          {stock.percent && (
                            <div
                              className={`text-[10px] font-semibold ${stock.positive ? "text-[#4E9F76]" : "text-[#D9534F]"
                                }`}
                            >
                              {stock.percent}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right text-[#A9A39B]">{stock.marketCap}</td>
                        <td className={`py-3 px-3 text-right font-semibold ${stock.pe != null && stock.industryPe != null && stock.pe <= stock.industryPe
                          ? "text-[#4E9F76]"
                          : "text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]"
                          }`}>
                          {stock.pe != null ? `${stock.pe}x` : <span className="text-[#6F6A64]">N/A</span>}
                        </td>
                        <td className="py-3 px-3 text-right text-[#A9A39B]">
                          {stock.industryPe != null ? `${stock.industryPe}x` : <span className="text-[#6F6A64]">N/A</span>}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-[#4E9F76]">
                          {stock.roe != null ? `${stock.roe}%` : <span className="text-[#6F6A64]">N/A</span>}
                        </td>
                        <td className="py-3 px-3 text-right text-[#A9A39B]">
                          {stock.roce != null ? `${stock.roce}%` : <span className="text-[#6F6A64]">N/A</span>}
                        </td>
                        <td className="py-3 px-3 text-right text-[#A9A39B]">
                          {stock.debtToEquity != null ? (
                            stock.debtToEquity
                          ) : (
                            <span className="text-[#6F6A64]">N/A</span>
                          )}
                        </td>
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

        {/* Stock Comparison Modal */}
        {showCompareModal && comparedStocks.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-4xl p-6 rounded-lg bg-[#151312] border border-[#24201D] text-xs font-mono space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#24201D]">
                <div>
                  <h2 className="text-base font-bold text-[#FAF7F2]">Stock Comparison Matrix</h2>
                  <p className="text-[11px] text-[#A9A39B]">Comparing fundamentals fetched live from Yahoo Finance</p>
                </div>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="px-2.5 py-1 rounded border border-[#2E2925] text-[#A9A39B] hover:text-white cursor-pointer"
                >
                  Close ✕
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left divide-y divide-[#24201D]">
                  <thead>
                    <tr className="text-[#A9A39B]">
                      <th className="py-2 px-3">Metric</th>
                      {comparedStocks.map((s) => (
                        <th key={s.ticker} className="py-2 px-3 text-right font-bold text-[#FAF7F2]">
                          {s.ticker}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#24201D]/40 text-[#FAF7F2]">
                    <tr>
                      <td className="py-2 px-3 text-[#A9A39B]">Company Name</td>
                      {comparedStocks.map((s) => (
                        <td key={s.ticker} className="py-2 px-3 text-right">
                          {s.name}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-[#A9A39B]">Sector</td>
                      {comparedStocks.map((s) => (
                        <td key={s.ticker} className="py-2 px-3 text-right text-[#A9A39B]">
                          {s.sector}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-[#A9A39B]">Live Price</td>
                      {comparedStocks.map((s) => (
                        <td key={s.ticker} className="py-2 px-3 text-right font-bold">
                          {s.price}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-[#A9A39B]">Market Cap</td>
                      {comparedStocks.map((s) => (
                        <td key={s.ticker} className="py-2 px-3 text-right">
                          {s.marketCap}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-[#A9A39B]">P/E Ratio</td>
                      {comparedStocks.map((s) => (
                        <td key={s.ticker} className="py-2 px-3 text-right">
                          {s.pe != null ? `${s.pe}x` : <span className="text-[#6F6A64]">N/A</span>}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-[#A9A39B]">Return on Equity (ROE)</td>
                      {comparedStocks.map((s) => (
                        <td key={s.ticker} className="py-2 px-3 text-right text-[#4E9F76] font-semibold">
                          {s.roe != null ? `${s.roe}%` : <span className="text-[#6F6A64]">N/A</span>}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-[#A9A39B]">Debt to Equity Ratio</td>
                      {comparedStocks.map((s) => (
                        <td key={s.ticker} className="py-2 px-3 text-right">
                          {s.debtToEquity != null ? s.debtToEquity : <span className="text-[#6F6A64]">N/A</span>}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-[#A9A39B]">Industry P/E</td>
                      {comparedStocks.map((s) => (
                        <td key={s.ticker} className="py-2 px-3 text-right text-[#A9A39B]">
                          {s.industryPe != null ? `${s.industryPe}x` : <span className="text-[#6F6A64]">N/A</span>}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-[#A9A39B]">Return on Capital Employed (ROCE)</td>
                      {comparedStocks.map((s) => (
                        <td key={s.ticker} className="py-2 px-3 text-right text-[#A9A39B]">
                          {s.roce != null ? `${s.roce}%` : <span className="text-[#6F6A64]">N/A</span>}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="px-4 py-2 rounded bg-[#3A7BD5] text-white hover:bg-[#2F66B2] cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

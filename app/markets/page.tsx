"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { FinancialLineChart } from "@/components/ui/financial-charts";
import { Skeleton } from "@/components/ui/skeleton";
import type { IndexQuote, MarketStockItem, ChartDataPoint } from "@/lib/market-data/types";
import { RefreshCw, Search } from "lucide-react";

export default function MarketsPage() {
  const [selectedTab, setSelectedTab] = useState<"gainers" | "losers" | "active" | "52whigh">("gainers");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MarketStockItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [indices, setIndices] = useState<IndexQuote[]>([]);
  const [chartData, setChartData] = useState<Record<string, ChartDataPoint[]>>({});
  const [gainers, setGainers] = useState<MarketStockItem[]>([]);
  const [losers, setLosers] = useState<MarketStockItem[]>([]);
  const [mostActive, setMostActive] = useState<MarketStockItem[]>([]);
  const [fiftyTwoWeekHigh, setFiftyTwoWeekHigh] = useState<MarketStockItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [, startTransition] = useTransition();

  const fetchOverview = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch("/api/market/overview");
      if (!res.ok) throw new Error("Failed to fetch market overview");
      const data = await res.json();
      if (data.success) {
        startTransition(() => {
          setIndices(data.indices || []);
          setChartData(data.chart || {});
          setGainers(data.gainers || []);
          setLosers(data.losers || []);
          setMostActive(data.mostActive || []);
          setFiftyTwoWeekHigh(data.fiftyTwoWeekHigh || []);
          if (data.updatedAt) {
            const date = new Date(data.updatedAt);
            setLastUpdated(date.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false }) + " IST");
          }
        });
      }
    } catch (err) {
      console.error("[MarketsPage] fetch overview error:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    // Auto-refresh every 45 seconds
    const interval = setInterval(() => {
      fetchOverview();
    }, 45000);
    return () => clearInterval(interval);
  }, [fetchOverview]);

  // Live search effect (debounced)
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (isMounted && json.success) {
          setSearchResults(json.results || []);
        }
      } catch (err) {
        console.error("[MarketsPage] Search error:", err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Determine which list to render
  const getActiveTabList = () => {
    switch (selectedTab) {
      case "gainers":
        return gainers;
      case "losers":
        return losers;
      case "active":
        return mostActive;
      case "52whigh":
        return fiftyTwoWeekHigh;
      default:
        return gainers;
    }
  };

  const activeList = getActiveTabList();

  // If query is present, check if filtered locally or use backend search results
  const isSearchActive = searchQuery.trim().length > 0;
  const filteredLocalList = isSearchActive
    ? activeList.filter(
      (s) =>
        s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : activeList;

  const displayStocks = isSearchActive
    ? filteredLocalList.length > 0
      ? filteredLocalList
      : searchResults
    : activeList;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Market Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Market Intelligence
              </h1>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#4E9F76]/15 text-[#4E9F76] border border-[#4E9F76]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4E9F76] animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
              Real-time index feeds, benchmark movements, and sector volume activity powered by Yahoo Finance.
            </p>
          </div>

          {/* Quick Search & Refresh */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search index or stock ticker..."
                className="w-full h-9 pl-8 pr-3 rounded border text-xs font-mono outline-none transition-colors bg-[#151312] border-[#24201D] text-[#FAF7F2] focus:border-[#3A7BD5] placeholder-[#6F6A64] dark:bg-[#151312] dark:border-[#24201D] dark:text-[#FAF7F2] light:bg-[#FFFFFF] light:border-[#DDD5C9] light:text-[#171514]"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6F6A64]" />
            </div>

            <button
              onClick={() => fetchOverview(true)}
              disabled={isRefreshing}
              title="Refresh real-time market data"
              className="h-9 px-3 rounded border border-[#24201D] bg-[#151312] hover:bg-[#1F1C1B] text-[#A9A39B] hover:text-[#FAF7F2] transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#3A7BD5]" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Top Indices Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-2"
              >
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))
            : indices.slice(0, 5).map((index) => (
              <div
                key={index.symbol}
                className="p-4 rounded border transition-colors bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-1 font-mono"
              >
                <div className="flex justify-between items-center text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
                  <span className="font-bold">{index.symbol}</span>
                  <span className="text-[10px] uppercase font-semibold text-[#6F6A64]">{index.volume}</span>
                </div>
                <div className="text-base font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                  {index.price}
                </div>
                <div
                  className={`text-[11px] font-semibold ${index.positive
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
            <div className="flex items-center gap-2">
              <Badge variant="info">SESSION: LIVE</Badge>
              {lastUpdated && (
                <span className="text-[10px] font-mono text-[#6F6A64]">
                  AS OF {lastUpdated}
                </span>
              )}
            </div>
          </div>
          {isLoading || !chartData["1D"] ? (
            <div className="h-[220px] flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <FinancialLineChart data={chartData} initialTimeframe="1D" height={220} currencyPrefix="" />
          )}
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
                  onClick={() => {
                    setSelectedTab(tab.id as any);
                    setSearchQuery("");
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${selectedTab === tab.id && !isSearchActive
                      ? "bg-[#211F1D] text-[#FAF7F2] border border-[#2E2925] dark:bg-[#211F1D] dark:text-[#FAF7F2] light:bg-[#ECE8E1] light:text-[#171514]"
                      : "text-[#A9A39B] hover:text-[#FAF7F2] dark:text-[#A9A39B] dark:hover:text-[#FAF7F2] light:text-[#6F6A64] light:hover:text-[#171514]"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono text-[#A9A39B]">
              {isSearching ? "SEARCHING..." : lastUpdated ? `UPDATED: ${lastUpdated}` : "AUTO-REFRESH 45S"}
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
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">
                    {selectedTab === "52whigh" ? "52W High / Dist" : "Volume / Turnover"}
                  </th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24201D]/40 dark:divide-[#24201D]/40 light:divide-[#E8E2D8]">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="border-b border-[#24201D]/40">
                      <td className="py-3 px-3"><Skeleton className="h-4 w-32" /></td>
                      <td className="py-3 px-3 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="py-3 px-3 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="py-3 px-3 text-right"><Skeleton className="h-4 w-14 ml-auto" /></td>
                      <td className="py-3 px-3 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                      <td className="py-3 px-3 text-right"><Skeleton className="h-6 w-20 ml-auto" /></td>
                    </tr>
                  ))
                ) : displayStocks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#A9A39B]">
                      {isSearchActive ? `No stocks found matching "${searchQuery}"` : "No market data available"}
                    </td>
                  </tr>
                ) : (
                  displayStocks.map((stock) => (
                    <tr
                      key={stock.ticker}
                      className="hover:bg-[#181615] dark:hover:bg-[#181615] light:hover:bg-[#FAF7F2] transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                          {stock.ticker}
                        </div>
                        <div className="text-[11px] text-[#A9A39B] truncate max-w-[220px]">
                          {stock.name}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                        {stock.price}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-semibold ${stock.positive ? "text-[#4E9F76]" : "text-[#D9534F]"
                          }`}
                      >
                        {stock.change}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-semibold ${stock.positive ? "text-[#4E9F76]" : "text-[#D9534F]"
                          }`}
                      >
                        {stock.percent}
                      </td>
                      <td className="py-3 px-3 text-right text-[#A9A39B]">
                        {selectedTab === "52whigh" && stock.high52 ? (
                          <div>
                            <div>{stock.high52}</div>
                            <span className="text-[10px] text-[#6F6A64]">{stock.distance52} from High</span>
                          </div>
                        ) : selectedTab === "active" && stock.turnover ? (
                          <div>
                            <div>{stock.turnover}</div>
                            <span className="text-[10px] text-[#6F6A64]">Vol: {stock.volume}</span>
                          </div>
                        ) : (
                          <div>
                            <div>{stock.volume}</div>
                            {stock.pe && <span className="text-[10px] text-[#6F6A64]">PE: {stock.pe}</span>}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/stocks/${stock.ticker}`}
                          className="px-2.5 py-1 rounded border border-[#2E2925] text-[#3A7BD5] hover:bg-[#3A7BD5] hover:text-white transition-colors"
                        >
                          Analysis &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

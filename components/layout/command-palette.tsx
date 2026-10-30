"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Stocks" | "Markets" | "Portfolio" | "Goals" | "Navigation";
  href: string;
  badge?: string;
  change?: string;
  positive?: boolean;
}

const BASE_SEARCH_DATABASE: SearchResultItem[] = [
  // Stocks
  { id: "s1", title: "RELIANCE", subtitle: "Reliance Industries Ltd • Energy & Telecom", category: "Stocks", href: "/stocks/RELIANCE", badge: "₹1,164.90" },
  { id: "s2", title: "TCS", subtitle: "Tata Consultancy Services • IT Services", category: "Stocks", href: "/stocks/TCS", badge: "₹2,502.60" },
  { id: "s3", title: "HDFCBANK", subtitle: "HDFC Bank Ltd • Banking & Finance", category: "Stocks", href: "/stocks/HDFCBANK", badge: "₹692.80" },
  { id: "s4", title: "INFY", subtitle: "Infosys Ltd • IT Consulting", category: "Stocks", href: "/stocks/INFY", badge: "₹1,185.00" },
  { id: "s5", title: "ICICIBANK", subtitle: "ICICI Bank Ltd • Private Banking", category: "Stocks", href: "/stocks/ICICIBANK", badge: "₹1,398.00" },
  { id: "s6", title: "TITAN", subtitle: "Titan Company Ltd • Consumer Goods", category: "Stocks", href: "/stocks/TITAN", badge: "₹3,420.00" },
  
  // Markets
  { id: "m1", title: "NIFTY 50", subtitle: "Benchmark Index of NSE • 50 Stocks", category: "Markets", href: "/markets", badge: "23,053.10" },
  { id: "m2", title: "SENSEX", subtitle: "BSE Benchmark Index • 30 Stocks", category: "Markets", href: "/markets", badge: "74,459.53" },
  { id: "m3", title: "BANK NIFTY", subtitle: "Banking Sector Index", category: "Markets", href: "/markets", badge: "54,686.95" },
  { id: "m4", title: "NIFTY IT", subtitle: "Information Technology Index", category: "Markets", href: "/markets", badge: "32,606.90" },
  
  // Portfolio & Goals
  { id: "p1", title: "Your Portfolio", subtitle: "Holdings, Allocation & Performance Analysis", category: "Portfolio", href: "/portfolio" },
  { id: "p2", title: "Diversification Analysis", subtitle: "Sector & Asset Allocation Review", category: "Portfolio", href: "/portfolio" },
  { id: "g1", title: "Financial Goals", subtitle: "Retirement, Emergency Fund, Home, Travel", category: "Goals", href: "/goals" },
  { id: "g2", title: "Emergency Fund Calculator", subtitle: "6-Month Reserve Target Tracker", category: "Goals", href: "/goals" },
  { id: "r1", title: "Risk Profile Assessment", subtitle: "Evaluate your investment horizon & risk score", category: "Navigation", href: "/risk-profile" },
  { id: "a1", title: "Alerts Center", subtitle: "Market, Portfolio & Price Level Alerts", category: "Navigation", href: "/alerts" },
  { id: "d1", title: "Stock Discovery", subtitle: "Natural Language Screener & Valuation Filters", category: "Navigation", href: "/discover" },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [items, setItems] = useState<SearchResultItem[]>(BASE_SEARCH_DATABASE);
  const [liveSearchResults, setLiveSearchResults] = useState<SearchResultItem[]>([]);

  // Update default badges with live prices from /api/market/overview
  useEffect(() => {
    let isMounted = true;
    async function updateLiveBadges() {
      try {
        const res = await fetch("/api/market/overview");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success) {
          const indexMap = new Map<string, string>();
          (data.indices || []).forEach((idx: any) => {
            indexMap.set(idx.symbol.toUpperCase(), idx.price);
          });

          const stockMap = new Map<string, { price: string; percent: string; positive: boolean }>();
          const allStocks = [...(data.gainers || []), ...(data.losers || []), ...(data.mostActive || [])];
          allStocks.forEach((s: any) => {
            stockMap.set(s.ticker.toUpperCase(), { price: s.price, percent: s.percent, positive: s.positive });
          });

          setItems((prev) =>
            prev.map((item) => {
              const uTitle = item.title.toUpperCase();
              if (indexMap.has(uTitle)) {
                return { ...item, badge: indexMap.get(uTitle) };
              }
              if (stockMap.has(uTitle)) {
                const s = stockMap.get(uTitle)!;
                return { ...item, badge: s.price, change: s.percent, positive: s.positive };
              }
              return item;
            })
          );
        }
      } catch {
        // Fallback to static values
      }
    }
    updateLiveBadges();
  }, []);

  // Live search debounced
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setLiveSearchResults([]);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.results)) {
          const liveItems: SearchResultItem[] = data.results.map((r: any) => ({
            id: `live-${r.ticker}`,
            title: r.ticker,
            subtitle: `${r.name} • Live Market Quote`,
            category: "Stocks" as const,
            href: `/stocks/${r.ticker}`,
            badge: r.price,
            change: r.percent,
            positive: r.positive,
          }));
          setLiveSearchResults(liveItems);
        }
      } catch {
        // Search error fallback
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const localFiltered = query.trim()
    ? items.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : items.slice(0, 8);

  // Combine live search results with local results, avoiding duplicates
  const existingTickers = new Set(localFiltered.map((i) => i.title.toUpperCase()));
  const uniqueLive = liveSearchResults.filter((l) => !existingTickers.has(l.title.toUpperCase()));
  const filteredResults = [...uniqueLive, ...localFiltered];

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-[#000000]/80" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded border shadow-2xl overflow-hidden bg-[#151312] border-[#2E2925] text-[#FAF7F2] dark:bg-[#151312] dark:border-[#2E2925] dark:text-[#FAF7F2] light:bg-[#FFFFFF] light:border-[#DDD5C9] light:text-[#171514]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8] gap-3">
          <svg
            className="w-4 h-4 text-[#A9A39B] shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search live stocks, indices, holdings, goals, or tools..."
            className="w-full bg-transparent text-sm font-mono outline-none placeholder-[#6F6A64] text-inherit"
          />

          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#1B1918] border border-[#2E2925] text-[#A9A39B] dark:bg-[#1B1918] dark:border-[#2E2925] dark:text-[#A9A39B] light:bg-[#F4F1EC] light:border-[#DDD5C9] light:text-[#6F6A64]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#24201D]/40 dark:divide-[#24201D]/40 light:divide-[#E8E2D8]/60">
          {filteredResults.length === 0 ? (
            <div className="p-4 text-center text-xs font-mono text-[#A9A39B]">
              No results found for &quot;{query}&quot;.
            </div>
          ) : (
            filteredResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.href)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-2.5 rounded transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#211F1D] text-[#FAF7F2] dark:bg-[#211F1D] dark:text-[#FAF7F2] light:bg-[#ECE8E1] light:text-[#171514]"
                      : "text-inherit hover:bg-[#1A1817] dark:hover:bg-[#1A1817] light:hover:bg-[#F4F1EC]"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono">
                        {item.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono border border-current opacity-60">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A9A39B] line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>

                  {item.badge && (
                    <div className="text-right font-mono">
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-[#181615] border border-[#2E2925] text-[#FAF7F2] dark:bg-[#181615] dark:border-[#2E2925] dark:text-[#FAF7F2] light:bg-[#FAF7F2] light:border-[#DDD5C9] light:text-[#171514]">
                        {item.badge}
                      </span>
                      {item.change && (
                        <div
                          className={`text-[10px] mt-0.5 font-semibold ${
                            item.positive ? "text-[#4E9F76]" : "text-[#D9534F]"
                          }`}
                        >
                          {item.change}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-2.5 border-t border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8] flex items-center justify-between text-[10px] font-mono text-[#6F6A64]">
          <div className="flex items-center gap-3">
            <span>&uarr;&darr; Navigate</span>
            <span>&crarr; Open</span>
          </div>
          <span className="text-[#4E9F76] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4E9F76] animate-pulse" />
            LIVE MARKET SEARCH
          </span>
        </div>
      </div>
    </div>
  );
}

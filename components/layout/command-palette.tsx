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
}

const SEARCH_DATABASE: SearchResultItem[] = [
  // Stocks
  { id: "s1", title: "RELIANCE", subtitle: "Reliance Industries Ltd • Energy & Telecom", category: "Stocks", href: "/stocks/RELIANCE", badge: "₹2,940.50" },
  { id: "s2", title: "TCS", subtitle: "Tata Consultancy Services • IT Services", category: "Stocks", href: "/stocks/TCS", badge: "₹4,120.10" },
  { id: "s3", title: "HDFCBANK", subtitle: "HDFC Bank Ltd • Banking & Finance", category: "Stocks", href: "/stocks/HDFCBANK", badge: "₹1,645.80" },
  { id: "s4", title: "INFY", subtitle: "Infosys Ltd • IT Consulting", category: "Stocks", href: "/stocks/INFY", badge: "₹1,780.25" },
  { id: "s5", title: "ICICIBANK", subtitle: "ICICI Bank Ltd • Private Banking", category: "Stocks", href: "/stocks/ICICIBANK", badge: "₹1,180.00" },
  { id: "s6", title: "TITAN", subtitle: "Titan Company Ltd • Consumer Goods", category: "Stocks", href: "/stocks/TITAN", badge: "₹3,420.00" },
  
  // Markets
  { id: "m1", title: "NIFTY 50", subtitle: "Benchmark Index of NSE • 50 Stocks", category: "Markets", href: "/markets", badge: "24,850.20" },
  { id: "m2", title: "SENSEX", subtitle: "BSE Benchmark Index • 30 Stocks", category: "Markets", href: "/markets", badge: "81,620.40" },
  { id: "m3", title: "BANK NIFTY", subtitle: "Banking Sector Index", category: "Markets", href: "/markets", badge: "51,280.15" },
  { id: "m4", title: "NIFTY IT", subtitle: "Information Technology Index", category: "Markets", href: "/markets", badge: "41,920.80" },
  
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

  const filteredResults = query.trim()
    ? SEARCH_DATABASE.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_DATABASE.slice(0, 8);

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
            placeholder="Search stocks, indices, holdings, goals, or tools..."
            className="w-full bg-transparent text-sm font-mono outline-none placeholder-[#6F6A64] text-inherit"
          />

          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#1B1918] border border-[#2E2925] text-[#A9A39B] dark:bg-[#1B1918] dark:border-[#2E2925] dark:text-[#A9A39B] light:bg-[#F4F1EC] light:border-[#DDD5C9] light:text-[#6F6A64]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#24201D]/40 dark:divide-[#24201D]/40 light:divide-[#E8E2D8]/60">
          {filteredResults.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-[#A9A39B]">
              No financial instruments or commands matching &quot;{query}&quot;
            </div>
          ) : (
            filteredResults.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.href)}
                className={`p-2.5 rounded flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  selectedIndex === idx
                    ? "bg-[#211F1D] dark:bg-[#211F1D] light:bg-[#ECE8E1]"
                    : "hover:bg-[#1B1918] dark:hover:bg-[#1B1918] light:hover:bg-[#F4F1EC]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#2E2925] text-[#A9A39B] bg-[#181615] dark:border-[#2E2925] dark:text-[#A9A39B] dark:bg-[#181615] light:border-[#DDD5C9] light:text-[#6F6A64] light:bg-[#FFFFFF]">
                    {item.category}
                  </span>
                  <div>
                    <div className="text-xs font-bold font-mono text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className="text-xs font-mono font-semibold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                    {item.badge}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8] flex items-center justify-between text-[11px] font-mono text-[#6F6A64] dark:text-[#6F6A64] light:text-[#9E978F]">
          <span>Navigation: ↑ ↓ Enter to select</span>
          <span>Global Search Command</span>
        </div>
      </div>
    </div>
  );
}

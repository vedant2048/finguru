"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { CommandPalette } from "./command-palette";

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_LINKS = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Markets", href: "/markets" },
  { name: "Discover", href: "/discover" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Goals", href: "/goals" },
  { name: "Alerts", href: "/alerts" },
];

const MARKET_TICKERS = [
  { symbol: "NIFTY 50", value: "24,850.20", change: "+0.42%", positive: true },
  { symbol: "SENSEX", value: "81,620.40", change: "+0.38%", positive: true },
  { symbol: "BANK NIFTY", value: "51,280.15", change: "-0.15%", positive: false },
  { symbol: "NIFTY IT", value: "41,920.80", change: "+1.20%", positive: true },
  { symbol: "USD/INR", value: "83.88", change: "-0.02%", positive: true },
  { symbol: "GOLD 24K", value: "₹74,200", change: "+0.10%", positive: true },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${isDark ? "bg-[#0F0D0C] text-[#FAF7F2]" : "bg-[#FAF7F2] text-[#171514]"}`}>
      {/* Global Command Palette */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Top Application Header */}
      <header className={`w-full border-b sticky top-0 z-40 transition-colors ${isDark ? "bg-[#0F0D0C] border-[#24201D]" : "bg-[#FAF7F2] border-[#E8E2D8]"}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand Logo & Desktop Nav Links */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 group focus:outline-none">
              <div
                className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold border transition-colors ${
                  isDark
                    ? "bg-[#181513] border-[#2E2925] text-[#FAF7F2] group-hover:border-[#3A7BD5]"
                    : "bg-[#FFFFFF] border-[#DDD5C9] text-[#171514] group-hover:border-[#2E68B8]"
                }`}
              >
                W
              </div>
              <span className="font-mono text-xs font-bold tracking-wider uppercase text-inherit">
                WEALTHZY
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-1.5 rounded text-xs font-medium font-mono transition-colors ${
                      isActive
                        ? isDark
                          ? "bg-[#1E1C1A] text-[#FAF7F2] border border-[#2E2925]"
                          : "bg-[#ECE8E1] text-[#171514] border border-[#DDD5C9]"
                        : isDark
                        ? "text-[#A9A39B] hover:text-[#FAF7F2] hover:bg-[#151312]"
                        : "text-[#6F6A64] hover:text-[#171514] hover:bg-[#F4F1EC]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls: Search, Notifications, Theme, Profile */}
          <div className="flex items-center gap-2.5">
            {/* Search Button (Ctrl+K) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              type="button"
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded border text-xs font-mono transition-colors cursor-pointer ${
                isDark
                  ? "bg-[#151312] border-[#24201D] text-[#A9A39B] hover:text-[#FAF7F2] hover:border-[#2E2925]"
                  : "bg-[#FFFFFF] border-[#DDD5C9] text-[#6F6A64] hover:text-[#171514] hover:border-[#C8BFB2]"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden lg:inline-block px-1 py-0.2 text-[9px] font-mono rounded bg-inherit border border-current opacity-70">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Toggle */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                type="button"
                aria-label="View notifications"
                className={`w-8 h-8 rounded border flex items-center justify-center transition-colors cursor-pointer relative ${
                  isDark
                    ? "bg-[#151312] border-[#24201D] text-[#A9A39B] hover:text-[#FAF7F2]"
                    : "bg-[#FFFFFF] border-[#DDD5C9] text-[#6F6A64] hover:text-[#171514]"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Active Indicator Dot */}
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#3A7BD5]" />
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded border shadow-xl p-3 z-50 text-xs font-mono space-y-2.5 ${
                    isDark
                      ? "bg-[#151312] border-[#2E2925] text-[#FAF7F2]"
                      : "bg-[#FFFFFF] border-[#DDD5C9] text-[#171514]"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-inherit">
                    <span className="font-bold uppercase tracking-wider text-[11px]">FINANCIAL ALERTS</span>
                    <Link
                      href="/alerts"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-[#3A7BD5] hover:underline text-[10px]"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <div className="p-2 rounded bg-black/15 border border-inherit space-y-1">
                      <div className="flex justify-between text-[10px] text-[#A9A39B]">
                        <span>MARKET DISCOVERY</span>
                        <span>10m ago</span>
                      </div>
                      <p className="text-[11px] leading-tight">NIFTY 50 moved +0.42% in early morning session.</p>
                    </div>

                    <div className="p-2 rounded bg-black/15 border border-inherit space-y-1">
                      <div className="flex justify-between text-[10px] text-[#A9A39B]">
                        <span>PORTFOLIO</span>
                        <span>2h ago</span>
                      </div>
                      <p className="text-[11px] leading-tight">IT Sector concentration reached 32% of total holdings.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              type="button"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className={`w-8 h-8 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                isDark
                  ? "bg-[#151312] border-[#24201D] text-[#A9A39B] hover:text-[#FAF7F2]"
                  : "bg-[#FFFFFF] border-[#DDD5C9] text-[#6F6A64] hover:text-[#171514]"
              }`}
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Profile & Settings Avatar */}
            <Link
              href="/profile"
              className={`w-8 h-8 rounded border flex items-center justify-center font-mono text-xs font-semibold transition-colors ${
                isDark
                  ? "bg-[#1B1918] border-[#2E2925] text-[#FAF7F2] hover:border-[#3A7BD5]"
                  : "bg-[#FFFFFF] border-[#DDD5C9] text-[#171514] hover:border-[#2E68B8]"
              }`}
            >
              VP
            </Link>
          </div>
        </div>

        {/* Bloomberg Ticker Ribbon */}
        <div
          className={`w-full overflow-x-auto no-scrollbar py-1 px-4 sm:px-6 border-t text-[11px] font-mono flex items-center gap-6 whitespace-nowrap ${
            isDark
              ? "bg-[#12100F] border-[#24201D] text-[#A9A39B]"
              : "bg-[#F4F1EC] border-[#E8E2D8] text-[#6F6A64]"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6A64] dark:text-[#6F6A64] light:text-[#9E978F]">
            LIVE FEED:
          </span>
          {MARKET_TICKERS.map((t) => (
            <div key={t.symbol} className="flex items-center gap-2">
              <span className="font-semibold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                {t.symbol}
              </span>
              <span>{t.value}</span>
              <span className={t.positive ? "text-[#4E9F76] dark:text-[#4E9F76] light:text-[#2E8555]" : "text-[#D9534F] dark:text-[#D9534F] light:text-[#C0392B]"}>
                {t.change}
              </span>
            </div>
          ))}
        </div>
      </header>

      {/* Main Page Body Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-center justify-around h-14 px-2 transition-colors ${
          isDark ? "bg-[#0F0D0C] border-[#24201D]" : "bg-[#FAF7F2] border-[#E8E2D8]"
        }`}
      >
        {NAV_LINKS.slice(0, 5).map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 font-mono text-[10px] uppercase transition-colors ${
                isActive
                  ? isDark
                    ? "text-[#FAF7F2] font-bold"
                    : "text-[#171514] font-bold"
                  : isDark
                  ? "text-[#6F6A64]"
                  : "text-[#9E978F]"
              }`}
            >
              <span>{link.name}</span>
            </Link>
          );
        })}
        <Link
          href="/settings"
          className={`flex flex-col items-center justify-center flex-1 py-1 font-mono text-[10px] uppercase ${
            pathname === "/settings" ? (isDark ? "text-[#FAF7F2] font-bold" : "text-[#171514] font-bold") : (isDark ? "text-[#6F6A64]" : "text-[#9E978F]")
          }`}
        >
          <span>More</span>
        </Link>
      </nav>

      {/* Desktop Footer */}
      <footer
        className={`hidden md:block w-full border-t py-4 text-center text-xs font-mono transition-colors ${
          isDark
            ? "border-[#24201D] text-[#6F6A64] bg-[#0F0D0C]"
            : "border-[#E8E2D8] text-[#9E978F] bg-[#FAF7F2]"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
          <span>WEALTHZY INTELLIGENCE &bull; INSTITUTIONAL RESEARCH WORKSPACE</span>
          <div className="flex items-center gap-4">
            <Link href="/settings" className="hover:underline">Settings</Link>
            <Link href="/profile" className="hover:underline">Profile</Link>
            <Link href="/alerts" className="hover:underline">Alerts</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

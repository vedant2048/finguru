"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { FinancialLineChart, AssetDonutChart } from "@/components/ui/financial-charts";

const SAMPLE_HERO_CHART_DATA = {
  "1M": [
    { date: "01 Sep", value: 1240000 },
    { date: "07 Sep", value: 1255000 },
    { date: "14 Sep", value: 1238000 },
    { date: "21 Sep", value: 1282000 },
    { date: "28 Sep", value: 1312500 },
  ],
};

const SAMPLE_HERO_ASSETS = [
  { label: "Equity", value: 853125, percentage: 65, color: "#3A7BD5" },
  { label: "Debt & Bonds", value: 262500, percentage: 20, color: "#4E9F76" },
  { label: "Gold", value: 131250, percentage: 10, color: "#D9822B" },
  { label: "Cash Reserves", value: 65625, percentage: 5, color: "#8E8880" },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [activeFeatureTab, setActiveFeatureTab] = useState<number>(0);

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-150 select-none ${isDark ? "bg-[#0F0D0C] text-[#FAF7F2]" : "bg-[#FAF7F2] text-[#171514]"}`}>
      {/* Top Navbar */}
      <header className={`w-full border-b sticky top-0 z-40 transition-colors ${isDark ? "bg-[#0F0D0C] border-[#24201D]" : "bg-[#FAF7F2] border-[#E8E2D8]"}`}>
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className={`w-7 h-7 rounded flex items-center justify-center font-mono text-xs font-bold border transition-colors ${isDark ? "bg-[#181513] border-[#2E2925] text-[#FAF7F2]" : "bg-[#FFFFFF] border-[#DDD5C9] text-[#171514]"}`}>
              W
            </div>
            <span className="font-mono text-sm font-bold tracking-wider uppercase">
              WEALTHZY
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              type="button"
              aria-label="Toggle theme"
              className={`w-8 h-8 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                isDark ? "bg-[#151312] border-[#24201D] text-[#A9A39B] hover:text-[#FAF7F2]" : "bg-[#FFFFFF] border-[#DDD5C9] text-[#6F6A64] hover:text-[#171514]"
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

            <Link
              href="/login"
              className={`hidden sm:inline-block px-3.5 py-1.5 text-xs font-mono font-medium rounded border transition-colors ${
                isDark ? "border-[#2E2925] text-[#A9A39B] hover:text-[#FAF7F2]" : "border-[#DDD5C9] text-[#6F6A64] hover:text-[#171514]"
              }`}
            >
              Log In
            </Link>

            <Link
              href="/register"
              className={`px-4 py-1.5 text-xs font-mono font-semibold rounded transition-colors ${
                isDark ? "bg-[#FAF7F2] text-[#0F0D0C] hover:bg-[#E6E1D8]" : "bg-[#171514] text-[#FAF7F2] hover:bg-[#2A2420]"
              }`}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="py-16 md:py-24 px-6 max-w-[1280px] mx-auto w-full">
        <div className="max-w-3xl mx-auto text-center space-y-6 mb-12">
          <Badge variant="info">INSTITUTIONAL WEALTH INTELLIGENCE</Badge>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            Understand your money.
            <br />
            <span className={isDark ? "text-[#A9A39B]" : "text-[#6F6A64]"}>Invest with clarity.</span>
          </h1>
          <p className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${isDark ? "text-[#A9A39B]" : "text-[#6F6A64]"}`}>
            Wealthzy brings your goals, portfolio, market data and investment insights together in one intelligent financial workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className={`w-full sm:w-auto px-7 py-3 rounded text-sm font-semibold tracking-wide transition-colors ${
                isDark ? "bg-[#FAF7F2] text-[#0F0D0C] hover:bg-[#E6E1D8]" : "bg-[#171514] text-[#FAF7F2] hover:bg-[#2A2420]"
              }`}
            >
              Get Started
            </Link>
            <Link
              href="/dashboard"
              className={`w-full sm:w-auto px-7 py-3 rounded text-sm font-semibold border transition-colors ${
                isDark ? "border-[#2E2925] text-[#FAF7F2] hover:bg-[#181513]" : "border-[#DDD5C9] text-[#171514] hover:bg-[#F4F1EC]"
              }`}
            >
              Explore Wealthzy
            </Link>
          </div>
        </div>

        {/* HERO VISUAL: SOPHISTICATED FINANCIAL DASHBOARD PREVIEW */}
        <div className={`rounded border shadow-2xl p-4 sm:p-6 md:p-8 ${isDark ? "bg-[#151312] border-[#2E2925]" : "bg-[#FFFFFF] border-[#DDD5C9]"}`}>
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-inherit">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4E9F76]" />
              <span className="font-mono text-xs uppercase tracking-wider font-bold">
                WEALTHZY WORKSPACE LIVE SIMULATION
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#A9A39B]">PORTFOLIO: ACTIVE &bull; RISK: MODERATE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard label="Total Portfolio Value" value="₹13,12,500" change="₹72,500" changePercent="5.85%" isPositive={true} secondaryText="Target: ₹25,00,000 (52.5%)" />
            <MetricCard label="Today's Change" value="+₹8,420" changePercent="+0.65%" isPositive={true} secondaryText="NIFTY Benchmark: +0.42%" />
            <MetricCard label="Invested Amount" value="₹11,40,000" secondaryText="Realized Gains: +₹1,72,500" />
            <MetricCard label="Overall Risk" value="Moderate" badgeText="SCORE: 58/100" badgeVariant="warning" secondaryText="Diversification: 82/100 (Optimal)" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className={`lg:col-span-7 p-5 rounded border ${isDark ? "bg-[#181615] border-[#24201D]" : "bg-[#FAF7F2] border-[#E8E2D8]"}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#A9A39B]">Performance Trajectory</span>
                <Badge variant="positive">+5.85% (1M)</Badge>
              </div>
              <FinancialLineChart data={SAMPLE_HERO_CHART_DATA} initialTimeframe="1M" height={200} showTimeframeSelector={false} />
            </div>

            <div className={`lg:col-span-5 p-5 rounded border ${isDark ? "bg-[#181615] border-[#24201D]" : "bg-[#FAF7F2] border-[#E8E2D8]"}`}>
              <span className="text-xs font-mono uppercase tracking-wider text-[#A9A39B] block mb-4">Asset Diversification</span>
              <AssetDonutChart slices={SAMPLE_HERO_ASSETS} totalValue="100%" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: HOW WEALTHZY WORKS */}
      <section className={`py-16 md:py-24 px-6 border-t ${isDark ? "border-[#24201D] bg-[#12100F]" : "border-[#E8E2D8] bg-[#F4F1EC]"}`}>
        <div className="max-w-[1280px] mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="neutral">METHODOLOGY</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">How Wealthzy Works</h2>
            <p className={`text-sm md:text-base ${isDark ? "text-[#A9A39B]" : "text-[#6F6A64]"}`}>
              A structured intelligence pipeline that turns scattered financial information into actionable portfolio clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Build your profile", desc: "Connect or log your holdings, emergency funds, and investment horizon in a structured profile." },
              { num: "02", title: "Understand your risk", desc: "Evaluate your actual risk capacity and behavioral tolerance against market drawdowns." },
              { num: "03", title: "Analyze your investments", desc: "Scrutinize valuation, fundamentals, sector concentration, and sentiment with institutional depth." },
              { num: "04", title: "Make informed decisions", desc: "Act on factual signals and risk indicators without noise, emotion, or speculative hype." },
            ].map((step) => (
              <div
                key={step.num}
                className={`p-6 rounded border transition-colors ${isDark ? "bg-[#151312] border-[#24201D]" : "bg-[#FFFFFF] border-[#E8E2D8]"}`}
              >
                <div className="text-2xl font-mono font-bold text-[#3A7BD5] mb-4">
                  {step.num}
                </div>
                <h3 className="text-base font-bold mb-2">{step.title}</h3>
                <p className={`text-xs leading-relaxed ${isDark ? "text-[#A9A39B]" : "text-[#6F6A64]"}`}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: NOT JUST A STOCK PICKER */}
      <section className="py-16 md:py-24 px-6 max-w-[1280px] mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="neutral">DIFFERENTIATION</Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Not Just a Stock Picker</h2>
          <p className={`text-sm md:text-base ${isDark ? "text-[#A9A39B]" : "text-[#6F6A64]"}`}>
            Wealthzy looks at the complete financial ecosystem rather than pushing speculative stock tips.
          </p>
        </div>

        <div className={`rounded border overflow-hidden ${isDark ? "bg-[#151312] border-[#24201D]" : "bg-[#FFFFFF] border-[#E8E2D8]"}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className={`border-b ${isDark ? "border-[#24201D] bg-[#181513]" : "border-[#E8E2D8] bg-[#F4F1EC]"}`}>
                  <th className="py-3.5 px-5 font-bold uppercase tracking-wider">Dimension</th>
                  <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[#A9A39B]">Traditional Stock Picking Apps</th>
                  <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[#3A7BD5]">Wealthzy Financial Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24201D]/40 dark:divide-[#24201D]/40 light:divide-[#E8E2D8]">
                {[
                  { dim: "Market Data", trad: "Delayed, ticker-only quotes", wzy: "Live consolidated indices & contextual volume" },
                  { dim: "Fundamental Analysis", trad: "Basic summary ratios with no context", wzy: "10-year trends with industry baseline comparisons" },
                  { dim: "Valuation Insights", trad: "Static P/E with no benchmark", wzy: "P/E, P/B, EV/EBITDA vs peer group & historical ranges" },
                  { dim: "News Sentiment", trad: "Clickbait headline feed", wzy: "FinBERT structured sentiment signals & impact ratings" },
                  { dim: "Portfolio Context", trad: "Isolated individual stock view", wzy: "Real-time impact on risk, liquidity, and asset allocation" },
                  { dim: "Risk & Goals", trad: "Not considered", wzy: "Explicitly mapped to your time horizon and financial goals" },
                ].map((row, idx) => (
                  <tr key={idx} className={isDark ? "hover:bg-[#181615]" : "hover:bg-[#FAF7F2]"}>
                    <td className="py-3.5 px-5 font-semibold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{row.dim}</td>
                    <td className="py-3.5 px-5 text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">{row.trad}</td>
                    <td className="py-3.5 px-5 text-[#4E9F76] dark:text-[#4E9F76] light:text-[#2E8555] font-semibold flex items-center gap-2">
                      <span>&bull;</span>
                      <span>{row.wzy}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION: FEATURES PREVIEW */}
      <section className={`py-16 md:py-24 px-6 border-t ${isDark ? "border-[#24201D] bg-[#12100F]" : "border-[#E8E2D8] bg-[#F4F1EC]"}`}>
        <div className="max-w-[1280px] mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="neutral">CAPABILITIES</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Financial Intelligence Suite</h2>
            <p className={`text-sm md:text-base ${isDark ? "text-[#A9A39B]" : "text-[#6F6A64]"}`}>
              Comprehensive modules engineered for disciplined analysis and long-term capital compounding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Portfolio Intelligence", desc: "Automated analysis of sector concentration, risk score, asset allocation, and liquidity depth." },
              { title: "Stock Discovery", desc: "Natural language screener combined with 10+ institutional fundamental and valuation filters." },
              { title: "Risk Profiling", desc: "Interactive behavioral risk assessment mapped to time horizons and drawdown capacity." },
              { title: "Goal Planning", desc: "Retirement, home acquisition, and dedicated 6-month emergency reserve calculators." },
              { title: "Market Intelligence", desc: "Consolidated index overview, top gainers, active volume drivers, and 52-week extremes." },
              { title: "Financial Alerts", desc: "Real-time thresholds for portfolio drift, significant price variations, and news sentiment shifts." },
            ].map((feat, idx) => (
              <div
                key={idx}
                className={`p-6 rounded border space-y-3 ${isDark ? "bg-[#151312] border-[#24201D]" : "bg-[#FFFFFF] border-[#E8E2D8]"}`}
              >
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#3A7BD5]">
                  MODULE {idx + 1}
                </div>
                <h3 className="text-lg font-bold">{feat.title}</h3>
                <p className={`text-xs leading-relaxed ${isDark ? "text-[#A9A39B]" : "text-[#6F6A64]"}`}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 max-w-[1280px] mx-auto w-full text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Build a clearer view of your wealth.
        </h2>
        <p className={`text-sm sm:text-base max-w-xl mx-auto ${isDark ? "text-[#A9A39B]" : "text-[#6F6A64]"}`}>
          Join investors who use Wealthzy for data-driven, objective financial intelligence.
        </p>
        <div className="pt-2">
          <Link
            href="/register"
            className={`inline-block px-8 py-3.5 rounded text-sm font-semibold tracking-wide transition-colors ${
              isDark ? "bg-[#FAF7F2] text-[#0F0D0C] hover:bg-[#E6E1D8]" : "bg-[#171514] text-[#FAF7F2] hover:bg-[#2A2420]"
            }`}
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`w-full border-t py-8 px-6 text-xs font-mono transition-colors ${isDark ? "bg-[#0F0D0C] border-[#24201D] text-[#6F6A64]" : "bg-[#FAF7F2] border-[#E8E2D8] text-[#9E978F]"}`}>
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">WEALTHZY</span>
            <span>&bull;</span>
            <span>Understand your money. Invest with clarity.</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Wealthzy Financial Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
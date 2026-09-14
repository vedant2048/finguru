"use client";

import React, { useState } from "react";

interface HeroProps {
  onOpenDemo?: () => void;
  onGetStarted?: () => void;
}

export default function Hero({ onOpenDemo, onGetStarted }: HeroProps) {
  const [activeAsset, setActiveAsset] = useState<string | null>(null);

  // Asset allocation breakdown with the 4-color swatch palette
  const assets = [
    { name: "Mutual Funds", percent: 45, color: "#F88D50", amount: "₹3,79,193" },
    { name: "Stocks", percent: 30, color: "#8EC8FC", amount: "₹2,52,795" },
    { name: "Gold", percent: 15, color: "#FED5A2", amount: "₹1,26,398" },
    { name: "Other", percent: 10, color: "#8C8176", amount: "₹84,265" },
  ];

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[var(--bg-primary)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Narrative */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs font-semibold tracking-wider text-[var(--accent-primary)] uppercase mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]" />
              YOUR WEALTH. A CLEARER TOMORROW.
            </div>

            {/* Main Heading (Solid Color, Swatch-Infused) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.1] mb-6">
              Invest Smarter. <br />
              <span className="text-[var(--accent-primary)]">Live Brighter.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl mb-8">
              Wealthzy helps you understand, track, and grow your investments — all in one place. Personalized insights. Smarter decisions. A wealthier you.
            </p>

            {/* Buttons (Solid Colors Only) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
              <button
                onClick={onGetStarted}
                className="btn-primary px-7 py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Get Started</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <button
                onClick={onOpenDemo}
                className="btn-secondary px-6 py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--accent-primary)]">
                  <svg className="w-3 h-3 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Social Proof with Solid Avatar Badges */}
            <div className="flex items-center gap-3.5 pt-4 border-t border-[var(--border-glass)] w-full max-w-md">
              <div className="flex -space-x-2.5 overflow-hidden">
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--bg-primary)] bg-[#F88D50] flex items-center justify-center text-[10px] font-bold text-white">AM</div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--bg-primary)] bg-[#8EC8FC] flex items-center justify-center text-[10px] font-bold text-[#12100E]">RS</div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--bg-primary)] bg-[#FED5A2] flex items-center justify-center text-[10px] font-bold text-[#12100E]">KP</div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--bg-primary)] bg-[#5AC58E] flex items-center justify-center text-[10px] font-bold text-[#12100E]">PD</div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                Trusted by <span className="text-[var(--text-primary)] font-semibold">50,000+</span> users building a better financial future.
              </p>
            </div>
          </div>

          {/* Right Hero Product Visual (Wealthzy Financial Dashboard) */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-[540px]">
              
              {/* Main Dashboard Card */}
              <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 sm:p-6 shadow-xl relative z-10 border border-[var(--border-glass)]">
                {/* Header bar */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-glass)]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#5AC58E]" />
                    <span className="text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">Live Portfolio Tracker</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[11px] font-medium text-[var(--text-secondary)]">
                    <span>INR (₹)</span>
                  </div>
                </div>

                {/* Portfolio Value & Returns */}
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <div className="text-xs text-[var(--text-muted)] font-medium mb-1">Total Portfolio Value</div>
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                      ₹8,42,651
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[#5AC58E] text-xs font-bold">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    <span>+12.4%</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-normal">all time</span>
                  </div>
                </div>

                {/* Minimal Solid Sky Blue Line Chart */}
                <div className="w-full h-24 mb-5 relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                    {/* Subtle Single-Color Transparent Fill */}
                    <path
                      d="M 0 85 Q 50 78, 100 65 T 200 45 T 300 30 T 400 12 L 400 100 L 0 100 Z"
                      fill="rgba(142, 200, 252, 0.08)"
                    />
                    {/* Solid Sky Blue Stroke */}
                    <path
                      d="M 0 85 Q 50 78, 100 65 T 200 45 T 300 30 T 400 12"
                      fill="none"
                      stroke="#8EC8FC"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Solid Data Point */}
                    <circle cx="400" cy="12" r="3.5" fill="#8EC8FC" stroke="#FFFFFF" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* Middle Grid: Asset Allocation Donut + Risk & Goal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[var(--border-glass)]">
                  
                  {/* Asset Allocation Donut (Swatch-Infused Solid Colors) */}
                  <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-semibold text-[var(--text-secondary)]">Asset Allocation</span>
                      <span className="text-[11px] text-[var(--text-muted)]">4 Assets</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Interactive SVG Donut */}
                      <div className="relative w-16 h-16 shrink-0">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                          {/* Mutual funds 45% (#F88D50 Coral) */}
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#F88D50" strokeWidth="4.5" strokeDasharray="45 100" strokeDashoffset="0" />
                          {/* Stocks 30% (#8EC8FC Sky Blue) */}
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#8EC8FC" strokeWidth="4.5" strokeDasharray="30 100" strokeDashoffset="-45" />
                          {/* Gold 15% (#FED5A2 Sand) */}
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#FED5A2" strokeWidth="4.5" strokeDasharray="15 100" strokeDashoffset="-75" />
                          {/* Other 10% (#8C8176 Muted) */}
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#8C8176" strokeWidth="4.5" strokeDasharray="10 100" strokeDashoffset="-90" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)]">
                          100%
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="space-y-1 text-[11px] w-full">
                        {assets.map((a) => (
                          <div
                            key={a.name}
                            onMouseEnter={() => setActiveAsset(a.name)}
                            onMouseLeave={() => setActiveAsset(null)}
                            className={`flex items-center justify-between cursor-pointer rounded px-1 transition-colors ${
                              activeAsset === a.name ? "bg-[var(--bg-glass-hover)]" : ""
                            }`}
                          >
                            <span className="flex items-center gap-1.5 text-[var(--text-secondary)] truncate">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                              {a.name}
                            </span>
                            <span className="font-semibold text-[var(--text-primary)]">{a.percent}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Financial Goal & Risk */}
                  <div className="flex flex-col justify-between gap-3">
                    {/* Goal Progress (Solid Coral) */}
                    <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-[var(--text-secondary)]">Financial Freedom</span>
                        <span className="font-bold text-[var(--accent-primary)]">65%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--bg-surface-elevated)] overflow-hidden">
                        <div className="h-full bg-[var(--accent-primary)] rounded-full" style={{ width: "65%" }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
                        <span>Target: ₹1.2 Cr</span>
                        <span className="text-[#5AC58E]">On Track</span>
                      </div>
                    </div>

                    {/* Risk Profile */}
                    <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Risk Profile</div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">Moderate Balanced</div>
                      </div>
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-[var(--bg-surface-elevated)] text-[#8EC8FC] border border-[var(--border-glass)]">
                        Balanced
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Layered Floating Badge: Monthly Growth */}
              <div className="absolute -top-4 -right-4 sm:-right-6 glass-panel rounded-xl p-3 shadow-lg z-20 hidden sm:flex items-center gap-3 border border-[var(--border-glass)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-center text-[#5AC58E]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-muted)] font-medium">Monthly Growth</div>
                  <div className="text-sm font-bold text-[#5AC58E]">+12.4% <span className="text-[10px] text-[var(--text-muted)] font-normal">vs last mo</span></div>
                </div>
              </div>

              {/* Layered Floating Badge: Smart AI Insight */}
              <div className="absolute -bottom-5 -left-4 sm:-left-6 glass-panel rounded-xl p-3 shadow-lg z-20 hidden sm:flex items-center gap-3 border border-[var(--border-glass)] max-w-[240px]">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--accent-primary)] shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[var(--accent-primary)]">AI Portfolio Insight</div>
                  <div className="text-[11px] text-[var(--text-secondary)] leading-tight">SIP rebalancing optimal for next quarter.</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

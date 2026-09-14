"use client";

import React, { useState } from "react";

export default function MiniVisuals() {
  const [riskLevel, setRiskLevel] = useState<"low" | "moderate" | "high">("moderate");

  return (
    <section className="py-20 relative bg-[var(--bg-secondary)] border-t border-[var(--border-glass)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs font-semibold tracking-wider text-[var(--accent-primary)] uppercase mb-3">
            INTERFACE PREVIEW
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Intelligent components designed for clarity.
          </h2>
        </div>

        {/* 4 Floating Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Portfolio */}
          <div className="glass-card-interactive rounded-2xl p-6 flex flex-col justify-between bg-[var(--bg-card)] border border-[var(--border-glass)] shadow-md">
            <div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-2">
                <span>Portfolio</span>
                <span className="text-[#5AC58E] font-bold bg-[var(--bg-surface)] border border-[var(--border-glass)] px-2 py-0.5 rounded-full">+12.4%</span>
              </div>
              <div className="text-2xl font-black text-[var(--text-primary)] mb-4">
                ₹8,42,651
              </div>
            </div>

            {/* Solid Line Chart (Sky Blue Swatch) */}
            <div className="w-full h-16 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60">
                <path d="M 0 50 Q 50 45, 100 30 T 200 10 L 200 60 L 0 60 Z" fill="rgba(142, 200, 252, 0.08)" />
                <path d="M 0 50 Q 50 45, 100 30 T 200 10" fill="none" stroke="#8EC8FC" strokeWidth="2.5" />
              </svg>
            </div>
          </div>

          {/* Card 2: SIPs */}
          <div className="glass-card-interactive rounded-2xl p-6 flex flex-col justify-between bg-[var(--bg-card)] border border-[var(--border-glass)] shadow-md">
            <div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-2">
                <span>Monthly Inflow</span>
                <span className="text-[#8EC8FC] font-bold">4 Active</span>
              </div>
              <div className="text-2xl font-black text-[var(--text-primary)] mb-1">
                ₹25,000<span className="text-xs font-normal text-[var(--text-muted)]">/month</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-4">Next deduction: 5th Oct</p>
            </div>

            {/* Solid Progress indicator (Coral Swatch) */}
            <div>
              <div className="flex justify-between text-[11px] text-[var(--text-muted)] mb-1">
                <span>Annual Goal (₹3.0L)</span>
                <span className="text-[var(--text-primary)] font-semibold">₹2.25L (75%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg-surface-elevated)] overflow-hidden">
                <div className="h-full bg-[#F88D50] rounded-full" style={{ width: "75%" }} />
              </div>
            </div>
          </div>

          {/* Card 3: Financial Freedom (Solid Circular Progress) */}
          <div className="glass-card-interactive rounded-2xl p-6 flex flex-col justify-between bg-[var(--bg-card)] border border-[var(--border-glass)] shadow-md">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-1">
              <span>Financial Freedom</span>
              <span className="text-[var(--accent-primary)] font-bold">FIRE</span>
            </div>

            <div className="flex items-center justify-center my-2">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" className="text-[var(--border-glass)]" strokeWidth="3" />
                  {/* Active 65% stroke (Sky Blue Swatch) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#8EC8FC"
                    strokeWidth="3.5"
                    strokeDasharray="65 100"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-[var(--text-primary)]">65%</span>
                  <span className="text-[9px] text-[var(--text-muted)] uppercase">Funded</span>
                </div>
              </div>
            </div>

            <div className="text-center text-[11px] text-[var(--text-secondary)]">
              Estimated independence: <span className="text-[var(--text-primary)] font-semibold">2034</span>
            </div>
          </div>

          {/* Card 4: Risk Profile (Interactive Solid Selector) */}
          <div className="glass-card-interactive rounded-2xl p-6 flex flex-col justify-between bg-[var(--bg-card)] border border-[var(--border-glass)] shadow-md">
            <div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium mb-2">
                <span>Risk Profile</span>
                <span className="text-xs font-bold capitalize text-[var(--accent-primary)]">{riskLevel}</span>
              </div>
              <div className="text-lg font-bold text-[var(--text-primary)] mb-3">
                {riskLevel === "low" ? "Conservative" : riskLevel === "moderate" ? "Moderate Balanced" : "Aggressive Growth"}
              </div>
            </div>

            {/* Interactive Low - Moderate - High segmented pill (Solid Colors) */}
            <div>
              <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-semibold mb-1.5">
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
                <button
                  onClick={() => setRiskLevel("low")}
                  className={`py-1 text-center rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    riskLevel === "low" ? "bg-[#8EC8FC] text-[#12100E]" : "text-[var(--text-muted)]"
                  }`}
                >
                  Low
                </button>
                <button
                  onClick={() => setRiskLevel("moderate")}
                  className={`py-1 text-center rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    riskLevel === "moderate" ? "bg-[#F88D50] text-white" : "text-[var(--text-muted)]"
                  }`}
                >
                  Mod
                </button>
                <button
                  onClick={() => setRiskLevel("high")}
                  className={`py-1 text-center rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    riskLevel === "high" ? "bg-[#F06E6E] text-white" : "text-[var(--text-muted)]"
                  }`}
                >
                  High
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

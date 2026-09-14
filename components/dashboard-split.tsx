"use client";

import React, { useState } from "react";

interface DashboardSplitProps {
  onExplore?: () => void;
}

export default function DashboardSplit({ onExplore }: DashboardSplitProps) {
  const [activeTab, setActiveTab] = useState<"performance" | "sip" | "allocation">("performance");

  const checklist = [
    "Track performance in real time with auto-synced valuations",
    "Identify opportunities for growth & tax-saving rebalancing",
    "Stay aligned with your financial goals through automated milestones",
    "Understand your portfolio, not just the numbers",
  ];

  return (
    <section id="insights" className="py-24 relative bg-[var(--bg-primary)] border-t border-[var(--border-glass)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Large Interactive Dashboard Card */}
          <div className="lg:col-span-7">
            <div className="bg-[var(--bg-secondary)] rounded-3xl p-6 sm:p-8 border border-[var(--border-glass)] shadow-xl relative">
              
              {/* Interactive Dashboard Tabs */}
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-[var(--border-glass)] flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Wealthzy Intelligence</span>
                </div>

                {/* Tab Switcher Pills */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs">
                  <button
                    onClick={() => setActiveTab("performance")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                      activeTab === "performance"
                        ? "bg-[var(--accent-primary)] text-white shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Performance
                  </button>
                  <button
                    onClick={() => setActiveTab("sip")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                      activeTab === "sip"
                        ? "bg-[var(--accent-primary)] text-white shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    SIP Health
                  </button>
                  <button
                    onClick={() => setActiveTab("allocation")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                      activeTab === "allocation"
                        ? "bg-[var(--accent-primary)] text-white shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Risk Matrix
                  </button>
                </div>
              </div>

              {/* Tab Content 1: Performance */}
              {activeTab === "performance" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
                      <div className="text-[11px] text-[var(--text-muted)] uppercase font-semibold">Current Value</div>
                      <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1">₹8,42,651</div>
                      <div className="text-[11px] text-[#5AC58E] font-bold mt-0.5">▲ +₹92,400 Profit</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
                      <div className="text-[11px] text-[var(--text-muted)] uppercase font-semibold">1-Yr CAGR</div>
                      <div className="text-xl sm:text-2xl font-black text-[var(--accent-primary)] mt-1">16.8%</div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Benchmark: +13.2%</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] col-span-2 sm:col-span-1">
                      <div className="text-[11px] text-[var(--text-muted)] uppercase font-semibold">Health Score</div>
                      <div className="text-xl sm:text-2xl font-black text-[#8EC8FC] mt-1">94/100</div>
                      <div className="text-[11px] text-[#8EC8FC] font-semibold mt-0.5">Optimal Diversity</div>
                    </div>
                  </div>

                  {/* Multi-Period Area Chart (Solid Coral & Sky Blue) */}
                  <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
                    <div className="flex items-center justify-between text-xs mb-4">
                      <span className="font-bold text-[var(--text-secondary)]">Portfolio Growth vs NIFTY 50</span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1 text-[var(--accent-primary)] font-semibold">
                          <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" /> Wealthzy
                        </span>
                        <span className="flex items-center gap-1 text-[var(--text-muted)]">
                          <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" /> NIFTY 50
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-36 relative">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                        {/* Area: Solid subtle opacity */}
                        <path
                          d="M 0 100 Q 100 80, 200 60 T 350 35 T 500 10 L 500 120 L 0 120 Z"
                          fill="rgba(248, 141, 80, 0.08)"
                        />
                        {/* NIFTY baseline */}
                        <path
                          d="M 0 110 Q 120 95, 250 85 T 500 45"
                          fill="none"
                          stroke="var(--text-muted)"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                        {/* Portfolio Line: Solid Coral */}
                        <path
                          d="M 0 100 Q 100 80, 200 60 T 350 35 T 500 10"
                          fill="none"
                          stroke="#F88D50"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <circle cx="500" cy="10" r="3.5" fill="#8EC8FC" stroke="#FFFFFF" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 2: SIP */}
              {activeTab === "sip" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
                    <div>
                      <div className="text-xs text-[var(--text-muted)] font-medium">Monthly Investment Total</div>
                      <div className="text-2xl font-black text-[var(--text-primary)]">₹25,000 / mo</div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full bg-[var(--bg-surface-elevated)] text-[#5AC58E] text-xs font-bold border border-[var(--border-glass)]">
                        4 SIPs Active
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { name: "Parag Parikh Flexi Cap Fund", amt: "₹10,000", date: "5th of every month", cat: "Flexi Cap" },
                      { name: "Mirae Asset Large Cap Fund", amt: "₹7,500", date: "10th of every month", cat: "Large Cap" },
                      { name: "Nippon India Small Cap Fund", amt: "₹5,000", date: "15th of every month", cat: "Small Cap" },
                      { name: "SGB & Sovereign Gold SIP", amt: "₹2,500", date: "20th of every month", cat: "Gold" },
                    ].map((sip, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs">
                        <div>
                          <div className="font-bold text-[var(--text-primary)]">{sip.name}</div>
                          <div className="text-[11px] text-[var(--text-muted)]">{sip.date} • {sip.cat}</div>
                        </div>
                        <div className="font-extrabold text-[var(--accent-primary)]">{sip.amt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Content 3: Allocation Matrix */}
              {activeTab === "allocation" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[var(--text-muted)] uppercase font-semibold">Assessed Risk Score</div>
                      <div className="text-xl font-black text-[#8EC8FC]">Moderate (6.2 / 10)</div>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] max-w-[180px] text-right">
                      Balanced for 8-10 year retirement horizon.
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        <span>Equity & Index (75%)</span>
                        <span className="text-[var(--accent-primary)]">₹6,31,988</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--bg-surface-elevated)] overflow-hidden">
                        <div className="h-full bg-[#F88D50] rounded-full" style={{ width: "75%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        <span>Gold & Commodities (15%)</span>
                        <span className="text-[#FED5A2]">₹1,26,398</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--bg-surface-elevated)] overflow-hidden">
                        <div className="h-full bg-[#FED5A2] rounded-full" style={{ width: "15%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        <span>Liquid Cash / Debt (10%)</span>
                        <span className="text-[#8EC8FC]">₹84,265</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--bg-surface-elevated)] overflow-hidden">
                        <div className="h-full bg-[#8EC8FC] rounded-full" style={{ width: "10%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right: Narrative + Checklist + CTA */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs font-semibold tracking-wider text-[var(--accent-primary)] uppercase mb-4 shadow-sm">
              REAL INSIGHTS. REAL IMPACT.
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-5 leading-tight">
              Turn Your Financial Data Into a <span className="text-[var(--accent-primary)]">Better Future.</span>
            </h2>

            <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-8">
              Visualize your financial progress, understand your risk, and make smarter decisions with beautiful, easy-to-understand insights.
            </p>

            {/* Checklist */}
            <div className="space-y-4 mb-9 w-full">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--bg-surface)] text-[#5AC58E] border border-[var(--border-glass)] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA (Solid Color) */}
            <button
              onClick={onExplore}
              className="btn-primary px-7 py-3.5 rounded-xl font-semibold text-base flex items-center gap-2 group cursor-pointer"
            >
              <span>Explore Wealthzy</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}

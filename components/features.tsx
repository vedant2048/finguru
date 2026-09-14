"use client";

import React from "react";

export default function Features() {
  const features = [
    {
      id: "portfolio-tracking",
      title: "Portfolio Tracking",
      description: "Track all your investments in one unified dashboard with live valuations, real-time returns, and asset allocation breakdown.",
      icon: (
        <svg className="w-6 h-6 text-[#F88D50]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
      customVisual: (
        <div className="mt-4 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] text-[var(--text-muted)]">Net Worth</div>
            <div className="font-bold text-[var(--text-primary)]">₹8,42,651</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[var(--text-muted)]">All-Time Returns</div>
            <div className="font-bold text-[#5AC58E]">+12.4%</div>
          </div>
        </div>
      ),
    },
    {
      id: "personalized-insights",
      title: "Personalized Insights",
      description: "Get intelligent AI-driven insights tailored to your specific portfolio holdings, risk appetite, and long-term financial objectives.",
      icon: (
        <svg className="w-6 h-6 text-[#8EC8FC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a8 8 0 0 0-8 8c0 3.3 2 6.2 5 7.4V20a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2.6c3-1.2 5-4.1 5-7.4a8 8 0 0 0-8-8z" />
          <line x1="10" y1="21" x2="14" y2="21" />
        </svg>
      ),
      customVisual: (
        <div className="mt-4 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center gap-2.5 text-xs">
          <div className="w-2 h-2 rounded-full bg-[#F88D50] shrink-0" />
          <span className="text-[var(--text-secondary)] truncate">Equity exposure optimized for 12% target CAGR.</span>
        </div>
      ),
    },
    {
      id: "goal-planning",
      title: "Financial Goal Planning",
      description: "Set and simulate goals such as Buy a house, Retirement, Child Education, Vacation, and an Emergency Fund with live projections.",
      icon: (
        <svg className="w-6 h-6 text-[#FED5A2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="m10 15 5-3-5-3v6Z" />
        </svg>
      ),
      customVisual: (
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex justify-between text-[11px] text-[var(--text-secondary)]">
            <span>Buy a House</span>
            <span className="text-[#F88D50] font-semibold">₹45L / ₹75L (60%)</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--bg-surface-elevated)] overflow-hidden">
            <div className="h-full bg-[#F88D50] rounded-full" style={{ width: "60%" }} />
          </div>
        </div>
      ),
    },
    {
      id: "market-insights",
      title: "Market Insights",
      description: "Understand broader market indices and sector movements with crystal clear, jargon-free explanations and actionable context.",
      icon: (
        <svg className="w-6 h-6 text-[#5AC58E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      ),
      customVisual: (
        <div className="mt-4 p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-between">
          <div className="text-xs font-semibold text-[var(--text-primary)]">NIFTY 50</div>
          <div className="w-24 h-6">
            <svg className="w-full h-full" viewBox="0 0 100 25">
              <path d="M 0 20 Q 25 15, 50 18 T 100 4" fill="none" stroke="#5AC58E" strokeWidth="2" />
            </svg>
          </div>
          <div className="text-xs font-bold text-[#5AC58E]">+0.84%</div>
        </div>
      ),
    },
    {
      id: "learning-hub",
      title: "Learning Hub",
      description: "Master investing principles, tax optimization strategies, and compounding secrets through concise, beginner-friendly interactive modules.",
      icon: (
        <svg className="w-6 h-6 text-[#8EC8FC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10" />
          <path d="M6 10h10" />
        </svg>
      ),
      customVisual: (
        <div className="mt-4 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-glass)]">SIP Basics</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--bg-surface)] text-[#F88D50] border border-[var(--border-glass)]">Tax Alpha</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--bg-surface)] text-[#8EC8FC] border border-[var(--border-glass)]">Risk 101</span>
        </div>
      ),
    },
    {
      id: "secure-private",
      title: "Secure & Private",
      description: "Bank-grade 256-bit TLS encryption, multi-factor security, and strict data confidentiality. Your financial data is always private and protected.",
      icon: (
        <svg className="w-6 h-6 text-[#F88D50]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      customVisual: (
        <div className="mt-4 flex items-center justify-between text-xs p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
          <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-[#5AC58E]" />
            256-Bit Encrypted
          </span>
          <span className="text-[10px] font-bold text-[#8EC8FC]">ISO/IEC Compliant</span>
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="py-24 relative bg-[var(--bg-secondary)] border-t border-[var(--border-glass)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs font-semibold tracking-wider text-[var(--accent-primary)] uppercase mb-4">
            EVERYTHING YOU NEED TO BUILD WEALTH
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] mb-4">
            Powerful financial tools. <br className="hidden sm:inline" />
            <span className="text-[var(--accent-primary)]">Beautiful insights. All in one place.</span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-normal">
            Designed for thoughtful investors who demand precision without unnecessary complexity.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => (
            <div
              key={item.id}
              className="glass-card-interactive rounded-2xl p-7 flex flex-col justify-between group bg-[var(--bg-card)] border border-[var(--border-glass)] shadow-md"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-center mb-5 group-hover:border-[var(--accent-primary)] transition-colors duration-200 shadow-sm">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2.5">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Visual preview */}
              {item.customVisual}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

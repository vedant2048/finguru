import React from "react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Connect your investments",
      desc: "Add your financial information or portfolio and bring everything into one place seamlessly.",
      badge: "Connect",
      accentColor: "#F88D50",
      icon: (
        <svg className="w-6 h-6 text-[#F88D50]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
      highlight: "Bank-Grade Linking",
    },
    {
      step: "02",
      title: "Understand your wealth",
      desc: "Wealthzy transforms complicated financial data into simple insights, charts, and understandable metrics.",
      badge: "Understand",
      accentColor: "#8EC8FC",
      icon: (
        <svg className="w-6 h-6 text-[#8EC8FC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      ),
      highlight: "Real-Time Clarity",
    },
    {
      step: "03",
      title: "Make smarter decisions",
      desc: "Track your goals, understand opportunities, and make better-informed financial decisions over time.",
      badge: "Grow",
      accentColor: "#FED5A2",
      icon: (
        <svg className="w-6 h-6 text-[#FED5A2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      highlight: "Sustained Wealth",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative bg-[var(--bg-primary)] border-t border-[var(--border-glass)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs font-semibold tracking-wider text-[var(--accent-primary)] uppercase mb-4">
            HOW IT WORKS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] mb-4">
            Your Financial Journey in <span className="text-[var(--accent-primary)]">3 Simple Steps</span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-normal">
            No confusion. No complexity. Just clarity.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => (
            <div
              key={item.step}
              className="glass-card-interactive rounded-2xl p-7 sm:p-8 flex flex-col justify-between relative group bg-[var(--bg-card)] border border-[var(--border-glass)] shadow-md"
            >
              <div>
                {/* Top Row: Number & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-center group-hover:border-[var(--accent-primary)] transition-colors duration-200">
                    {item.icon}
                  </div>
                  <span className="text-3xl font-black text-[var(--text-muted)]/50 font-mono">
                    {item.step}
                  </span>
                </div>

                {/* Eyebrow badge */}
                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: item.accentColor }}>
                  {item.step} — {item.badge}
                </div>

                {/* Step Title */}
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                  {item.title}
                </h3>

                {/* Step Description */}
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              {/* Bottom tag & arrow */}
              <div className="pt-4 border-t border-[var(--border-glass)] flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-surface)] px-2.5 py-1 rounded-md border border-[var(--border-glass)]">
                  {item.highlight}
                </span>
                {idx < 2 && (
                  <span className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] group-hover:translate-x-1 transition-all text-base">
                    →
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

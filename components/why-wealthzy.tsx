import React from "react";

export default function WhyWealthzy() {
  const pillars = [
    {
      title: "Understand",
      subtitle: "Clarity over complexity",
      description: "Turn financial numbers and market noise into clear, actionable information you can actually understand and trust.",
      accentColor: "#F88D50",
      icon: (
        <svg className="w-6 h-6 text-[#F88D50]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      ),
    },
    {
      title: "Plan",
      subtitle: "Precision over guesswork",
      description: "Set personalized goals, calibrate risk milestones, and track your multi-year compounding trajectory with confidence.",
      accentColor: "#8EC8FC",
      icon: (
        <svg className="w-6 h-6 text-[#8EC8FC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
    },
    {
      title: "Grow",
      subtitle: "Discipline over emotion",
      description: "Make more informed financial decisions over time, backed by automated intelligence and systematic portfolio rebalancing.",
      accentColor: "#FED5A2",
      icon: (
        <svg className="w-6 h-6 text-[#FED5A2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20" />
          <path d="m17 5-5-3-5 3" />
          <path d="m17 19-5 3-5-3" />
        </svg>
      ),
    },
  ];

  return (
    <section id="why-wealthzy" className="py-24 relative bg-[var(--bg-primary)] border-t border-[var(--border-glass)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs font-semibold tracking-wider text-[var(--accent-primary)] uppercase mb-4">
            WHY WEALTHZY?
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
            Your money is complicated enough. <br className="hidden sm:inline" />
            <span className="text-[var(--accent-primary)]">Your financial tools shouldn't be.</span>
          </h2>
        </div>

        {/* 3 Columns (Clean Neutral Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="glass-card-interactive rounded-2xl p-8 flex flex-col items-start text-left group bg-[var(--bg-card)] border border-[var(--border-glass)] shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-center mb-6 group-hover:border-[var(--accent-primary)] transition-colors duration-200 shadow-sm">
                {pillar.icon}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: pillar.accentColor }}>
                {pillar.subtitle}
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                {pillar.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

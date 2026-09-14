import React from "react";

export default function TrustStrip() {
  const trustItems = [
    { label: "Track investments", icon: "📊" },
    { label: "Understand performance", icon: "📈" },
    { label: "Plan financial goals", icon: "🎯" },
    { label: "Make informed decisions", icon: "✨" },
  ];

  return (
    <section className="relative py-8 border-y border-[var(--border-glass)] bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <h3 className="text-sm font-semibold tracking-wide text-[var(--text-secondary)] uppercase">
              Everything you need to make better financial decisions.
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 w-full lg:w-auto">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs sm:text-sm font-medium text-[var(--text-primary)] shadow-sm hover:border-[var(--accent-violet)] transition-colors duration-200"
              >
                <span className="w-4 h-4 rounded-full bg-[var(--bg-surface-elevated)] text-[#65C98A] border border-[var(--border-glass)] flex items-center justify-center text-[10px] font-bold shrink-0">
                  ✓
                </span>
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

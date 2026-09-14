import React from "react";

export default function Testimonials() {
  const reviews = [
    {
      quote: "Wealthzy made investing feel much less complicated. I finally understand where my money is going.",
      name: "Aarav Mehta",
      role: "Software Engineer",
      avatarBg: "#F88D50",
      avatarColor: "#FFFFFF",
      initials: "AM",
      city: "Bengaluru",
    },
    {
      quote: "The goal tracking keeps me motivated and makes my financial progress feel tangible. The UI is genuinely refreshing.",
      name: "Riya Sharma",
      role: "Marketing Manager",
      avatarBg: "#8EC8FC",
      avatarColor: "#12100E",
      initials: "RS",
      city: "Mumbai",
    },
    {
      quote: "It gives me the information I need without overwhelming me with financial jargon. Clean, accurate, and trustworthy.",
      name: "Karan Patel",
      role: "Entrepreneur",
      avatarBg: "#FED5A2",
      avatarColor: "#12100E",
      initials: "KP",
      city: "Ahmedabad",
    },
  ];

  return (
    <section className="py-24 relative bg-[var(--bg-secondary)] border-t border-[var(--border-glass)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs font-semibold tracking-wider text-[var(--accent-primary)] uppercase mb-4">
            REAL PEOPLE. REAL PROGRESS.
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] mb-4">
            Built to make financial decisions <br className="hidden sm:inline" />
            <span className="text-[var(--accent-primary)]">feel simpler.</span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-normal">
            Join thousands of modern investors who found clarity with Wealthzy.
          </p>
        </div>

        {/* 3 Testimonials Grid (Clean Solid Neutral Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.name}
              className="glass-card-interactive rounded-2xl p-7 sm:p-8 flex flex-col justify-between bg-[var(--bg-card)] border border-[var(--border-glass)] shadow-md"
            >
              <div>
                {/* 5-Star Rating (Solid Sand Swatch #FED5A2) */}
                <div className="flex items-center gap-1 text-[#FED5A2] mb-5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-base text-[var(--text-primary)] leading-relaxed italic mb-8 font-medium">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              {/* User Profile Footer (Solid Avatar Badge) */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-[var(--border-glass)]">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                  style={{ backgroundColor: rev.avatarBg, color: rev.avatarColor }}
                >
                  {rev.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">{rev.name}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{rev.role} • {rev.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

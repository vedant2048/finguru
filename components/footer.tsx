import React from "react";
import Link from "next/link";

export default function Footer() {
  const footerLinks = {
    Product: [
      { name: "Features", href: "#features" },
      { name: "How It Works", href: "#how-it-works" },
      { name: "Pricing", href: "#" },
      { name: "Security", href: "#features" },
    ],
    Company: [
      { name: "About", href: "#why-wealthzy" },
      { name: "Contact", href: "#" },
      { name: "Careers", href: "#" },
    ],
    Resources: [
      { name: "Insights", href: "#insights" },
      { name: "Learning Hub", href: "#features" },
      { name: "FAQs", href: "#" },
    ],
    Legal: [
      { name: "Privacy", href: "#" },
      { name: "Terms", href: "#" },
      { name: "Disclaimer", href: "#" },
    ],
  };

  return (
    <footer className="border-t border-[var(--border-glass)] bg-[var(--bg-secondary)] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12 mb-12">
          
          {/* Brand Left Column */}
          <div className="col-span-2 md:col-span-4 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-center shadow-sm group-hover:border-[var(--accent-primary)] transition-colors duration-200">
                <svg className="w-4 h-4 text-[var(--accent-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6l4.5 12L12 9l4.5 9L21 6" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Wealth<span className="text-[var(--accent-primary)]">zy</span>
              </span>
            </Link>

            <p className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
              Understand. Plan. Grow.
            </p>
            <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">
              Personal wealth and investment intelligence engineered for modern Indian investors.
            </p>
          </div>

          {/* Nav Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="col-span-1 md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border-glass)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© 2026 Wealthzy. All rights reserved.</p>
          <p>Investments are subject to market risks. Read all scheme related documents carefully.</p>
        </div>
      </div>
    </footer>
  );
}

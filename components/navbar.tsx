"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";

interface NavbarProps {
  onOpenDemo?: () => void;
  onGetStarted?: () => void;
}

export default function Navbar({ onOpenDemo, onGetStarted }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Insights", href: "#insights" },
    { name: "About", href: "#why-wealthzy" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-glass)] py-3.5 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo (Solid Icon & Border, Swatch-Infused) */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-center shadow-sm group-hover:border-[var(--accent-primary)] transition-colors duration-200">
              <svg
                className="w-5 h-5 text-[var(--accent-primary)] group-hover:scale-105 transition-transform duration-200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6l4.5 12L12 9l4.5 9L21 6" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Wealth<span className="text-[var(--accent-primary)]">zy</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-glass)] px-4 py-1.5 rounded-full">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3.5 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] rounded-full transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right actions: Theme Toggle + CTA */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Functional Theme Toggle (☾ Dark | ☀ Light) */}
            <div
              className="relative flex items-center p-1 bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] rounded-full text-xs font-semibold shadow-sm transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => theme !== "dark" && toggleTheme()}
                aria-label="Switch to Dark Mode"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  theme === "dark"
                    ? "bg-[var(--accent-primary)] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => theme !== "light" && toggleTheme()}
                aria-label="Switch to Light Mode"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  theme === "light"
                    ? "bg-[var(--accent-primary)] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
                <span>Light</span>
              </button>
            </div>

            {/* Primary CTA (Solid Coral Button) */}
            <button
              onClick={onGetStarted}
              className="btn-primary px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Started</span>
              <span className="text-base leading-none">→</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] text-[var(--text-secondary)]"
            >
              <svg className="w-4 h-4 text-[var(--accent-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open Navigation Menu"
              className="p-2 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] text-[var(--text-primary)]"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-3 p-4 bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] rounded-2xl shadow-xl flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] rounded-lg"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-2 border-t border-[var(--border-glass)] flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onGetStarted) onGetStarted();
                }}
                className="btn-primary w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5"
              >
                <span>Get Started</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

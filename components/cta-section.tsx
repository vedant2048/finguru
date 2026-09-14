"use client";

import React from "react";

interface CTASectionProps {
  onGetStarted?: () => void;
}

export default function CTASection({ onGetStarted }: CTASectionProps) {
  return (
    <section className="py-24 relative bg-[var(--bg-primary)] border-t border-[var(--border-glass)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Solid Container Box (ZERO Gradients) */}
        <div className="relative rounded-3xl p-8 sm:p-14 lg:p-16 bg-[var(--bg-secondary)] border border-[var(--border-glass)] shadow-xl text-center max-w-4xl mx-auto">
          
          <div className="relative z-10 max-w-2xl mx-auto">
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs font-semibold tracking-wider text-[var(--accent-primary)] uppercase mb-6">
              TAKE CONTROL OF YOUR FINANCES
            </div>

            {/* Main CTA Heading (Solid Text Only) */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-4 leading-tight">
              Your wealth deserves <br />
              <span className="text-[var(--accent-primary)]">
                more than a guess.
              </span>
            </h2>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
              Start understanding your investments with Wealthzy. Join over 50,000 smart investors today.
            </p>

            {/* CTA Button (Solid Coral) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <button
                onClick={onGetStarted}
                className="btn-primary px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 group w-full sm:w-auto cursor-pointer"
              >
                <span>Get Started</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            {/* Secondary small text */}
            <p className="text-xs text-[var(--text-muted)] font-medium">
              Free to get started • No credit card required • 2-minute setup
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

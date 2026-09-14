"use client";

import React, { useState } from "react";
import Link from "next/link";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const demoSteps = [
    {
      title: "1. Connect All Assets in 60 Seconds",
      subtitle: "Instant Portfolio Consolidation",
      description: "Wealthzy auto-syncs your Mutual Funds via CAS, Indian Equities via CDSL/NSDL, Gold holdings, and Fixed Deposits into one clean ledger.",
      stats: [
        { label: "Sync Speed", val: "< 60s" },
        { label: "Encryption", val: "256-Bit TLS" },
        { label: "Broker Support", val: "All Major RTAs" },
      ],
    },
    {
      title: "2. Intelligent Deep Risk Analysis",
      subtitle: "No More Overlapping Funds",
      description: "Our AI scanner identifies overlapping stock holdings across your mutual funds to avoid false diversification and optimize your Sharpe ratio.",
      stats: [
        { label: "Stock Overlap", val: "0% Redundancy" },
        { label: "Risk Score", val: "6.2 Moderate" },
        { label: "Tax Alpha", val: "+₹18,400/yr" },
      ],
    },
    {
      title: "3. Automated Milestone Projection",
      subtitle: "Goal Tracking That Feels Real",
      description: "Simulate inflation-adjusted FIRE targets, real-estate purchase timelines, and dynamic SIP step-up compounding curves with ease.",
      stats: [
        { label: "FIRE Age", val: "42 Yrs" },
        { label: "Step-Up SIP", val: "+10%/yr" },
        { label: "Confidence", val: "94%" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12100E]/80 backdrop-blur-md">
      {/* Modal Box (Solid Color, Swatch-Infused) */}
      <div className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-md bg-[var(--bg-surface-elevated)] text-[var(--accent-primary)] text-xs font-bold border border-[var(--border-glass)]">
            Interactive Product Preview
          </span>
        </div>

        <h3 className="text-2xl font-black text-[var(--text-primary)] mb-1">
          {demoSteps[activeStep].title}
        </h3>
        <p className="text-xs font-semibold text-[#8EC8FC] uppercase tracking-wider mb-4">
          {demoSteps[activeStep].subtitle}
        </p>

        {/* Description */}
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
          {demoSteps[activeStep].description}
        </p>

        {/* Highlight Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {demoSteps[activeStep].stats.map((s) => (
            <div key={s.label} className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-glass)] text-center">
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">{s.label}</div>
              <div className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-0.5">{s.val}</div>
            </div>
          ))}
        </div>

        {/* Stepper Dots & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-glass)]">
          <div className="flex items-center gap-2">
            {demoSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeStep === i ? "w-6 bg-[var(--accent-primary)]" : "w-2 bg-[var(--border-glass)]"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {activeStep < demoSteps.length - 1 ? (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Next Step →
              </button>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className="btn-primary px-4.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <span>Get Started Free</span>
                <span>→</span>
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { AssetDonutChart } from "@/components/ui/financial-charts";

interface Question {
  id: number;
  title: string;
  subtitle: string;
  options: { label: string; score: number; desc: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    title: "What is your primary investment time horizon?",
    subtitle: "The period before you anticipate needing significant capital withdrawals.",
    options: [
      { label: "Under 1 Year", score: 10, desc: "Immediate liquidity and capital preservation priority." },
      { label: "1 to 3 Years", score: 25, desc: "Short-term horizon with minimal tolerance for volatility." },
      { label: "3 to 7 Years", score: 50, desc: "Medium-term growth with capability to absorb market cycles." },
      { label: "7+ Years", score: 80, desc: "Long-term compounding focus with maximum drawdown recovery time." },
    ],
  },
  {
    id: 2,
    title: "How do you react when the broader market drops 15% in a month?",
    subtitle: "Behavioral response during sudden equity corrections.",
    options: [
      { label: "Sell all equities to prevent further decline", score: 10, desc: "High emotional anxiety and low drawdown capacity." },
      { label: "Feel nervous but hold without trading", score: 40, desc: "Disciplined patience with moderate risk threshold." },
      { label: "View it as an opportunity and allocate additional capital", score: 85, desc: "Value-seeking orientation and high risk resilience." },
    ],
  },
  {
    id: 3,
    title: "What is your primary portfolio objective?",
    subtitle: "Balance between stability, income, and capital compounding.",
    options: [
      { label: "Capital Preservation (Beat Inflation)", score: 20, desc: "Focus on debt, fixed deposits, and gold." },
      { label: "Balanced Capital Growth", score: 55, desc: "Hybrid allocation of large-cap equities and fixed income." },
      { label: "Aggressive Wealth Compounding", score: 90, desc: "High equity allocation focused on multi-year compounders." },
    ],
  },
  {
    id: 4,
    title: "What is your level of financial market experience?",
    subtitle: "Understanding of market cycles, fundamental valuation, and macroeconomic variables.",
    options: [
      { label: "Novice / First-time Investor", score: 15, desc: "Learning core asset class characteristics." },
      { label: "Intermediate (1–4 Years)", score: 50, desc: "Familiar with equities, mutual funds, and asset allocation." },
      { label: "Experienced (5+ Years)", score: 85, desc: "Active experience navigating bull and bear market cycles." },
    ],
  },
];

export default function RiskProfilePage() {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = QUESTIONS[currentQIndex];

  const handleSelectOption = (score: number) => {
    const updated = { ...answers, [currentQ.id]: score };
    setAnswers(updated);

    if (currentQIndex < QUESTIONS.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentQIndex(0);
    setIsCompleted(false);
  };

  // Calculate final score
  const scores = Object.values(answers);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 58;

  let riskCategory = "Moderate Growth";
  let targetAssetSlices = [
    { label: "Equity", value: 65, percentage: 65, color: "#3A7BD5" },
    { label: "Debt & Fixed Income", value: 25, percentage: 25, color: "#4E9F76" },
    { label: "Gold", value: 10, percentage: 10, color: "#D9822B" },
  ];

  if (avgScore < 35) {
    riskCategory = "Conservative Capital Preservation";
    targetAssetSlices = [
      { label: "Equity", value: 20, percentage: 20, color: "#3A7BD5" },
      { label: "Debt & Fixed Income", value: 65, percentage: 65, color: "#4E9F76" },
      { label: "Gold & Liquid Cash", value: 15, percentage: 15, color: "#D9822B" },
    ];
  } else if (avgScore > 70) {
    riskCategory = "Aggressive Wealth Compounding";
    targetAssetSlices = [
      { label: "Equity", value: 80, percentage: 80, color: "#3A7BD5" },
      { label: "Debt & Fixed Income", value: 15, percentage: 15, color: "#4E9F76" },
      { label: "Gold & Commodities", value: 5, percentage: 5, color: "#D9822B" },
    ];
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="pb-2 border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8]">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Understand your risk profile.
          </h1>
          <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
            An objective assessment of your behavioral risk tolerance and capital drawdown capacity.
          </p>
        </div>

        {!isCompleted ? (
          /* Question Card */
          <div className="p-6 md:p-8 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-6">
            <div className="flex items-center justify-between font-mono text-xs text-[#A9A39B]">
              <Badge variant="info">QUESTION {currentQIndex + 1} OF {QUESTIONS.length}</Badge>
              <span>{Math.round(((currentQIndex) / QUESTIONS.length) * 100)}% Completed</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                {currentQ.title}
              </h2>
              <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
                {currentQ.subtitle}
              </p>
            </div>

            {/* Selectable Options */}
            <div className="space-y-3 font-mono">
              {currentQ.options.map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(opt.score)}
                  role="button"
                  tabIndex={0}
                  className="p-4 rounded border transition-colors duration-150 cursor-pointer text-left bg-[#181615] border-[#2A2420] hover:border-[#3A7BD5] hover:bg-[#201C19] dark:bg-[#181615] dark:border-[#2A2420] dark:hover:border-[#3A7BD5] light:bg-[#FAF7F2] light:border-[#DDD5C9] light:hover:border-[#2E68B8] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                      {opt.label}
                    </div>
                    <p className="text-[11px] text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
                      {opt.desc}
                    </p>
                  </div>
                  <div className="text-xs text-[#3A7BD5] font-semibold shrink-0">
                    Select &rarr;
                  </div>
                </div>
              ))}
            </div>

            {currentQIndex > 0 && (
              <button
                type="button"
                onClick={() => setCurrentQIndex(currentQIndex - 1)}
                className="text-xs font-mono text-[#A9A39B] hover:text-[#FAF7F2] transition-colors"
              >
                &larr; Previous Question
              </button>
            )}
          </div>
        ) : (
          /* Completion Result View */
          <div className="p-6 md:p-8 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#4E9F76]">
                ASSESSMENT COMPLETE
              </span>
              <button
                onClick={handleReset}
                className="text-xs font-mono text-[#3A7BD5] hover:underline"
              >
                Retake Assessment
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-6 space-y-3 font-mono">
                <div className="text-xs text-[#A9A39B]">SYNTHESIZED RISK SCORE</div>
                <div className="text-4xl font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                  {avgScore} <span className="text-base text-[#A9A39B] font-normal">/ 100</span>
                </div>
                <div className="text-sm font-bold text-[#3A7BD5]">
                  Category: {riskCategory}
                </div>
                <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64] leading-relaxed">
                  Your responses indicate a comfortable capacity to absorb multi-month equity volatility in exchange for long-term real purchasing power compounding.
                </p>
              </div>

              <div className="md:col-span-6 p-4 rounded border border-[#2E2925] dark:border-[#2E2925] light:border-[#E8E2D8] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2]">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B] block mb-3">
                  Recommended Target Allocation
                </span>
                <AssetDonutChart slices={targetAssetSlices} totalValue="100%" />
              </div>
            </div>

            {/* Standard Financial Disclaimer */}
            <div className="pt-4 border-t border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8] text-[11px] font-mono text-[#6F6A64] dark:text-[#6F6A64] light:text-[#9E978F] leading-relaxed">
              * This profile is based on your responses and may change as your financial circumstances, income, or liquidity requirements change. Review periodically.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded text-xs font-mono font-semibold transition-colors bg-[#FAF7F2] text-[#0F0D0C] hover:bg-[#E6E1D8] dark:bg-[#FAF7F2] dark:text-[#0F0D0C] light:bg-[#171514] light:text-[#FAF7F2]"
              >
                Apply to Dashboard &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

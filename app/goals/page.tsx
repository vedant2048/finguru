"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";

interface Goal {
  id: string;
  title: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

const INITIAL_GOALS: Goal[] = [
  {
    id: "g1",
    title: "Retirement Corpus",
    category: "Long-term Wealth",
    targetAmount: 2500000,
    currentAmount: 820000,
    targetDate: "2038",
  },
  {
    id: "g2",
    title: "6-Month Emergency Reserve",
    category: "Safety Cushion",
    targetAmount: 240000,
    currentAmount: 180000,
    targetDate: "2026",
  },
  {
    id: "g3",
    title: "Primary Residence Downpayment",
    category: "Real Estate",
    targetAmount: 1500000,
    currentAmount: 450000,
    targetDate: "2029",
  },
  {
    id: "g4",
    title: "Higher Education Fund",
    category: "Family & Education",
    targetAmount: 800000,
    currentAmount: 220000,
    targetDate: "2031",
  },
  {
    id: "g5",
    title: "International Sabbatical / Travel",
    category: "Lifestyle",
    targetAmount: 300000,
    currentAmount: 195000,
    targetDate: "2027",
  },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);

  // Emergency Fund Planner Interactive State
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(40000);
  const [targetMonths, setTargetMonths] = useState<number>(6);
  const [currentEmergencyFund, setCurrentEmergencyFund] = useState<number>(180000);

  const targetFund = monthlyExpenses * targetMonths;
  const remainingFund = Math.max(0, targetFund - currentEmergencyFund);
  const fundProgress = Math.min(100, Math.round((currentEmergencyFund / (targetFund || 1)) * 100));

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-2 border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8]">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Financial Goals &amp; Capital Objectives
          </h1>
          <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
            Map investments to time-horizon targets, calculate compounding progress, and protect liquid reserves.
          </p>
        </div>

        {/* Dedicated Emergency Fund Planner Section */}
        <div className="p-6 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-inherit">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64] block">
                Emergency Fund Architecture
              </span>
              <h2 className="text-base font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514] mt-0.5">
                Liquidity Cushion &amp; Capital Preservation
              </h2>
            </div>
            <Badge variant={fundProgress >= 75 ? "positive" : "warning"}>
              RESERVE HEALTH: {fundProgress}% FUNDED
            </Badge>
          </div>

          {/* Interactive Calculator Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="block text-[#A9A39B] mb-1.5 font-semibold">
                Monthly Essential Expenses (₹)
              </label>
              <input
                type="number"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                className="w-full h-10 px-3 rounded border bg-[#181615] border-[#2A2420] text-[#FAF7F2] outline-none dark:bg-[#181615] dark:border-[#2A2420] dark:text-[#FAF7F2] light:bg-[#FAF7F2] light:border-[#DDD5C9] light:text-[#171514]"
              />
            </div>

            <div>
              <label className="block text-[#A9A39B] mb-1.5 font-semibold">
                Target Cushion (Months)
              </label>
              <select
                value={targetMonths}
                onChange={(e) => setTargetMonths(Number(e.target.value))}
                className="w-full h-10 px-3 rounded border bg-[#181615] border-[#2A2420] text-[#FAF7F2] outline-none dark:bg-[#181615] dark:border-[#2A2420] dark:text-[#FAF7F2] light:bg-[#FAF7F2] light:border-[#DDD5C9] light:text-[#171514]"
              >
                <option value={3}>3 Months (Aggressive)</option>
                <option value={6}>6 Months (Recommended)</option>
                <option value={9}>9 Months (Conservative)</option>
                <option value={12}>12 Months (High Security)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#A9A39B] mb-1.5 font-semibold">
                Current Liquid Emergency Fund (₹)
              </label>
              <input
                type="number"
                value={currentEmergencyFund}
                onChange={(e) => setCurrentEmergencyFund(Number(e.target.value))}
                className="w-full h-10 px-3 rounded border bg-[#181615] border-[#2A2420] text-[#FAF7F2] outline-none dark:bg-[#181615] dark:border-[#2A2420] dark:text-[#FAF7F2] light:bg-[#FAF7F2] light:border-[#DDD5C9] light:text-[#171514]"
              />
            </div>
          </div>

          {/* Visualization & Metrics Bar */}
          <div className="p-4 rounded border border-[#2E2925] dark:border-[#2E2925] light:border-[#E8E2D8] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#A9A39B]">Funding Progress</span>
              <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                ₹{currentEmergencyFund.toLocaleString("en-IN")} of ₹{targetFund.toLocaleString("en-IN")} ({fundProgress}%)
              </span>
            </div>

            <div className="w-full h-2 rounded-sm bg-[#211F1D] dark:bg-[#211F1D] light:bg-[#DDD5C9] overflow-hidden">
              <div
                className="h-full bg-[#4E9F76] transition-all duration-300 rounded-sm"
                style={{ width: `${fundProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px]">
              <div>
                <span className="text-[#A9A39B] block">Target Fund:</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                  ₹{targetFund.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-[#A9A39B] block">Current Reserve:</span>
                <span className="font-bold text-[#4E9F76]">
                  ₹{currentEmergencyFund.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-[#A9A39B] block">Remaining Deficit:</span>
                <span className="font-bold text-[#D9822B]">
                  ₹{remainingFund.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-[#A9A39B] block">Cushion Coverage:</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                  {(currentEmergencyFund / (monthlyExpenses || 1)).toFixed(1)} Months
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
              Active Financial Goals ({goals.length})
            </span>
            <span className="text-[11px] font-mono text-[#A9A39B]">COMPOUNDING HORIZON 2026–2038</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((g) => {
              const pct = ((g.currentAmount / g.targetAmount) * 100).toFixed(1);
              return (
                <div
                  key={g.id}
                  className="p-5 rounded border transition-colors bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4 font-mono text-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#A9A39B] uppercase">{g.category}</span>
                      <Badge variant="neutral">TARGET: {g.targetDate}</Badge>
                    </div>
                    <h3 className="text-sm font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                      {g.title}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#A9A39B]">Current: ₹{g.currentAmount.toLocaleString("en-IN")}</span>
                      <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                        ₹{g.targetAmount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-sm bg-[#211F1D] dark:bg-[#211F1D] light:bg-[#DDD5C9] overflow-hidden">
                      <div
                        className="h-full bg-[#3A7BD5] transition-all duration-300 rounded-sm"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] pt-1">
                      <span className="text-[#4E9F76] font-semibold">{pct}% Achieved</span>
                      <span className="text-[#A9A39B]">
                        Gap: ₹{(g.targetAmount - g.currentAmount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

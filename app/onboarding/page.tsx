"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Investor");
  const [riskTolerance, setRiskTolerance] = useState<"conservative" | "moderate" | "growth">("moderate");
  const [primaryGoal, setPrimaryGoal] = useState("wealth_building");

  useEffect(() => {
    try {
      const storedName = localStorage.getItem("wealthzy_userName");
      if (storedName) {
        setUserName(storedName);
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  const handleContinue = () => {
    router.push("/dashboard");
  };

  return (
    <div className="bg-[#12100E] min-h-screen text-[#FFFEE5] flex flex-col justify-between font-sans select-none">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#201C18] border border-[#3B332B] flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-[#F88D50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l4.5 12L12 9l4.5 9L21 6" />
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#FFFEE5]">
            Wealth<span className="text-[#F88D50]">zy</span>
          </span>
        </Link>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg rounded-2xl p-7 md:p-9 bg-[#181512] border border-[#3B332B] shadow-xl">
          <div className="text-center mb-7">
            <span className="inline-block text-[11px] font-extrabold tracking-widest text-[#F88D50] uppercase bg-[#201C18] border border-[#3B332B] px-3.5 py-1 rounded-full mb-3">
              STEP 1 OF 2
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#FFFEE5] tracking-tight">
              Welcome, {userName}!
            </h1>
            <p className="text-xs md:text-sm text-[#C7BDB3] mt-1.5">
              Let&apos;s personalize your wealth dashboard in 30 seconds
            </p>
          </div>

          <div className="space-y-6">
            {/* Primary Goal */}
            <div>
              <label className="block text-xs font-semibold text-[#C7BDB3] uppercase tracking-wider mb-2.5">
                What is your primary investment goal?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: "wealth_building", label: "Grow Wealth", icon: "📈" },
                  { id: "retirement", label: "Retire Early", icon: "🏖️" },
                  { id: "tax_saving", label: "Save Taxes", icon: "🛡️" },
                ].map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => setPrimaryGoal(goal.id)}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      primaryGoal === goal.id
                        ? "bg-[#F88D50]/15 border-[#F88D50] text-[#FFFEE5]"
                        : "bg-[#201C18] border-[#3B332B] text-[#C7BDB3] hover:border-[#F88D50]/40"
                    }`}
                  >
                    <span className="text-lg">{goal.icon}</span>
                    <span>{goal.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Appetite */}
            <div>
              <label className="block text-xs font-semibold text-[#C7BDB3] uppercase tracking-wider mb-2.5">
                Your Risk Appetite
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "conservative", label: "Conservative", color: "#8EC8FC" },
                  { id: "moderate", label: "Moderate", color: "#F88D50" },
                  { id: "growth", label: "Aggressive", color: "#FED5A2" },
                ].map((risk) => (
                  <button
                    key={risk.id}
                    type="button"
                    onClick={() => setRiskTolerance(risk.id as any)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      riskTolerance === risk.id
                        ? "bg-[#201C18] border-[#F88D50] text-[#FFFEE5] shadow-sm"
                        : "bg-[#201C18] border-[#3B332B] text-[#8C8176] hover:text-[#C7BDB3]"
                    }`}
                  >
                    {risk.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleContinue}
              className="w-full bg-[#F88D50] hover:bg-[#E77B3C] py-3.5 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-sm tracking-wide shadow-md cursor-pointer transition-all duration-200"
            >
              <span>Go to Dashboard</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-[#8C8176]">
        &copy; {new Date().getFullYear()} Wealthzy. All rights reserved.
      </footer>
    </div>
  );
}

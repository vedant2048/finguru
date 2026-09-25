"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";

interface PortfolioCheckClientProps {
  userEmail: string;
  userName: string;
}

export function PortfolioCheckClient({ userEmail, userName }: PortfolioCheckClientProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [loadingChoice, setLoadingChoice] = useState<"yes" | "no" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectChoice = async (hasPortfolio: boolean) => {
    setLoadingChoice(hasPortfolio ? "yes" : "no");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ has_portfolio: hasPortfolio }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(
          data.error || "Failed to update your portfolio status. Please check your connection and try again."
        );
        setLoadingChoice(null);
        return;
      }

      // Supabase update confirmed successful -> Navigate
      if (hasPortfolio) {
        router.push("/portfolio-upload");
      } else {
        router.push("/knowing-customer");
      }
    } catch (err: any) {
      console.error("[portfolio-check] Network error:", err);
      setErrorMessage("Network error occurred while saving your choice. Please try again.");
      setLoadingChoice(null);
    }
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col justify-between font-sans transition-colors duration-150 select-none ${
        isDark ? "bg-[#0F0D0C] text-[#FAF7F2]" : "bg-[#FAF7F2] text-[#171514]"
      }`}
    >
      {/* Top Header */}
      <header
        className={`w-full border-b py-4 px-6 ${
          isDark ? "border-[#201C19] bg-[#0F0D0C]" : "border-[#EBE4DA] bg-[#FAF7F2]"
        }`}
      >
        <div className="max-w-[1140px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div
              className={`w-7 h-7 rounded flex items-center justify-center border font-mono text-xs font-bold transition-colors ${
                isDark
                  ? "bg-[#181513] border-[#2A2420] text-[#FAF7F2] group-hover:border-[#3A7BD5]"
                  : "bg-[#FFFFFF] border-[#DDD5C9] text-[#171514] group-hover:border-[#2E68B8]"
              }`}
            >
              W
            </div>
            <span className="text-sm font-bold tracking-tight uppercase font-mono">
              WEALTHZY
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div
              className={`text-xs font-mono font-medium px-2.5 py-1 rounded border tracking-wider uppercase ${
                isDark
                  ? "bg-[#181513] border-[#2A2420] text-[#9E978F]"
                  : "bg-[#FFFFFF] border-[#DDD5C9] text-[#6B635B]"
              }`}
            >
              PORTFOLIO ONBOARDING
            </div>

            <button
              onClick={toggleTheme}
              type="button"
              aria-label="Toggle theme"
              className={`w-8 h-8 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                isDark
                  ? "bg-[#181513] border-[#2A2420] text-[#9E978F] hover:text-[#FAF7F2]"
                  : "bg-[#FFFFFF] border-[#DDD5C9] text-[#6B635B] hover:text-[#171514]"
              }`}
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-16">
        <div className="w-full max-w-2xl mx-auto space-y-8">
          {/* Header Copy */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono font-medium tracking-wider uppercase mb-2 border-[#3A7BD5]/30 bg-[#3A7BD5]/10 text-[#3A7BD5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3A7BD5] animate-pulse" />
              PORTFOLIO INITIALIZATION
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Do you already have an investment portfolio?
            </h1>

            <p
              className={`text-sm sm:text-base leading-relaxed max-w-xl mx-auto ${
                isDark ? "text-[#9E978F]" : "text-[#6B635B]"
              }`}
            >
              Upload your existing portfolio and let Wealthzy analyze it, or continue without one and build your investment profile.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              className={`p-4 rounded border text-xs font-mono flex items-start gap-3 animate-shake ${
                isDark
                  ? "bg-[#2B1414] border-[#D9534F]/40 text-[#D9534F]"
                  : "bg-[#FDE8E8] border-[#C0392B]/40 text-[#C0392B]"
              }`}
            >
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
              </svg>
              <div>
                <p className="font-semibold">Update Failed</p>
                <p className="opacity-90">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Action Options Cards / Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
            {/* OPTION 1: YES */}
            <div
              className={`p-6 sm:p-7 rounded border transition-colors flex flex-col justify-between text-left relative ${
                isDark
                  ? "bg-[#151210] border-[#27221E] hover:border-[#3A7BD5]/60 hover:bg-[#181513]"
                  : "bg-[#FFFFFF] border-[#E5DFD7] hover:border-[#2E68B8]/60 hover:bg-[#FAF7F2]"
              }`}
            >
              <div className="space-y-3 mb-6">
                <div
                  className={`w-10 h-10 rounded border flex items-center justify-center ${
                    isDark
                      ? "bg-[#181513] border-[#2A2420] text-[#3A7BD5]"
                      : "bg-[#F0F5FD] border-[#DDD5C9] text-[#2E68B8]"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>

                <h2 className="text-base sm:text-lg font-bold">
                  Existing Portfolio
                </h2>

                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-[#9E978F]" : "text-[#6B635B]"}`}>
                  Import your Excel or CSV holdings to analyze diversification, risk metrics, and valuation.
                </p>
              </div>

              <button
                type="button"
                id="btn-have-portfolio"
                disabled={loadingChoice !== null}
                onClick={() => handleSelectChoice(true)}
                className={`w-full h-11 px-4 rounded font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  loadingChoice === "yes"
                    ? "opacity-75 cursor-wait"
                    : ""
                } ${
                  isDark
                    ? "bg-[#FAF7F2] text-[#0F0D0C] hover:bg-[#E6E1D8] active:bg-[#D4CEBF]"
                    : "bg-[#171412] text-[#FAF7F2] hover:bg-[#2A2420] active:bg-[#3D352F]"
                }`}
              >
                {loadingChoice === "yes" ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>YES, I HAVE A PORTFOLIO</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* OPTION 2: NO */}
            <div
              className={`p-6 sm:p-7 rounded border transition-colors flex flex-col justify-between text-left relative ${
                isDark
                  ? "bg-[#151210] border-[#27221E] hover:border-[#3A7BD5]/60 hover:bg-[#181513]"
                  : "bg-[#FFFFFF] border-[#E5DFD7] hover:border-[#2E68B8]/60 hover:bg-[#FAF7F2]"
              }`}
            >
              <div className="space-y-3 mb-6">
                <div
                  className={`w-10 h-10 rounded border flex items-center justify-center ${
                    isDark
                      ? "bg-[#181513] border-[#2A2420] text-[#D9822B]"
                      : "bg-[#FEF3E6] border-[#DDD5C9] text-[#B35C00]"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </div>

                <h2 className="text-base sm:text-lg font-bold">
                  New to Investing
                </h2>

                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-[#9E978F]" : "text-[#6B635B]"}`}>
                  Start fresh with structured investor profiling, risk assessment, and personalized goal planning.
                </p>
              </div>

              <button
                type="button"
                id="btn-no-portfolio"
                disabled={loadingChoice !== null}
                onClick={() => handleSelectChoice(false)}
                className={`w-full h-11 px-4 rounded font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  loadingChoice === "no"
                    ? "opacity-75 cursor-wait"
                    : ""
                } ${
                  isDark
                    ? "bg-[#181513] border border-[#2A2420] text-[#FAF7F2] hover:bg-[#201C19] hover:border-[#38302A]"
                    : "bg-[#FFFFFF] border border-[#DDD5C9] text-[#171412] hover:bg-[#F0EDE6]"
                }`}
              >
                {loadingChoice === "no" ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>NO, I DON&apos;T</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Account Identity Footer */}
          <div
            className={`p-3.5 rounded border text-xs font-mono flex items-center justify-between ${
              isDark
                ? "bg-[#151210] border-[#27221E] text-[#9E978F]"
                : "bg-[#FFFFFF] border-[#E5DFD7] text-[#6B635B]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4E9F76]" />
              <span>Signed in as <strong className={isDark ? "text-[#FAF7F2]" : "text-[#171514]"}>{userEmail}</strong></span>
            </div>
            <span className="text-[11px] uppercase tracking-wider">STATE ENFORCED</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`w-full border-t py-4 text-center text-xs font-mono ${
          isDark ? "border-[#201C19] text-[#6E6760]" : "border-[#EBE4DA] text-[#968E85]"
        }`}
      >
        &copy; {new Date().getFullYear()} Wealthzy Financial Technologies. All rights reserved.
      </footer>
    </div>
  );
}

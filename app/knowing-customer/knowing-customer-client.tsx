"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";

interface KnowingCustomerClientProps {
  userEmail: string;
}

export function KnowingCustomerClient({ userEmail }: KnowingCustomerClientProps) {
  const { theme, toggleTheme } = useTheme();
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
                  : "bg-[#FFFFFF] border-[#DDD5C9] text-[#171412] group-hover:border-[#2E68B8]"
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
              INVESTOR PROFILING
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

      {/* Main Placeholder View */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div
          className={`w-full max-w-lg rounded border p-8 sm:p-10 text-center shadow-xl space-y-6 ${
            isDark
              ? "bg-[#151210] border-[#27221E]"
              : "bg-[#FFFFFF] border-[#E5DFD7]"
          }`}
        >
          <div
            className={`w-14 h-14 mx-auto rounded-full border flex items-center justify-center ${
              isDark
                ? "bg-[#181513] border-[#2A2420] text-[#3A7BD5]"
                : "bg-[#F0F5FD] border-[#DDD5C9] text-[#2E68B8]"
            }`}
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase font-semibold border border-[#D9822B]/30 bg-[#D9822B]/10 text-[#D9822B]">
              MODULE IN DEVELOPMENT
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Knowing Customer
            </h1>
            <p className={`text-sm leading-relaxed ${isDark ? "text-[#9E978F]" : "text-[#6B635B]"}`}>
              Your investment profile setup will continue here.
            </p>
          </div>

          <div
            className={`p-4 rounded border text-left text-xs font-mono space-y-2 ${
              isDark
                ? "bg-[#181615] border-[#2E2925] text-[#A9A39B]"
                : "bg-[#FAF7F2] border-[#DDD5C9] text-[#6F6A64]"
            }`}
          >
            <div className="flex justify-between border-b pb-1.5 border-inherit">
              <span className="font-semibold uppercase text-[11px]">ONBOARDING STATUS</span>
              <span className="text-[#4E9F76] font-bold">SAVED (NO PORTFOLIO)</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              We recorded that you do not currently hold an investment portfolio. The upcoming risk &amp; preference questionnaire will guide your asset allocation from scratch.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/portfolio-check"
              className={`w-full sm:w-auto h-10 px-5 rounded border text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors ${
                isDark
                  ? "bg-[#181513] border-[#2A2420] text-[#FAF7F2] hover:bg-[#201C19]"
                  : "bg-[#FFFFFF] border-[#DDD5C9] text-[#171412] hover:bg-[#F0EDE6]"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Change Answer</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`w-full border-t py-4 text-center text-xs font-mono ${
          isDark ? "border-[#201C19] text-[#6E6760]" : "border-[#EBE4DA] text-[#968E85]"
        }`}
      >
        &copy; {new Date().getFullYear()} Wealthzy Financial Technologies.
      </footer>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";

interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: "+91", country: "India", flag: "IN" },
  { code: "+1", country: "United States", flag: "US" },
  { code: "+44", country: "United Kingdom", flag: "GB" },
  { code: "+65", country: "Singapore", flag: "SG" },
  { code: "+971", country: "UAE", flag: "AE" },
  { code: "+61", country: "Australia", flag: "AU" },
  { code: "+49", country: "Germany", flag: "DE" },
  { code: "+1", country: "Canada", flag: "CA" },
  { code: "+41", country: "Switzerland", flag: "CH" },
  { code: "+81", country: "Japan", flag: "JP" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Onboarding Step State (1: Personal Info, 2: Portfolio Status)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1 Form States
  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [dobError, setDobError] = useState<string | null>(null);

  // Step 2 Selection State
  const [portfolioStatus, setPortfolioStatus] = useState<"existing" | "new" | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // User metadata from previous login if available
  const [userName, setUserName] = useState<string>("");

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

  // Format and validate phone input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^\d\s-]/g, "");
    setMobileNumber(rawVal);
    if (phoneError) setPhoneError(null);
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateOfBirth(e.target.value);
    if (dobError) setDobError(null);
  };

  // Step 1 Validation & Proceed to Step 2
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    const cleanedPhone = mobileNumber.replace(/\D/g, "");
    if (!cleanedPhone || cleanedPhone.length < 7) {
      setPhoneError("Please enter a valid mobile number.");
      hasError = true;
    }

    if (!dateOfBirth) {
      setDobError("Please select your date of birth.");
      hasError = true;
    } else {
      const selectedDate = new Date(dateOfBirth);
      const today = new Date();
      if (isNaN(selectedDate.getTime()) || selectedDate >= today) {
        setDobError("Please provide a valid past date of birth.");
        hasError = true;
      }
    }

    if (hasError) return;

    // Transition smoothly to Step 2
    setCurrentStep(2);
  };

  // Final Step 2 Submission
  const handleFinalSubmit = async () => {
    if (!portfolioStatus) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const fullPhoneNumber = `${countryCode} ${mobileNumber.trim()}`;

    try {
      // Store in localStorage for instant client state
      localStorage.setItem("wealthzy_user_phone", fullPhoneNumber);
      localStorage.setItem("wealthzy_user_dob", dateOfBirth);
      localStorage.setItem("wealthzy_portfolio_status", portfolioStatus);
      localStorage.setItem("wealthzy_onboarding_completed", "true");

      // Sync with Supabase Profile API
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_no: fullPhoneNumber,
          dob: dateOfBirth,
          portfolio_status: portfolioStatus,
        }),
      });

      if (!response.ok) {
        console.warn("Backend profile sync returned non-200:", response.status);
      }
    } catch (err) {
      console.error("Error submitting onboarding profile:", err);
    } finally {
      setIsSubmitting(false);
      router.push("/dashboard");
    }
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-200 font-sans select-none ${
        isDark ? "bg-[#0F0D0C] text-[#FAF7F2]" : "bg-[#FAF7F2] text-[#171412]"
      }`}
    >
      {/* Top Navigation */}
      <header
        className={`w-full border-b transition-colors duration-200 ${
          isDark ? "border-[#201C19] bg-[#0F0D0C]" : "border-[#EBE4DA] bg-[#FAF7F2]"
        }`}
      >
        <div className="max-w-[1140px] mx-auto px-6 py-4 flex items-center justify-between">
          {/* Wealthzy Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div
              className={`w-7 h-7 rounded flex items-center justify-center border font-mono text-xs font-bold transition-colors ${
                isDark
                  ? "bg-[#181513] border-[#2A2420] text-[#FAF7F2] group-hover:border-[#4A88D9]"
                  : "bg-[#FFFFFF] border-[#DDD5C9] text-[#171412] group-hover:border-[#2E68B8]"
              }`}
            >
              W
            </div>
            <span
              className={`text-sm font-bold tracking-tight uppercase font-mono ${
                isDark ? "text-[#FAF7F2]" : "text-[#171412]"
              }`}
            >
              WEALTHZY
            </span>
          </Link>

          {/* Right Header Elements: Step Indicator & Dark/Light Mode Toggle */}
          <div className="flex items-center gap-4">
            <div
              className={`text-xs font-mono font-medium px-2.5 py-1 rounded border tracking-wider uppercase ${
                isDark
                  ? "bg-[#181513] border-[#2A2420] text-[#9E978F]"
                  : "bg-[#FFFFFF] border-[#DDD5C9] text-[#6B635B]"
              }`}
            >
              Step {currentStep} of 2
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              type="button"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className={`w-8 h-8 rounded flex items-center justify-center border transition-colors cursor-pointer ${
                isDark
                  ? "bg-[#181513] border-[#2A2420] text-[#9E978F] hover:text-[#FAF7F2] hover:border-[#38302A]"
                  : "bg-[#FFFFFF] border-[#DDD5C9] text-[#6B635B] hover:text-[#171412] hover:border-[#C8BFB2]"
              }`}
            >
              {isDark ? (
                /* Sun Icon */
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                /* Moon Icon */
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-6 py-10 md:py-16">
        <div className="w-full max-w-[1140px] mx-auto">
          {/* Progress Indicator Component */}
          <div className="flex flex-col items-center mb-10 md:mb-14">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs">
              <span className={currentStep >= 1 ? (isDark ? "text-[#FAF7F2]" : "text-[#171412]") : (isDark ? "text-[#4A423A]" : "text-[#B8AEA2]")}>
                ●
              </span>
              <div
                className={`w-14 md:w-20 h-px transition-colors duration-200 ${
                  currentStep === 2
                    ? isDark
                      ? "bg-[#FAF7F2]"
                      : "bg-[#171412]"
                    : isDark
                    ? "bg-[#2A2420]"
                    : "bg-[#DDD5C9]"
                }`}
              />
              <span className={currentStep === 2 ? (isDark ? "text-[#FAF7F2]" : "text-[#171412]") : (isDark ? "text-[#4A423A]" : "text-[#B8AEA2]")}>
                {currentStep === 2 ? "●" : "○"}
              </span>
            </div>

            <div className="flex items-center gap-8 md:gap-14 text-xs font-medium">
              <span
                className={`transition-colors ${
                  currentStep === 1
                    ? isDark
                      ? "text-[#FAF7F2] font-semibold"
                      : "text-[#171412] font-semibold"
                    : isDark
                    ? "text-[#6E6760]"
                    : "text-[#968E85]"
                }`}
              >
                Personal Information
              </span>
              <span
                className={`transition-colors ${
                  currentStep === 2
                    ? isDark
                      ? "text-[#FAF7F2] font-semibold"
                      : "text-[#171412] font-semibold"
                    : isDark
                    ? "text-[#6E6760]"
                    : "text-[#968E85]"
                }`}
              >
                Investment Profile
              </span>
            </div>
          </div>

          {/* STEP 1: PERSONAL INFORMATION */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
              {/* Left Column: Heading, Supporting Text & System Context */}
              <div className="lg:col-span-6 space-y-4">
                <div className="space-y-3">
                  <h1
                    className={`text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight ${
                      isDark ? "text-[#FAF7F2]" : "text-[#171412]"
                    }`}
                  >
                    Let&apos;s set up your profile.
                  </h1>
                  <p
                    className={`text-sm md:text-base leading-relaxed ${
                      isDark ? "text-[#9E978F]" : "text-[#6B635B]"
                    }`}
                  >
                    A few details will help us personalize your Wealthzy experience.
                  </p>
                </div>

                {/* Bloomberg-terminal-inspired Context Status Block */}
                <div
                  className={`mt-6 p-4 rounded border text-xs font-mono space-y-2 ${
                    isDark
                      ? "bg-[#151210] border-[#27221E] text-[#9E978F]"
                      : "bg-[#FFFFFF] border-[#E5DFD7] text-[#6B635B]"
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-2 border-inherit">
                    <span className="text-[11px] uppercase tracking-wider">SECURE IDENTITY PROTOCOL</span>
                    <span className="text-[#4E9F76] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4E9F76] inline-block" />
                      ENCRYPTED
                    </span>
                  </div>
                  <div className="pt-1 space-y-1 text-[11px] leading-tight">
                    <div className="flex justify-between">
                      <span className={isDark ? "text-[#6E6760]" : "text-[#968E85]"}>Account:</span>
                      <span className={isDark ? "text-[#FAF7F2]" : "text-[#171412]"}>{userName || "Verified User"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? "text-[#6E6760]" : "text-[#968E85]"}>Personalization Pipeline:</span>
                      <span className={isDark ? "text-[#FAF7F2]" : "text-[#171412]"}>Phase 1 of 2</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Clean Centered Form */}
              <div className="lg:col-span-6">
                <div
                  className={`p-6 md:p-8 rounded border transition-colors ${
                    isDark
                      ? "bg-[#151210] border-[#27221E]"
                      : "bg-[#FFFFFF] border-[#E5DFD7]"
                  }`}
                >
                  <form onSubmit={handleStep1Submit} className="space-y-5">
                    {/* Field 1: Mobile Number */}
                    <div>
                      <label
                        htmlFor="mobileNumber"
                        className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                          isDark ? "text-[#9E978F]" : "text-[#6B635B]"
                        }`}
                      >
                        Mobile Number
                      </label>
                      <div className="flex gap-2">
                        {/* Country Code Selector */}
                        <div className="relative">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            aria-label="Country Code"
                            className={`h-11 px-3 pr-7 rounded border text-sm font-mono appearance-none outline-none cursor-pointer transition-colors ${
                              isDark
                                ? "bg-[#181513] border-[#2A2420] text-[#FAF7F2] focus:border-[#4A88D9]"
                                : "bg-[#FAF7F2] border-[#DDD5C9] text-[#171412] focus:border-[#2E68B8]"
                            }`}
                          >
                            {COUNTRY_CODES.map((item, idx) => (
                              <option key={`${item.code}-${item.flag}-${idx}`} value={item.code} className="bg-inherit">
                                {item.flag} {item.code}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg
                              className={`w-3.5 h-3.5 ${isDark ? "text-[#6E6760]" : "text-[#968E85]"}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {/* Mobile Number Input */}
                        <div className="flex-1">
                          <input
                            id="mobileNumber"
                            type="tel"
                            value={mobileNumber}
                            onChange={handlePhoneChange}
                            placeholder="+91 98765 43210"
                            className={`w-full h-11 px-3.5 rounded border text-sm font-mono outline-none transition-colors ${
                              phoneError
                                ? "border-[#D9534F]"
                                : isDark
                                ? "bg-[#181513] border-[#2A2420] text-[#FAF7F2] focus:border-[#4A88D9] placeholder-[#6E6760]"
                                : "bg-[#FAF7F2] border-[#DDD5C9] text-[#171412] focus:border-[#2E68B8] placeholder-[#968E85]"
                            }`}
                          />
                        </div>
                      </div>
                      {phoneError && (
                        <p className="text-xs text-[#D9534F] mt-1.5 font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
                          </svg>
                          <span>{phoneError}</span>
                        </p>
                      )}
                    </div>

                    {/* Field 2: Date of Birth */}
                    <div>
                      <label
                        htmlFor="dateOfBirth"
                        className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                          isDark ? "text-[#9E978F]" : "text-[#6B635B]"
                        }`}
                      >
                        Date of Birth
                      </label>
                      <input
                        id="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        onChange={handleDobChange}
                        max={new Date().toISOString().split("T")[0]}
                        className={`w-full h-11 px-3.5 rounded border text-sm font-mono outline-none transition-colors ${
                          dobError
                            ? "border-[#D9534F]"
                            : isDark
                            ? "bg-[#181513] border-[#2A2420] text-[#FAF7F2] focus:border-[#4A88D9] placeholder-[#6E6760] [color-scheme:dark]"
                            : "bg-[#FAF7F2] border-[#DDD5C9] text-[#171412] focus:border-[#2E68B8] placeholder-[#968E85] [color-scheme:light]"
                        }`}
                      />
                      {dobError && (
                        <p className="text-xs text-[#D9534F] mt-1.5 font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
                          </svg>
                          <span>{dobError}</span>
                        </p>
                      )}
                    </div>

                    {/* Subtle Privacy Text */}
                    <div
                      className={`pt-2 flex items-start gap-2.5 text-xs ${
                        isDark ? "text-[#6E6760]" : "text-[#968E85]"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 text-[#4E9F76] shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <p className="leading-normal">
                        Your information is securely stored and used only to personalize your Wealthzy experience.
                      </p>
                    </div>

                    {/* Primary Action Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className={`w-full h-11 px-6 rounded font-semibold text-sm tracking-wide transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                          isDark
                            ? "bg-[#FAF7F2] text-[#0F0D0C] hover:bg-[#E6E1D8] active:bg-[#D4CEBF]"
                            : "bg-[#171412] text-[#FAF7F2] hover:bg-[#2A2420] active:bg-[#3D352F]"
                        }`}
                      >
                        <span>Continue</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PORTFOLIO STATUS */}
          {currentStep === 2 && (
            <div className="space-y-8 md:space-y-10">
              {/* Header Titles */}
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <h1
                  className={`text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight ${
                    isDark ? "text-[#FAF7F2]" : "text-[#171412]"
                  }`}
                >
                  Where are you starting from?
                </h1>
                <p
                  className={`text-sm md:text-base leading-relaxed ${
                    isDark ? "text-[#9E978F]" : "text-[#6B635B]"
                  }`}
                >
                  Tell us about your current investment situation so Wealthzy can personalize your experience.
                </p>
              </div>

              {/* Two Selectable Options: Side by Side on Desktop, Stacked on Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
                {/* OPTION 1: Existing Portfolio */}
                <div
                  onClick={() => setPortfolioStatus("existing")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setPortfolioStatus("existing");
                    }
                  }}
                  className={`p-6 md:p-8 rounded border transition-colors duration-150 cursor-pointer flex flex-col justify-between text-left relative outline-none ${
                    portfolioStatus === "existing"
                      ? isDark
                        ? "bg-[#181513] border-[#4A88D9]"
                        : "bg-[#FFFFFF] border-[#2E68B8]"
                      : isDark
                      ? "bg-[#151210] border-[#27221E] hover:border-[#38302A] hover:bg-[#181513]"
                      : "bg-[#FFFFFF] border-[#E5DFD7] hover:border-[#C8BFB2] hover:bg-[#FAF7F2]"
                  }`}
                >
                  {/* Selected Indicator Badge */}
                  <div className="flex items-start justify-between mb-6">
                    {/* Minimal Portfolio/Chart Icon */}
                    <div
                      className={`w-10 h-10 rounded border flex items-center justify-center ${
                        portfolioStatus === "existing"
                          ? isDark
                            ? "bg-[#1C1815] border-[#4A88D9] text-[#4A88D9]"
                            : "bg-[#F0F5FD] border-[#2E68B8] text-[#2E68B8]"
                          : isDark
                          ? "bg-[#181513] border-[#2A2420] text-[#9E978F]"
                          : "bg-[#FAF7F2] border-[#DDD5C9] text-[#6B635B]"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                    </div>

                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        portfolioStatus === "existing"
                          ? isDark
                            ? "bg-[#4A88D9] border-[#4A88D9] text-[#0F0D0C]"
                            : "bg-[#2E68B8] border-[#2E68B8] text-[#FFFFFF]"
                          : isDark
                          ? "border-[#38302A] bg-transparent"
                          : "border-[#DDD5C9] bg-transparent"
                      }`}
                    >
                      {portfolioStatus === "existing" && (
                        <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Option Copy */}
                  <div className="space-y-2">
                    <h2
                      className={`text-base md:text-lg font-bold ${
                        isDark ? "text-[#FAF7F2]" : "text-[#171412]"
                      }`}
                    >
                      I already have a portfolio
                    </h2>
                    <p
                      className={`text-xs md:text-sm leading-relaxed ${
                        isDark ? "text-[#9E978F]" : "text-[#6B635B]"
                      }`}
                    >
                      Analyze my existing investments, diversification, risk and portfolio structure.
                    </p>
                  </div>
                </div>

                {/* OPTION 2: New to Investing */}
                <div
                  onClick={() => setPortfolioStatus("new")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setPortfolioStatus("new");
                    }
                  }}
                  className={`p-6 md:p-8 rounded border transition-colors duration-150 cursor-pointer flex flex-col justify-between text-left relative outline-none ${
                    portfolioStatus === "new"
                      ? isDark
                        ? "bg-[#181513] border-[#4A88D9]"
                        : "bg-[#FFFFFF] border-[#2E68B8]"
                      : isDark
                      ? "bg-[#151210] border-[#27221E] hover:border-[#38302A] hover:bg-[#181513]"
                      : "bg-[#FFFFFF] border-[#E5DFD7] hover:border-[#C8BFB2] hover:bg-[#FAF7F2]"
                  }`}
                >
                  {/* Selected Indicator Badge */}
                  <div className="flex items-start justify-between mb-6">
                    {/* Minimal Target/Compass Icon */}
                    <div
                      className={`w-10 h-10 rounded border flex items-center justify-center ${
                        portfolioStatus === "new"
                          ? isDark
                            ? "bg-[#1C1815] border-[#4A88D9] text-[#4A88D9]"
                            : "bg-[#F0F5FD] border-[#2E68B8] text-[#2E68B8]"
                          : isDark
                          ? "bg-[#181513] border-[#2A2420] text-[#9E978F]"
                          : "bg-[#FAF7F2] border-[#DDD5C9] text-[#6B635B]"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                      </svg>
                    </div>

                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        portfolioStatus === "new"
                          ? isDark
                            ? "bg-[#4A88D9] border-[#4A88D9] text-[#0F0D0C]"
                            : "bg-[#2E68B8] border-[#2E68B8] text-[#FFFFFF]"
                          : isDark
                          ? "border-[#38302A] bg-transparent"
                          : "border-[#DDD5C9] bg-transparent"
                      }`}
                    >
                      {portfolioStatus === "new" && (
                        <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Option Copy */}
                  <div className="space-y-2">
                    <h2
                      className={`text-base md:text-lg font-bold ${
                        isDark ? "text-[#FAF7F2]" : "text-[#171412]"
                      }`}
                    >
                      I don&apos;t have a portfolio
                    </h2>
                    <p
                      className={`text-xs md:text-sm leading-relaxed ${
                        isDark ? "text-[#9E978F]" : "text-[#6B635B]"
                      }`}
                    >
                      Help me understand my goals, risk profile and how I can start investing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Back & Continue */}
              <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`w-full sm:w-auto h-11 px-5 rounded border text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    isDark
                      ? "bg-transparent border-[#2A2420] text-[#9E978F] hover:text-[#FAF7F2] hover:border-[#38302A]"
                      : "bg-transparent border-[#DDD5C9] text-[#6B635B] hover:text-[#171412] hover:border-[#C8BFB2]"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={!portfolioStatus || isSubmitting}
                  onClick={handleFinalSubmit}
                  className={`w-full sm:w-auto min-w-[200px] h-11 px-8 rounded font-semibold text-sm tracking-wide transition-colors duration-150 flex items-center justify-center gap-2 ${
                    !portfolioStatus || isSubmitting
                      ? isDark
                        ? "bg-[#201C19] text-[#4A423A] border border-[#27221E] cursor-not-allowed"
                        : "bg-[#EBE4DA] text-[#B8AEA2] border border-[#DDD5C9] cursor-not-allowed"
                      : isDark
                      ? "bg-[#FAF7F2] text-[#0F0D0C] hover:bg-[#E6E1D8] active:bg-[#D4CEBF] cursor-pointer"
                      : "bg-[#171412] text-[#FAF7F2] hover:bg-[#2A2420] active:bg-[#3D352F] cursor-pointer"
                  }`}
                >
                  <span>{isSubmitting ? "Personalizing..." : "Continue"}</span>
                  {!isSubmitting && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>
              </div>

              {submitError && (
                <div className="max-w-4xl mx-auto text-center text-xs text-[#D9534F] font-medium">
                  {submitError}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`w-full border-t py-4 text-center text-xs font-mono transition-colors duration-200 ${
          isDark ? "border-[#201C19] text-[#6E6760] bg-[#0F0D0C]" : "border-[#EBE4DA] text-[#968E85] bg-[#FAF7F2]"
        }`}
      >
        <div className="max-w-[1140px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} WEALTHZY FINANCIAL TECHNOLOGIES. ALL RIGHTS RESERVED.</span>
          <span className="text-[11px] tracking-wider uppercase">
            INSTITUTIONAL GRADE WEALTH INTELLIGENCE
          </span>
        </div>
      </footer>
    </div>
  );
}

"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Card reference for 3D tilt effect matching Login page
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    // Persist user profile for downstream personalization (Dashboard, Onboarding, Goal trackers)
    try {
      localStorage.setItem("wealthzy_userName", fullName.trim());
      localStorage.setItem("wealthzy_userEmail", email.trim());
      localStorage.setItem(
        "wealthzy_user",
        JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          registeredAt: new Date().toISOString(),
        })
      );
    } catch {
      // Ignore localStorage errors in private modes
    }

    // Smooth navigation to onboarding or dashboard
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 400);
  };

  // Mouse-based 3D tilt effect for desktop views
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateX = (-mouseY / (rect.height / 2)) * 4;
    const rotateY = (mouseX / (rect.width / 2)) * 4;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  };

  // Reset 3D tilt when mouse leaves card
  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (card) {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    }
  };

  return (
    <div className="bg-[#12100E] min-h-screen text-[#FFFEE5] flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Header Section */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-20">
        {/* Wealthzy Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-[#201C18] border border-[#3B332B] flex items-center justify-center shadow-sm group-hover:border-[#F88D50] transition-colors duration-200">
            <svg
              className="w-5 h-5 text-[#F88D50] group-hover:scale-105 transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 6l4.5 12L12 9l4.5 9L21 6"
              />
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#FFFEE5]">
            Wealth<span className="text-[#F88D50]">zy</span>
          </span>
        </Link>

        {/* Back to Home Link */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-[#C7BDB3] hover:text-[#FFFEE5] transition-colors duration-200 bg-[#201C18] border border-[#3B332B] hover:border-[#F88D50]/50 px-4 py-2 rounded-full"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10 my-auto">
        {/* Solid Register Card (Continuation of Login Style) */}
        <section
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full max-w-md rounded-2xl p-7 md:p-9 shadow-xl relative bg-[#181512] border border-[#3B332B] transition-transform duration-150 ease-out"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Top Badge & Titles */}
          <div className="text-center mb-6">
            <span className="inline-block text-[11px] font-extrabold tracking-widest text-[#F88D50] uppercase bg-[#201C18] border border-[#3B332B] px-3.5 py-1 rounded-full mb-3">
              GET STARTED
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#FFFEE5] tracking-tight">
              Create Your Account
            </h1>
            <p className="text-xs md:text-sm text-[#C7BDB3] mt-1.5 font-normal">
              Join 50,000+ investors tracking and growing wealth
            </p>
          </div>

          {/* Social Authentication */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            type="button"
            className="w-full bg-[#201C18] hover:bg-[#28231E] text-[#FFFEE5] border border-[#3B332B] hover:border-[#F88D50]/50 rounded-xl py-3 px-4 flex items-center justify-center gap-3 font-medium transition-all duration-200 text-sm shadow-sm cursor-pointer group mb-5"
          >
            {/* Google Logo SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>Sign up with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center my-5 gap-3">
            <div className="h-px bg-[#3B332B] flex-1" />
            <span className="text-[11px] uppercase tracking-widest text-[#8C8176] font-semibold px-1">
              or with email
            </span>
            <div className="h-px bg-[#3B332B] flex-1" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-2.5 rounded-xl bg-[#F06E6E]/15 border border-[#F06E6E]/30 text-[#F06E6E] text-xs font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name Field */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold text-[#C7BDB3] uppercase tracking-wider mb-1.5"
              >
                Full Name
              </label>
              <div className="relative bg-[#201C18] border border-[#3B332B] focus-within:border-[#F88D50] rounded-xl flex items-center shadow-sm group transition-colors">
                <svg
                  className="w-5 h-5 text-[#8C8176] absolute left-3.5 pointer-events-none group-focus-within:text-[#F88D50] transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Vedant Patil"
                  className="w-full bg-transparent text-[#FFFEE5] placeholder-[#8C8176] text-sm py-3 pl-11 pr-4 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#C7BDB3] uppercase tracking-wider mb-1.5"
              >
                Email address
              </label>
              <div className="relative bg-[#201C18] border border-[#3B332B] focus-within:border-[#F88D50] rounded-xl flex items-center shadow-sm group transition-colors">
                <svg
                  className="w-5 h-5 text-[#8C8176] absolute left-3.5 pointer-events-none group-focus-within:text-[#F88D50] transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full bg-transparent text-[#FFFEE5] placeholder-[#8C8176] text-sm py-3 pl-11 pr-4 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#C7BDB3] uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative bg-[#201C18] border border-[#3B332B] focus-within:border-[#F88D50] rounded-xl flex items-center shadow-sm group transition-colors">
                <svg
                  className="w-5 h-5 text-[#8C8176] absolute left-3.5 pointer-events-none group-focus-within:text-[#F88D50] transition-colors"
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
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="w-full bg-transparent text-[#FFFEE5] placeholder-[#8C8176] text-sm py-3 pl-11 pr-11 rounded-xl outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 text-[#8C8176] hover:text-[#FFFEE5] transition-colors p-1 cursor-pointer focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-7-11-7a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 7 11 7a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-[#C7BDB3] uppercase tracking-wider mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative bg-[#201C18] border border-[#3B332B] focus-within:border-[#F88D50] rounded-xl flex items-center shadow-sm group transition-colors">
                <svg
                  className="w-5 h-5 text-[#8C8176] absolute left-3.5 pointer-events-none group-focus-within:text-[#F88D50] transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter your password"
                  className="w-full bg-transparent text-[#FFFEE5] placeholder-[#8C8176] text-sm py-3 pl-11 pr-11 rounded-xl outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 text-[#8C8176] hover:text-[#FFFEE5] transition-colors p-1 cursor-pointer focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-7-11-7a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 7 11 7a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Solid Coral Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#F88D50] hover:bg-[#E77B3C] disabled:opacity-75 py-3.5 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-sm tracking-wide shadow-md cursor-pointer transition-all duration-200 mt-4 group"
            >
              <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
              {!isLoading && (
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              )}
            </button>
          </form>

          {/* Switch to Login Footer */}
          <div className="text-center text-xs text-[#C7BDB3] mt-5 pt-4 border-t border-[#3B332B] font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#F88D50] hover:underline font-semibold ml-1"
            >
              Log in
            </Link>
          </div>

          {/* Security & Privacy Badge */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-[#8C8176] mt-4 tracking-wide font-medium text-center">
            <svg
              className="w-4 h-4 text-[#5AC58E]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>256-bit Bank-Grade Encryption &amp; Privacy Shield</span>
          </div>
        </section>
      </main>

      {/* Page Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-[#8C8176] relative z-20">
        <p>
          &copy; {new Date().getFullYear()} Wealthzy. All rights reserved. &bull;{" "}
          <Link href="#" className="hover:text-[#C7BDB3] transition-colors">
            Privacy Policy
          </Link>{" "}
          &bull;{" "}
          <Link href="#" className="hover:text-[#C7BDB3] transition-colors">
            Terms of Service
          </Link>
        </p>
      </footer>
    </div>
  );
}

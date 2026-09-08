"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

export default function LoginPage() {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Card reference for 3D tilt effect
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Authentication logic can be integrated here in the future
  };

  // Mouse-based 3D tilt effect for desktop views
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Disable effect on touch/mobile devices or small screens
    if (typeof window !== "undefined" && window.innerWidth < 768) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Calculate rotation with max ~5 degrees
    const rotateX = (-mouseY / (rect.height / 2)) * 5;
    const rotateY = (mouseX / (rect.width / 2)) * 5;

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
    <div className="bg-[#07090e] min-h-screen text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none selection:bg-blue-500 selection:text-white">
      {/* Subtle background ambient glowing orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-20">
        {/* Wealthzy Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
            <div className="w-full h-full bg-[#0b0f19] rounded-[11px] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                />
              </svg>
            </div>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Wealth<span className="text-blue-500">zy</span>
          </span>
        </Link>

        {/* Back to Home Link */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors duration-200 bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 px-4 py-2 rounded-full backdrop-blur-md"
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
        {/* Glassmorphism Login Card */}
        <section
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="glass-card animate-fade-in w-full max-w-md rounded-2xl p-7 md:p-9 shadow-2xl relative border border-slate-800/80 transition-transform duration-150 ease-out"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Top Badge & Titles */}
          <div className="text-center mb-7">
            <span className="inline-block text-[11px] font-extrabold tracking-widest text-blue-400 uppercase bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full mb-3 shadow-inner">
              WELCOME BACK
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Login to Wealthzy
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1.5 font-normal">
              Access your intelligent financial dashboard
            </p>
          </div>

          {/* Social Authentication */}
          <button
            type="button"
            className="w-full bg-slate-900/60 hover:bg-slate-800/90 text-slate-200 border border-slate-700/60 hover:border-slate-600 rounded-xl py-3 px-4 flex items-center justify-center gap-3 font-medium transition-all duration-200 text-sm shadow-sm cursor-pointer group mb-6"
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
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center my-6 gap-3">
            <div className="h-px bg-slate-800/80 flex-1" />
            <span className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold px-1">
              or
            </span>
            <div className="h-px bg-slate-800/80 flex-1" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
              >
                Email address
              </label>
              <div className="relative input-recessed rounded-xl flex items-center shadow-inner group">
                {/* Mail Icon SVG */}
                <svg
                  className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none group-focus-within:text-blue-400 transition-colors"
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
                  className="w-full bg-transparent text-white placeholder-slate-500 text-sm py-3.5 pl-11 pr-4 rounded-xl outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
                >
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative input-recessed rounded-xl flex items-center shadow-inner group">
                {/* Lock Icon SVG */}
                <svg
                  className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none group-focus-within:text-blue-400 transition-colors"
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
                  placeholder="••••••••"
                  className="w-full bg-transparent text-white placeholder-slate-500 text-sm py-3.5 pl-11 pr-11 rounded-xl outline-none focus:ring-0"
                />
                {/* Visibility Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer focus:outline-none"
                >
                  {showPassword ? (
                    /* Eye Off Icon SVG (visibility_off) */
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-7-11-7a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 7 11 7a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                      />
                    </svg>
                  ) : (
                    /* Eye Icon SVG (visibility) */
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Sapphire Blue Gradient Submit Button */}
            <button
              type="submit"
              className="sapphire-gradient-bg w-full py-3.5 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-sm tracking-wide shadow-lg cursor-pointer transition-all duration-300 mt-2 group"
            >
              <span>Sign In</span>
              {/* Arrow Icon SVG */}
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
            </button>
          </form>

          {/* Account Creation Footer */}
          <div className="text-center text-xs text-slate-400 mt-6 pt-4 border-t border-slate-800/60 font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="#"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors ml-1"
            >
              Create an account
            </Link>
          </div>

          {/* Security & Shield Badge */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 mt-5 tracking-wide font-medium text-center">
            {/* Shield Icon SVG */}
            <svg
              className="w-4 h-4 text-emerald-500/80"
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
            <span>256-bit Bank-Grade Encryption &amp; Secure Session</span>
          </div>
        </section>
      </main>

      {/* Page Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-500 relative z-20">
        <p>
          &copy; {new Date().getFullYear()} Wealthzy. All rights reserved. &bull;{" "}
          <Link href="#" className="hover:text-slate-400 transition-colors">
            Privacy Policy
          </Link>{" "}
          &bull;{" "}
          <Link href="#" className="hover:text-slate-400 transition-colors">
            Terms of Service
          </Link>
        </p>
      </footer>
    </div>
  );
}
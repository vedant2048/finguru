"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTheme } from "@/components/theme-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    try {
      localStorage.setItem("wealthzy_userName", fullName.trim());
      localStorage.setItem("wealthzy_userEmail", email.trim());
    } catch {
      // Ignore localStorage errors
    }

    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 400);
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

      {/* Main Registration Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div
          className={`w-full max-w-md rounded border p-7 sm:p-9 shadow-xl transition-colors ${
            isDark
              ? "bg-[#151210] border-[#27221E]"
              : "bg-[#FFFFFF] border-[#E5DFD7]"
          }`}
        >
          <div className="text-center mb-6 space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Create Your Account
            </h1>
            <p className={`text-xs ${isDark ? "text-[#9E978F]" : "text-[#6B635B]"}`}>
              Join investors tracking and growing wealth with clarity.
            </p>
          </div>

          {/* Google Sign-in */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            type="button"
            className={`w-full h-11 rounded border flex items-center justify-center gap-3 text-xs font-mono font-medium transition-colors cursor-pointer mb-5 ${
              isDark
                ? "bg-[#181513] border-[#2A2420] text-[#FAF7F2] hover:bg-[#201C19] hover:border-[#38302A]"
                : "bg-[#FAF7F2] border-[#DDD5C9] text-[#171412] hover:bg-[#ECE8E1]"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.35 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
            </svg>
            <span>Sign up with Google</span>
          </button>

          <div className="flex items-center my-5 gap-3">
            <div className={`h-px flex-1 ${isDark ? "bg-[#27221E]" : "bg-[#E5DFD7]"}`} />
            <span className={`text-[10px] uppercase font-mono tracking-widest ${isDark ? "text-[#6E6760]" : "text-[#968E85]"}`}>
              OR REGISTER WITH EMAIL
            </span>
            <div className={`h-px flex-1 ${isDark ? "bg-[#27221E]" : "bg-[#E5DFD7]"}`} />
          </div>

          {error && (
            <div className="mb-4 p-2.5 rounded border border-[#D9534F]/40 bg-[#2B1414] text-[#D9534F] text-xs font-mono">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-[#9E978F]" : "text-[#6B635B]"
                }`}
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Vedant Patil"
                className={`w-full h-11 px-3.5 rounded border text-sm font-mono outline-none transition-colors ${
                  isDark
                    ? "bg-[#181513] border-[#2A2420] text-[#FAF7F2] focus:border-[#3A7BD5] placeholder-[#6E6760]"
                    : "bg-[#FAF7F2] border-[#DDD5C9] text-[#171514] focus:border-[#2E68B8] placeholder-[#968E85]"
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-[#9E978F]" : "text-[#6B635B]"
                }`}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className={`w-full h-11 px-3.5 rounded border text-sm font-mono outline-none transition-colors ${
                  isDark
                    ? "bg-[#181513] border-[#2A2420] text-[#FAF7F2] focus:border-[#3A7BD5] placeholder-[#6E6760]"
                    : "bg-[#FAF7F2] border-[#DDD5C9] text-[#171514] focus:border-[#2E68B8] placeholder-[#968E85]"
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-[#9E978F]" : "text-[#6B635B]"
                }`}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className={`w-full h-11 px-3.5 rounded border text-sm font-mono outline-none transition-colors ${
                  isDark
                    ? "bg-[#181513] border-[#2A2420] text-[#FAF7F2] focus:border-[#3A7BD5] placeholder-[#6E6760]"
                    : "bg-[#FAF7F2] border-[#DDD5C9] text-[#171514] focus:border-[#2E68B8] placeholder-[#968E85]"
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-11 rounded font-semibold text-sm tracking-wide transition-colors mt-2 cursor-pointer ${
                isDark
                  ? "bg-[#FAF7F2] text-[#0F0D0C] hover:bg-[#E6E1D8]"
                  : "bg-[#171412] text-[#FAF7F2] hover:bg-[#2A2420]"
              }`}
            >
              {isLoading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="text-center text-xs mt-6 pt-4 border-t border-inherit">
            <span className={isDark ? "text-[#9E978F]" : "text-[#6B635B]"}>Already have an account?</span>{" "}
            <Link href="/login" className="text-[#3A7BD5] hover:underline font-semibold ml-1">
              Log in
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`w-full border-t py-4 text-center text-xs font-mono ${isDark ? "border-[#201C19] text-[#6E6760]" : "border-[#EBE4DA] text-[#968E85]"}`}>
        &copy; {new Date().getFullYear()} Wealthzy Financial Technologies.
      </footer>
    </div>
  );
}

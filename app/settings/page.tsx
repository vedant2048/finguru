"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { AppShell } from "@/components/layout/app-shell";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      localStorage.clear();
      await signOut({ callbackUrl: "/login" });
    } catch {
      router.push("/login");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto font-mono text-xs">
        {/* Header */}
        <div className="pb-2 border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8]">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-sans">
            Workspace Settings
          </h1>
          <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
            Manage appearance themes, security sessions, and real-time analytical notification parameters.
          </p>
        </div>

        {/* SECTION 1: APPEARANCE */}
        <div className="p-6 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-[#A9A39B] block">
              Appearance &amp; Theme
            </span>
            <p className="text-[11px] text-[#6F6A64] mt-0.5">
              Select your preferred financial research workspace theme.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setTheme("dark")}
              role="button"
              tabIndex={0}
              className={`p-4 rounded border transition-colors cursor-pointer flex items-center justify-between ${
                theme === "dark"
                  ? "border-[#3A7BD5] bg-[#181615]"
                  : "border-[#24201D] bg-[#151312] hover:border-[#38302A]"
              }`}
            >
              <div>
                <div className="font-bold text-[#FAF7F2]">Dark Terminal Mode</div>
                <div className="text-[11px] text-[#A9A39B]">Bloomberg terminal primary aesthetic (#0F0D0C)</div>
              </div>
              {theme === "dark" && <Badge variant="info">ACTIVE</Badge>}
            </div>

            <div
              onClick={() => setTheme("light")}
              role="button"
              tabIndex={0}
              className={`p-4 rounded border transition-colors cursor-pointer flex items-center justify-between ${
                theme === "light"
                  ? "border-[#2E68B8] bg-[#F4F1EC]"
                  : "border-[#E8E2D8] bg-[#FFFFFF] hover:border-[#C8BFB2]"
              }`}
            >
              <div>
                <div className="font-bold text-[#171514]">Light Research Workspace</div>
                <div className="text-[11px] text-[#6F6A64]">High-contrast institutional document style (#FAF7F2)</div>
              </div>
              {theme === "light" && <Badge variant="info">ACTIVE</Badge>}
            </div>
          </div>
        </div>

        {/* SECTION 2: NOTIFICATIONS */}
        <div className="p-6 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-[#A9A39B] block">
              Notification Channels
            </span>
            <p className="text-[11px] text-[#6F6A64] mt-0.5">
              Control the delivery of portfolio drift alerts and news sentiment updates.
            </p>
          </div>

          <div className="space-y-2.5">
            <label className="flex items-center justify-between p-3 rounded border border-[#2E2925] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] cursor-pointer">
              <div>
                <div className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">Email Digest &amp; Summaries</div>
                <div className="text-[11px] text-[#A9A39B]">Weekly portfolio health and risk review email</div>
              </div>
              <input type="checkbox" defaultChecked className="accent-[#3A7BD5]" />
            </label>

            <label className="flex items-center justify-between p-3 rounded border border-[#2E2925] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] cursor-pointer">
              <div>
                <div className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">Market Volatility Alerts</div>
                <div className="text-[11px] text-[#A9A39B]">Immediate alerts when NIFTY moves &gt; 2%</div>
              </div>
              <input type="checkbox" defaultChecked className="accent-[#3A7BD5]" />
            </label>

            <label className="flex items-center justify-between p-3 rounded border border-[#2E2925] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] cursor-pointer">
              <div>
                <div className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">Portfolio Concentration Drift</div>
                <div className="text-[11px] text-[#A9A39B]">Alert when any single sector exceeds 30% weighting</div>
              </div>
              <input type="checkbox" defaultChecked className="accent-[#3A7BD5]" />
            </label>
          </div>
        </div>

        {/* SECTION 3: SECURITY & SESSIONS */}
        <div className="p-6 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-[#A9A39B] block">
              Security &amp; Authentication
            </span>
            <p className="text-[11px] text-[#6F6A64] mt-0.5">
              Active sessions and encrypted credentials management.
            </p>
          </div>

          <div className="p-3 rounded border border-[#2E2925] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] flex items-center justify-between">
            <div>
              <div className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">Google OAuth 2.0 Provider</div>
              <div className="text-[11px] text-[#4E9F76]">Connected &bull; Encrypted Token Protocol</div>
            </div>
            <Badge variant="positive">AUTHENTICATED</Badge>
          </div>

          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded border border-[#D9534F]/40 bg-[#2B1414] text-[#D9534F] hover:bg-[#D9534F] hover:text-white transition-colors cursor-pointer font-semibold"
            >
              Sign Out of Session
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

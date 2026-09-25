"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

interface AlertItem {
  id: string;
  time: string;
  type: "Market Alert" | "Portfolio Alert" | "Stock Alert" | "News Alert";
  variant: BadgeVariant;
  message: string;
  detail: string;
  isRead: boolean;
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "a1",
    time: "Today, 09:45 AM",
    type: "Market Alert",
    variant: "info",
    message: "NIFTY 50 moved more than 3% above monthly baseline.",
    detail: "Intraday buying pressure in banking and technology driving benchmark up +104.30 pts.",
    isRead: false,
  },
  {
    id: "a2",
    time: "Today, 08:30 AM",
    type: "Stock Alert",
    variant: "positive",
    message: "RELIANCE crossed your selected price level of ₹2,920.00.",
    detail: "Current trading price: ₹2,940.50 (+1.07%). Relative P/E remains at 24.5x.",
    isRead: false,
  },
  {
    id: "a3",
    time: "Yesterday, 04:15 PM",
    type: "Portfolio Alert",
    variant: "warning",
    message: "Portfolio allocation to IT exceeded your selected threshold of 30%.",
    detail: "Current IT allocation stands at 32.6% due to recent rally in TCS and INFY.",
    isRead: true,
  },
  {
    id: "a4",
    time: "2 days ago",
    type: "News Alert",
    variant: "neutral",
    message: "FinBERT detected positive enterprise growth signals for TCS Ltd.",
    detail: "Large institutional multi-year deal announced in European market.",
    isRead: true,
  },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [filterType, setFilterType] = useState<string>("all");
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const toggleReadStatus = (id: string) => {
    setAlerts(
      alerts.map((a) => (a.id === id ? { ...a, isRead: !a.isRead } : a))
    );
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, isRead: true })));
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === "all") return true;
    if (filterType === "unread") return !a.isRead;
    return a.type.toLowerCase().includes(filterType.toLowerCase());
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8]">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Alerts Center
            </h1>
            <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
              Real-time notifications across market indices, portfolio drifts, price triggers, and sentiment shifts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 rounded border text-xs font-mono font-medium transition-colors bg-[#151312] border-[#2E2925] text-[#A9A39B] hover:text-[#FAF7F2] dark:bg-[#151312] dark:border-[#2E2925] dark:text-[#A9A39B] light:bg-[#FFFFFF] light:border-[#DDD5C9] light:text-[#6F6A64]"
            >
              Mark all read
            </button>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors bg-[#FAF7F2] text-[#0F0D0C] hover:bg-[#E6E1D8] dark:bg-[#FAF7F2] dark:text-[#0F0D0C] light:bg-[#171514] light:text-[#FAF7F2]"
            >
              Configure Alerts
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-xs">
          {[
            { id: "all", label: "All Alerts" },
            { id: "unread", label: "Unread" },
            { id: "market", label: "Market" },
            { id: "portfolio", label: "Portfolio" },
            { id: "stock", label: "Stock" },
            { id: "news", label: "News Sentiment" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                filterType === tab.id
                  ? "bg-[#211F1D] text-[#FAF7F2] border border-[#2E2925] dark:bg-[#211F1D] dark:text-[#FAF7F2] light:bg-[#ECE8E1] light:text-[#171514]"
                  : "text-[#A9A39B] hover:text-[#FAF7F2] dark:text-[#A9A39B] dark:hover:text-[#FAF7F2] light:text-[#6F6A64] light:hover:text-[#171514]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Alerts Stream List */}
        <div className="p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-[#A9A39B] space-y-2">
              <svg className="w-6 h-6 mx-auto text-[#6F6A64]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div className="font-bold text-sm text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                You&apos;re all caught up.
              </div>
              <p>No active unread notifications in this category.</p>
            </div>
          ) : (
            filteredAlerts.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded border transition-colors font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !item.isRead
                    ? "bg-[#181615] border-[#3A7BD5]/40 dark:bg-[#181615] dark:border-[#3A7BD5]/40 light:bg-[#FAF7F2] light:border-[#2E68B8]/40"
                    : "bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8]"
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-[11px]">
                    <Badge variant={item.variant}>{item.type}</Badge>
                    <span className="text-[#A9A39B]">{item.time}</span>
                    {!item.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3A7BD5] inline-block" />
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                    {item.message}
                  </h3>
                  <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
                    {item.detail}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleReadStatus(item.id)}
                    className="text-[11px] text-[#3A7BD5] hover:underline"
                  >
                    {item.isRead ? "Mark Unread" : "Mark Read"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Configuration Modal */}
        <Modal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          title="Configure Financial Alerts"
          subtitle="Set quantitative triggers for market, price, and portfolio drift notifications."
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded border border-[#2E2925] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] cursor-pointer">
                <span>Market Index Movement (&gt; 2% daily)</span>
                <input type="checkbox" defaultChecked className="accent-[#3A7BD5]" />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded border border-[#2E2925] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] cursor-pointer">
                <span>Sector Drift Alert (Threshold &gt; 30%)</span>
                <input type="checkbox" defaultChecked className="accent-[#3A7BD5]" />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded border border-[#2E2925] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] cursor-pointer">
                <span>FinBERT News Sentiment Shift Alerts</span>
                <input type="checkbox" defaultChecked className="accent-[#3A7BD5]" />
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsConfigOpen(false)}
                className="px-4 py-2 rounded font-semibold bg-[#FAF7F2] text-[#0F0D0C] hover:bg-[#E6E1D8] dark:bg-[#FAF7F2] dark:text-[#0F0D0C] light:bg-[#171514] light:text-[#FAF7F2]"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}

"use client";

import React, { useState, useEffect } from "react";
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
    message: "NIFTY 50 active session trajectory update.",
    detail: "Current trading level: 23,053.10 (+116.35 pts, +0.51%). Session volume tracking active.",
    isRead: false,
  },
  {
    id: "a2",
    time: "Today, 08:30 AM",
    type: "Stock Alert",
    variant: "positive",
    message: "RELIANCE active price monitoring level.",
    detail: "Current trading price: ₹1,164.90 (-0.21%). Relative P/E: 21.1x.",
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
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveAlertData() {
      try {
        const res = await fetch("/api/market/overview");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success) {
          setIsLive(true);
          const nifty = (data.indices || []).find((i: any) => i.symbol === "NIFTY 50");
          const reliance = [...(data.gainers || []), ...(data.losers || []), ...(data.mostActive || [])].find(
            (s: any) => s.ticker === "RELIANCE"
          );
          const topGainer = (data.gainers || [])[0];

          setAlerts((prev) =>
            prev.map((alert) => {
              if (alert.id === "a1" && nifty) {
                return {
                  ...alert,
                  message: `NIFTY 50 trading at ${nifty.price} (${nifty.percent}).`,
                  detail: `Benchmark changed ${nifty.change} pts with ${nifty.positive ? "buying" : "selling"} momentum. Exchange: ${nifty.volume}.`,
                  variant: nifty.positive ? "positive" : "warning",
                };
              }
              if (alert.id === "a2" && reliance) {
                return {
                  ...alert,
                  message: `RELIANCE live trading price at ${reliance.price}.`,
                  detail: `Day movement: ${reliance.change} (${reliance.percent}). Volume: ${reliance.volume}, Turnover: ${reliance.turnover}.`,
                  variant: reliance.positive ? "positive" : "neutral",
                };
              }
              return alert;
            })
          );

          if (topGainer && topGainer.ticker !== "RELIANCE") {
            setAlerts((prev) => {
              if (prev.some((a) => a.id === `gainer-${topGainer.ticker}`)) return prev;
              const newAlert: AlertItem = {
                id: `gainer-${topGainer.ticker}`,
                time: "Live Feed",
                type: "Stock Alert",
                variant: "positive",
                message: `${topGainer.ticker} leading market gainers (${topGainer.percent}).`,
                detail: `Trading at ${topGainer.price} (${topGainer.change}). P/E ratio: ${topGainer.pe || "—"}, Volume: ${topGainer.volume}.`,
                isRead: false,
              };
              return [newAlert, ...prev];
            });
          }
        }
      } catch {
        // Fallback to initial
      }
    }

    loadLiveAlertData();
  }, []);

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
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Alerts Center
              </h1>
              {isLive && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#4E9F76]/15 text-[#4E9F76] border border-[#4E9F76]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4E9F76] animate-pulse" />
                  LIVE MONITORING
                </span>
              )}
            </div>
            <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
              Real-time notifications across market indices, portfolio drifts, price triggers, and sentiment shifts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 rounded border text-xs font-mono font-medium transition-colors bg-[#151312] border-[#2E2925] text-[#A9A39B] hover:text-[#FAF7F2] dark:bg-[#151312] dark:border-[#2E2925] dark:text-[#A9A39B] light:bg-[#FFFFFF] light:border-[#DDD5C9] light:text-[#6F6A64] cursor-pointer"
            >
              Mark all read
            </button>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors bg-[#FAF7F2] text-[#0F0D0C] hover:bg-[#E6E1D8] dark:bg-[#FAF7F2] dark:text-[#0F0D0C] light:bg-[#171514] light:text-[#FAF7F2] cursor-pointer"
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

        {/* Alerts List */}
        <div className="p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8]">
          {filteredAlerts.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#A9A39B]">
              No alerts match the selected filter.
            </div>
          ) : (
            <div className="divide-y divide-[#24201D]/40 dark:divide-[#24201D]/40 light:divide-[#E8E2D8]">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 font-mono text-xs transition-colors ${
                    !alert.isRead
                      ? "bg-transparent font-medium"
                      : "opacity-75"
                  }`}
                >
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.variant}>{alert.type}</Badge>
                      <span className="text-[11px] text-[#A9A39B]">
                        {alert.time}
                      </span>
                      {!alert.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3A7BD5]" />
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514] pt-0.5">
                      {alert.message}
                    </h3>

                    <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
                      {alert.detail}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 pt-1 sm:pt-0">
                    <button
                      onClick={() => toggleReadStatus(alert.id)}
                      className="px-2.5 py-1 rounded border border-[#2E2925] text-[11px] text-[#A9A39B] hover:text-[#FAF7F2] hover:border-[#3A7BD5] transition-colors cursor-pointer"
                    >
                      {alert.isRead ? "Mark Unread" : "Mark Read"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Configuration Modal */}
        <Modal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          title="Configure Alert Thresholds"
          subtitle="Adjust sensitivity for real-time market signals and portfolio rebalancing triggers."
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-[#A9A39B] block font-semibold">
                Single Stock Price Movement Trigger (%)
              </label>
              <input
                type="number"
                defaultValue={3.0}
                className="w-full h-9 px-3 rounded border bg-[#181615] border-[#2E2925] text-[#FAF7F2] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#A9A39B] block font-semibold">
                Sector Allocation Drift Limit (%)
              </label>
              <input
                type="number"
                defaultValue={30}
                className="w-full h-9 px-3 rounded border bg-[#181615] border-[#2E2925] text-[#FAF7F2] outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsConfigOpen(false)}
                className="px-3 py-1.5 rounded border border-[#2E2925] text-[#A9A39B] hover:text-[#FAF7F2]"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="px-3 py-1.5 rounded bg-[#FAF7F2] text-[#0F0D0C] font-semibold"
              >
                Save Triggers
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}

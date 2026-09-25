"use client";

import React, { useMemo, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { useTheme } from "@/components/theme-provider";
import type { PerformanceHistory, PortfolioHolding, SectorAllocation } from "@/lib/portfolio/types";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

/** Solid categorical colours from the Wealthzy palette. No gradients. */
const CATEGORICAL = ["#3A7BD5", "#4E9F76", "#D9822B", "#9C6ADE", "#C25B7A", "#3FA7A3", "#B8A04A", "#8E8880"];
const MAX_SLICES = CATEGORICAL.length;

export const formatINR = (n: number, digits = 0) =>
  `${n < 0 ? "-" : ""}₹${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: digits })}`;

const compactINR = (n: number) => {
  const a = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (a >= 1e7) return `${sign}₹${(a / 1e7).toFixed(1)}Cr`;
  if (a >= 1e5) return `${sign}₹${(a / 1e5).toFixed(1)}L`;
  if (a >= 1e3) return `${sign}₹${(a / 1e3).toFixed(1)}K`;
  return `${sign}₹${a.toFixed(0)}`;
};

function usePalette() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  return {
    dark,
    text: dark ? "#A9A39B" : "#6F6A64",
    strong: dark ? "#FAF7F2" : "#171514",
    grid: dark ? "rgba(250,247,242,0.06)" : "rgba(23,21,20,0.07)",
    surface: dark ? "#151312" : "#FFFFFF",
    positive: dark ? "#4E9F76" : "#2E8555",
    negative: dark ? "#D9534F" : "#C0392B",
    accent: dark ? "#3A7BD5" : "#2E68B8",
    neutral: dark ? "#6F6A64" : "#9E978F",
    tooltipBg: dark ? "#211F1D" : "#FFFFFF",
    tooltipBorder: dark ? "#3D3732" : "#DDD5C9",
  };
}

type Palette = ReturnType<typeof usePalette>;

function baseOptions(p: Palette) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 250 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: p.tooltipBg,
        borderColor: p.tooltipBorder,
        borderWidth: 1,
        titleColor: p.strong,
        bodyColor: p.text,
        titleFont: { family: "ui-monospace, monospace", size: 11 },
        bodyFont: { family: "ui-monospace, monospace", size: 11 },
        padding: 8,
        cornerRadius: 2,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
      },
    },
  } as const;
}

const tick = (p: Palette) => ({ color: p.text, font: { family: "ui-monospace, monospace", size: 10 } });

/** Groups the tail into "Other" so the doughnut stays readable. */
function topSlices<T>(items: T[], label: (t: T) => string, value: (t: T) => number) {
  const sorted = [...items].sort((a, b) => value(b) - value(a));
  if (sorted.length <= MAX_SLICES) return sorted.map((t) => ({ label: label(t), value: value(t) }));
  const head = sorted.slice(0, MAX_SLICES - 1).map((t) => ({ label: label(t), value: value(t) }));
  const rest = sorted.slice(MAX_SLICES - 1).reduce((s, t) => s + value(t), 0);
  return [...head, { label: `Other (${sorted.length - MAX_SLICES + 1})`, value: rest }];
}

export function ChartLegend({ items }: { items: { label: string; value: string; color: string }[] }) {
  const p = usePalette();
  return (
    <ul className="space-y-1.5 text-xs font-mono">
      {items.map((i) => (
        <li key={i.label} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: i.color }} />
            <span className="truncate" style={{ color: p.strong }}>{i.label}</span>
          </span>
          <span className="shrink-0" style={{ color: p.text }}>{i.value}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── 1. Portfolio value: invested vs current ──────────────────────────────
export function PortfolioValueChart({ invested, current }: { invested: number; current: number }) {
  const p = usePalette();
  const data = {
    labels: ["Invested Value", "Current Value"],
    datasets: [
      {
        label: "Portfolio Value",
        data: [invested, current],
        backgroundColor: [p.neutral, current >= invested ? p.positive : p.negative],
        borderRadius: 2,
        maxBarThickness: 64,
      },
    ],
  };
  const options: ChartOptions<"bar"> = {
    ...baseOptions(p),
    plugins: {
      ...baseOptions(p).plugins,
      tooltip: { ...baseOptions(p).plugins.tooltip, callbacks: { label: (ctx) => ` ${formatINR(ctx.parsed.y ?? 0)}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: tick(p), border: { color: p.grid } },
      y: { beginAtZero: true, grid: { color: p.grid }, ticks: { ...tick(p), callback: (v) => compactINR(Number(v)) }, border: { display: false } },
    },
  };
  return (
    <div className="h-[220px]">
      <Bar data={data} options={options} aria-label="Invested value versus current value" role="img" />
    </div>
  );
}

// ─── 2. Holding allocation doughnut ──────────────────────────────────────
export function AllocationDoughnut({ holdings, total }: { holdings: PortfolioHolding[]; total: number }) {
  const p = usePalette();
  const slices = topSlices(holdings, (h) => h.company, (h) => h.currentValue);
  const data = {
    labels: slices.map((s) => s.label),
    datasets: [
      {
        label: "Portfolio Allocation",
        data: slices.map((s) => s.value),
        backgroundColor: slices.map((_, i) => CATEGORICAL[i]),
        borderColor: p.surface,
        borderWidth: 2,
      },
    ],
  };
  const options: ChartOptions<"doughnut"> = {
    ...baseOptions(p),
    cutout: "68%",
    plugins: {
      ...baseOptions(p).plugins,
      tooltip: {
        ...baseOptions(p).plugins.tooltip,
        callbacks: {
          label: (ctx) => ` ${formatINR(ctx.parsed)} (${((ctx.parsed / total) * 100).toFixed(1)}%)`,
        },
      },
    },
  };
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="h-[180px] w-[180px] shrink-0">
        <Doughnut data={data} options={options} aria-label="Portfolio allocation by holding" role="img" />
      </div>
      <div className="flex-1 w-full">
        <ChartLegend
          items={slices.map((s, i) => ({
            label: s.label,
            value: `${((s.value / total) * 100).toFixed(1)}%`,
            color: CATEGORICAL[i],
          }))}
        />
      </div>
    </div>
  );
}

// ─── 3. Sector allocation ────────────────────────────────────────────────
export function SectorAllocationChart({ sectors }: { sectors: SectorAllocation[] }) {
  const p = usePalette();
  const data = {
    labels: sectors.map((s) => s.sector),
    datasets: [
      {
        label: "Sector Allocation",
        data: sectors.map((s) => s.allocationPercentage),
        backgroundColor: sectors.map((_, i) => CATEGORICAL[i % CATEGORICAL.length]),
        borderRadius: 2,
        maxBarThickness: 18,
      },
    ],
  };
  const options: ChartOptions<"bar"> = {
    ...baseOptions(p),
    indexAxis: "y",
    plugins: {
      ...baseOptions(p).plugins,
      tooltip: {
        ...baseOptions(p).plugins.tooltip,
        callbacks: {
          label: (ctx) => {
            const s = sectors[ctx.dataIndex];
            return ` ${s.allocationPercentage.toFixed(2)}% · ${formatINR(s.currentValue)} · ${s.holdingsCount} holding${s.holdingsCount === 1 ? "" : "s"}`;
          },
        },
      },
    },
    scales: {
      x: { beginAtZero: true, max: 100, grid: { color: p.grid }, ticks: { ...tick(p), callback: (v) => `${v}%` }, border: { display: false } },
      y: { grid: { display: false }, ticks: tick(p), border: { color: p.grid } },
    },
  };
  return (
    <div style={{ height: Math.max(160, sectors.length * 34 + 40) }}>
      <Bar data={data} options={options} aria-label="Portfolio allocation by sector" role="img" />
    </div>
  );
}

// ─── 4. P&L per holding ──────────────────────────────────────────────────
export function HoldingsPnLChart({ holdings }: { holdings: PortfolioHolding[] }) {
  const p = usePalette();
  const sorted = [...holdings].sort((a, b) => b.profitLoss - a.profitLoss);
  const data = {
    labels: sorted.map((h) => h.symbol),
    datasets: [
      {
        label: "Profit / Loss",
        data: sorted.map((h) => h.profitLoss),
        backgroundColor: sorted.map((h) => (h.profitLoss >= 0 ? p.positive : p.negative)),
        borderRadius: 2,
        maxBarThickness: 18,
      },
    ],
  };
  const options: ChartOptions<"bar"> = {
    ...baseOptions(p),
    indexAxis: "y",
    plugins: {
      ...baseOptions(p).plugins,
      tooltip: {
        ...baseOptions(p).plugins.tooltip,
        callbacks: {
          title: (items) => sorted[items[0].dataIndex].company,
          label: (ctx) => {
            const h = sorted[ctx.dataIndex];
            const pct = h.returnPercentage === null ? "" : ` (${h.returnPercentage >= 0 ? "+" : ""}${h.returnPercentage.toFixed(2)}%)`;
            return ` ${formatINR(h.profitLoss)}${pct}`;
          },
        },
      },
    },
    scales: {
      x: { grid: { color: p.grid }, ticks: { ...tick(p), callback: (v) => compactINR(Number(v)) }, border: { display: false } },
      y: { grid: { display: false }, ticks: tick(p), border: { color: p.grid } },
    },
  };
  return (
    <div style={{ height: Math.max(160, sorted.length * 30 + 40) }}>
      <Bar data={data} options={options} aria-label="Profit and loss by holding" role="img" />
    </div>
  );
}

// ─── 5. Historical portfolio value ───────────────────────────────────────
const RANGES = [
  { key: "1M", days: 31 },
  { key: "3M", days: 92 },
  { key: "6M", days: 183 },
  { key: "1Y", days: 366 },
] as const;

export function PerformanceLineChart({ history }: { history: PerformanceHistory | null }) {
  const p = usePalette();
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("6M");

  const points = useMemo(() => {
    if (!history?.available) return [];
    const last = history.points[history.points.length - 1];
    const days = RANGES.find((r) => r.key === range)!.days;
    const cutoff = new Date(new Date(last.date).getTime() - days * 86400000).toISOString().slice(0, 10);
    return history.points.filter((pt) => pt.date >= cutoff);
  }, [history, range]);

  if (!history?.available || points.length < 2) {
    return (
      <div className="h-[240px] flex items-center justify-center text-center text-xs font-mono px-6" style={{ color: p.text }}>
        {history?.note ?? "Historical performance is not available for this portfolio."}
      </div>
    );
  }

  const first = points[0];
  const last = points[points.length - 1];
  const change = last.value - first.value;
  const changePct = first.value > 0 ? (change / first.value) * 100 : 0;
  const color = change >= 0 ? p.positive : p.negative;

  const data = {
    labels: points.map((pt) => pt.date),
    datasets: [
      {
        label: "Portfolio value",
        data: points.map((pt) => pt.value),
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.15,
        fill: false,
      },
    ],
  };
  const options: ChartOptions<"line"> = {
    ...baseOptions(p),
    interaction: { mode: "index", intersect: false },
    plugins: {
      ...baseOptions(p).plugins,
      tooltip: {
        ...baseOptions(p).plugins.tooltip,
        displayColors: false,
        callbacks: {
          title: (items) =>
            new Date(items[0].label).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          label: (ctx) => ` ${formatINR(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: p.grid },
        ticks: {
          ...tick(p),
          maxTicksLimit: 6,
          maxRotation: 0,
          callback: function (v) {
            const label = this.getLabelForValue(Number(v));
            return new Date(label).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
          },
        },
      },
      y: { grid: { color: p.grid }, ticks: { ...tick(p), callback: (v) => compactINR(Number(v)) }, border: { display: false } },
    },
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="text-xs font-mono font-medium" style={{ color }}>
          {change >= 0 ? "+" : ""}
          {formatINR(change)} ({change >= 0 ? "+" : ""}
          {changePct.toFixed(2)}%)
          <span className="ml-2 font-normal" style={{ color: p.text }}>
            over {range}
          </span>
        </div>
        <div
          className="flex items-center gap-1 p-0.5 rounded border"
          style={{ borderColor: p.dark ? "#24201D" : "#DDD5C9" }}
          role="group"
          aria-label="Time range"
        >
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              aria-pressed={range === r.key}
              className="px-2.5 py-1 text-xs font-mono font-semibold rounded cursor-pointer transition-colors"
              style={
                range === r.key
                  ? { backgroundColor: p.dark ? "#211F1D" : "#ECE8E1", color: p.strong }
                  : { color: p.text }
              }
            >
              {r.key}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[240px]">
        <Line data={data} options={options} aria-label="Historical portfolio value" role="img" />
      </div>
    </div>
  );
}

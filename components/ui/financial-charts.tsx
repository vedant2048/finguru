"use client";

import React, { useState } from "react";

// ==========================================
// 1. FINANCIAL LINE CHART (ZERO GRADIENTS)
// ==========================================

export interface DataPoint {
  date: string;
  value: number;
}

interface FinancialLineChartProps {
  data: Record<string, DataPoint[]>;
  initialTimeframe?: string;
  height?: number;
  showTimeframeSelector?: boolean;
  currencyPrefix?: string;
}

export function FinancialLineChart({
  data,
  initialTimeframe = "1M",
  height = 240,
  showTimeframeSelector = true,
  currencyPrefix = "₹",
}: FinancialLineChartProps) {
  const timeframes = Object.keys(data);
  const [activeTimeframe, setActiveTimeframe] = useState(
    timeframes.includes(initialTimeframe) ? initialTimeframe : timeframes[0] || "1M"
  );
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  const currentPoints = data[activeTimeframe] || [];
  if (currentPoints.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center text-xs font-mono text-[#A9A39B]">
        No historical data available
      </div>
    );
  }

  const values = currentPoints.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const firstPoint = currentPoints[0];
  const lastPoint = currentPoints[currentPoints.length - 1];
  const displayPoint = hoveredPoint || lastPoint;

  const diff = displayPoint.value - firstPoint.value;
  const diffPercent = ((diff / firstPoint.value) * 100).toFixed(2);
  const isPositive = diff >= 0;

  // Chart coordinates calculation
  const width = 800;
  const paddingX = 10;
  const paddingY = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const pointsString = currentPoints
    .map((p, idx) => {
      const x = paddingX + (idx / (currentPoints.length - 1)) * chartWidth;
      const y = height - paddingY - ((p.value - minVal) / range) * chartHeight;
      return `${x},${y}`;
    })
    .join(" ");

  const strokeColor = isPositive ? "#4E9F76" : "#D9534F";

  return (
    <div className="w-full select-none">
      {/* Top Header: Current Display Value & Timeframe Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
            {currencyPrefix}
            {displayPoint.value.toLocaleString("en-IN")}
          </div>
          <div
            className={`text-xs font-mono font-medium flex items-center gap-1.5 ${
              isPositive
                ? "text-[#4E9F76] dark:text-[#4E9F76] light:text-[#2E8555]"
                : "text-[#D9534F] dark:text-[#D9534F] light:text-[#C0392B]"
            }`}
          >
            <span>{isPositive ? "+" : ""}{currencyPrefix}{Math.abs(diff).toLocaleString("en-IN")}</span>
            <span>({isPositive ? "+" : ""}{diffPercent}%)</span>
            <span className="text-[#6F6A64] dark:text-[#6F6A64] light:text-[#9E978F] ml-1 font-normal">
              [{displayPoint.date}]
            </span>
          </div>
        </div>

        {showTimeframeSelector && (
          <div className="flex items-center gap-1 bg-[#151312] border border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#DDD5C9] p-0.5 rounded">
            {timeframes.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => {
                  setActiveTimeframe(tf);
                  setHoveredPoint(null);
                }}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded transition-colors cursor-pointer ${
                  activeTimeframe === tf
                    ? "bg-[#211F1D] text-[#FAF7F2] dark:bg-[#211F1D] dark:text-[#FAF7F2] light:bg-[#ECE8E1] light:text-[#171514]"
                    : "text-[#A9A39B] hover:text-[#FAF7F2] dark:text-[#A9A39B] dark:hover:text-[#FAF7F2] light:text-[#6F6A64] light:hover:text-[#171514]"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SVG Line Chart (Zero Gradients, Subtle Grid Lines) */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block"
          style={{ maxHeight: height }}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Horizontal Grid Lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />

          {/* Polyline: Solid Color Only */}
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
          />

          {/* Transparent interactive trigger columns for hover */}
          {currentPoints.map((point, idx) => {
            const x = paddingX + (idx / (currentPoints.length - 1)) * chartWidth;
            const y = height - paddingY - ((point.value - minVal) / range) * chartHeight;
            const colWidth = chartWidth / (currentPoints.length - 1 || 1);

            return (
              <g key={idx}>
                <rect
                  x={x - colWidth / 2}
                  y={0}
                  width={colWidth}
                  height={height}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredPoint(point)}
                />
                {hoveredPoint?.date === point.date && (
                  <>
                    <line
                      x1={x}
                      y1={paddingY}
                      x2={x}
                      y2={height - paddingY}
                      stroke="#3A7BD5"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <circle cx={x} cy={y} r="4" fill={strokeColor} stroke="#0F0D0C" strokeWidth="2" />
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ==========================================
// 2. ASSET ALLOCATION DONUT CHART
// ==========================================

export interface AssetSlice {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface AssetDonutChartProps {
  slices: AssetSlice[];
  totalValue?: string;
}

export function AssetDonutChart({ slices, totalValue }: AssetDonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const radius = 64;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90 transform">
          {slices.map((slice, idx) => {
            const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += slice.percentage;

            return (
              <circle
                key={slice.label}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={hoveredIdx === idx ? strokeWidth + 2 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-150 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#A9A39B]">
            {hoveredIdx !== null ? slices[hoveredIdx].label : "Total"}
          </span>
          <span className="text-xs font-bold font-mono text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
            {hoveredIdx !== null ? `${slices[hoveredIdx].percentage}%` : totalValue || "100%"}
          </span>
        </div>
      </div>

      {/* Legend List */}
      <div className="flex-1 w-full space-y-2">
        {slices.map((slice, idx) => (
          <div
            key={slice.label}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`flex items-center justify-between p-1.5 rounded transition-colors text-xs font-mono cursor-pointer ${
              hoveredIdx === idx
                ? "bg-[#1E1C1A] dark:bg-[#1E1C1A] light:bg-[#ECE8E1]"
                : "hover:bg-[#181615] dark:hover:bg-[#181615] light:hover:bg-[#F4F1EC]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514] font-medium">
                {slice.label}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
                ₹{slice.value.toLocaleString("en-IN")}
              </span>
              <span className="w-10 text-right font-semibold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                {slice.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 3. COMPARATIVE VALUATION HORIZONTAL BARS
// ==========================================

interface ComparisonBarProps {
  label: string;
  companyValue: number;
  industryValue: number;
  unit?: string;
  isLowerBetter?: boolean;
}

export function ValuationBarComparison({
  label,
  companyValue,
  industryValue,
  unit = "x",
  isLowerBetter = true,
}: ComparisonBarProps) {
  const maxVal = Math.max(companyValue, industryValue) * 1.2 || 1;
  const companyPercent = (companyValue / maxVal) * 100;
  const industryPercent = (industryValue / maxVal) * 100;

  const isFavorable = isLowerBetter
    ? companyValue <= industryValue
    : companyValue >= industryValue;

  return (
    <div className="space-y-1.5 font-mono text-xs">
      <div className="flex justify-between items-center text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
        <span>{label}</span>
        <span
          className={`text-[11px] font-semibold ${
            isFavorable
              ? "text-[#4E9F76] dark:text-[#4E9F76] light:text-[#2E8555]"
              : "text-[#D9822B] dark:text-[#D9822B] light:text-[#B35C00]"
          }`}
        >
          {isFavorable ? "Favorable vs Industry" : "Above Industry Average"}
        </span>
      </div>

      {/* Company Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">Company ({companyValue}{unit})</span>
          <span className="text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{companyValue}{unit}</span>
        </div>
        <div className="w-full h-2 rounded-sm bg-[#1E1C1A] dark:bg-[#1E1C1A] light:bg-[#E8E2D8] overflow-hidden">
          <div
            className="h-full transition-all duration-300 rounded-sm"
            style={{
              width: `${companyPercent}%`,
              backgroundColor: isFavorable ? "#4E9F76" : "#3A7BD5",
            }}
          />
        </div>
      </div>

      {/* Industry Benchmark Bar */}
      <div className="space-y-1 pt-1">
        <div className="flex justify-between text-[11px] text-[#A9A39B]">
          <span>Industry Benchmark</span>
          <span>{industryValue}{unit}</span>
        </div>
        <div className="w-full h-2 rounded-sm bg-[#1E1C1A] dark:bg-[#1E1C1A] light:bg-[#E8E2D8] overflow-hidden">
          <div
            className="h-full bg-[#6F6A64] dark:bg-[#6F6A64] light:bg-[#9E978F] transition-all duration-300 rounded-sm"
            style={{ width: `${industryPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

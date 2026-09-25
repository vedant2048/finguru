import React from "react";
import { Badge } from "./badge";

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  changePercent?: string;
  isPositive?: boolean;
  secondaryText?: string;
  badgeText?: string;
  badgeVariant?: "positive" | "negative" | "warning" | "info" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  changePercent,
  isPositive,
  secondaryText,
  badgeText,
  badgeVariant = "neutral",
  icon,
  className = "",
}: MetricCardProps) {
  return (
    <div
      className={`p-4 sm:p-5 rounded border transition-colors bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs uppercase font-mono tracking-wider text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
          {label}
        </span>
        {icon && <div className="text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">{icon}</div>}
        {badgeText && <Badge variant={badgeVariant}>{badgeText}</Badge>}
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
          {value}
        </div>

        {(change || changePercent) && (
          <div
            className={`text-xs font-mono font-medium flex items-center gap-1 ${
              isPositive
                ? "text-[#4E9F76] dark:text-[#4E9F76] light:text-[#2E8555]"
                : "text-[#D9534F] dark:text-[#D9534F] light:text-[#C0392B]"
            }`}
          >
            <span>{isPositive ? "+" : ""}{change}</span>
            {changePercent && <span>({isPositive ? "+" : ""}{changePercent})</span>}
          </div>
        )}
      </div>

      {secondaryText && (
        <div className="mt-2 pt-2 border-t border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8] text-[11px] font-mono text-[#6F6A64] dark:text-[#6F6A64] light:text-[#9E978F]">
          {secondaryText}
        </div>
      )}
    </div>
  );
}

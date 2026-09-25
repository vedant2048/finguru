import React from "react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-[#1B1918] dark:bg-[#1B1918] light:bg-[#EAE5DC] ${className}`}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-36" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8]">
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={idx} className="py-3 px-4">
          <Skeleton className="h-4 w-full max-w-[100px]" />
        </td>
      ))}
    </tr>
  );
}

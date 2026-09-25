import React from "react";

export type BadgeVariant = "positive" | "negative" | "warning" | "info" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "neutral",
  className = "",
  size = "sm",
}: BadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  const variantClasses = {
    positive:
      "bg-[#13241A] text-[#4E9F76] border border-[#1E3A2B] dark:bg-[#13241A] dark:text-[#4E9F76] dark:border-[#1E3A2B] light:bg-[#E8F5EE] light:text-[#2E8555] light:border-[#C4E5D4]",
    negative:
      "bg-[#2B1414] text-[#D9534F] border border-[#422020] dark:bg-[#2B1414] dark:text-[#D9534F] dark:border-[#422020] light:bg-[#FDE8E8] light:text-[#C0392B] light:border-[#F8C1C1]",
    warning:
      "bg-[#2B1C10] text-[#D9822B] border border-[#442C18] dark:bg-[#2B1C10] dark:text-[#D9822B] dark:border-[#442C18] light:bg-[#FEF3E6] light:text-[#B35C00] light:border-[#FCDCB5]",
    info:
      "bg-[#14202B] text-[#3A7BD5] border border-[#1E3042] dark:bg-[#14202B] dark:text-[#3A7BD5] dark:border-[#1E3042] light:bg-[#EBF3FB] light:text-[#2E68B8] light:border-[#C3DDF7]",
    neutral:
      "bg-[#1B1918] text-[#A9A39B] border border-[#2E2925] dark:bg-[#1B1918] dark:text-[#A9A39B] dark:border-[#2E2925] light:bg-[#F4F1EC] light:text-[#6F6A64] light:border-[#DDD5C9]",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-medium rounded ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
}

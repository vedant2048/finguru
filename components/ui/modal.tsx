"use client";

import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "md",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Solid Backing Overlay */}
      <div
        className="fixed inset-0 bg-[#000000]/80 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog (Restrained Terminal Solid Window) */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidthClass} rounded border p-6 z-10 shadow-2xl transition-all bg-[#151312] border-[#2E2925] text-[#FAF7F2] dark:bg-[#151312] dark:border-[#2E2925] dark:text-[#FAF7F2] light:bg-[#FFFFFF] light:border-[#DDD5C9] light:text-[#171514]`}
      >
        <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8]">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-7 h-7 rounded flex items-center justify-center border text-[#A9A39B] hover:text-[#FAF7F2] border-[#2E2925] hover:border-[#3D3732] dark:border-[#2E2925] dark:hover:border-[#3D3732] light:border-[#DDD5C9] light:text-[#6F6A64] light:hover:text-[#171514] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}

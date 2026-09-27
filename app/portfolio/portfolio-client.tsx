"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { AssetDonutChart } from "@/components/ui/financial-charts";
import { Modal } from "@/components/ui/modal";
import type { StoredPortfolio } from "@/lib/portfolio/repository";

interface PortfolioClientProps {
  initialPortfolio: StoredPortfolio | null;
  userName?: string;
}

const SECTOR_COLORS = [
  "#3A7BD5", // Blue
  "#4E9F76", // Green
  "#D9822B", // Orange
  "#9C6ADE", // Purple
  "#FED5A2", // Light amber
  "#8E8880", // Slate
  "#E06D53", // Coral
  "#5C9EAD", // Teal
  "#B388FF", // Indigo
];

export function PortfolioClient({ initialPortfolio }: PortfolioClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [portfolio, setPortfolio] = useState<StoredPortfolio | null>(initialPortfolio);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const holdings = portfolio?.holdings ?? [];
  const summary = portfolio?.summary ?? {
    totalInvested: 0,
    totalCurrentValue: 0,
    totalProfitLoss: 0,
    totalReturnPercentage: 0,
    holdingsCount: 0,
    largestHolding: null,
    largestSector: null,
  };

  const totalInvested = summary.totalInvested;
  const totalCurrentValue = summary.totalCurrentValue;
  const totalReturns = summary.totalProfitLoss;
  const totalReturnsPercent = (summary.totalReturnPercentage ?? 0).toFixed(2);

  // Sector breakdown slices
  const sectorSlices = (portfolio?.sectorAllocation ?? []).map((sec, idx) => ({
    label: sec.sector,
    value: sec.currentValue,
    percentage: sec.allocationPercentage,
    color: SECTOR_COLORS[idx % SECTOR_COLORS.length],
  }));

  // Handle direct Excel / CSV file upload
  const handleFileUpload = async (file: File) => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (![".csv", ".xlsx", ".xls"].includes(ext)) {
      setUploadError(`"${file.name}" is not supported. Please upload a .xlsx, .xls or .csv file.`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setSelectedFileName(file.name);
    setUploadProgressText("Uploading and reading file...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/portfolio/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || `Upload failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Could not initialize stream reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.type === "stage") {
              setUploadProgressText(event.message + (event.detail ? ` (${event.detail})` : ""));
            } else if (event.type === "needs_review") {
              // Redirect to review if ambiguities exist
              router.push(`/portfolio-upload`);
              return;
            } else if (event.type === "completed") {
              setUploadProgressText("Completed! Refreshing portfolio...");
              // Fetch latest processed portfolio
              const portRes = await fetch("/api/portfolio");
              if (portRes.ok) {
                const portData = await portRes.json();
                if (portData.portfolio) {
                  setPortfolio(portData.portfolio);
                }
              }
              setIsUploadModalOpen(false);
              setIsUploading(false);
              router.refresh();
              return;
            } else if (event.type === "error") {
              throw new Error(event.error?.message || "Portfolio processing error");
            }
          } catch (e) {
            if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
              throw e;
            }
          }
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8]">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Your Portfolio Holdings
              </h1>
              {portfolio?.fileName && (
                <Badge variant="neutral">SOURCE: {portfolio.fileName}</Badge>
              )}
            </div>
            <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64] mt-1">
              Live market tracking, asset allocation, sector concentration, and automated intelligence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              type="button"
              className="px-4 py-2 rounded text-xs font-mono font-semibold transition-all bg-[#FAF7F2] text-[#0F0D0C] hover:bg-[#E6E1D8] dark:bg-[#FAF7F2] dark:text-[#0F0D0C] light:bg-[#171514] light:text-[#FAF7F2] cursor-pointer touch-manipulation active:scale-[0.98] flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>{portfolio ? "Upload / Replace Excel" : "Upload Excel / CSV"}</span>
            </button>
          </div>
        </div>

        {/* Empty State Banner if no portfolio uploaded yet */}
        {!portfolio && (
          <div className="p-8 rounded border border-dashed border-[#3A7BD5]/40 bg-[#3A7BD5]/5 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#3A7BD5]/10 text-[#3A7BD5] flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
              No Portfolio Uploaded Yet
            </h2>
            <p className="text-xs text-[#A9A39B] max-w-md mx-auto">
              Upload your Excel (.xlsx, .xls) or broker CSV export to automatically track your real holdings with live NSE/BSE prices and AI analysis.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-5 py-2.5 rounded font-mono text-xs font-semibold bg-[#3A7BD5] text-white hover:bg-[#2E68B8] transition-colors"
              >
                Upload Excel Portfolio Now
              </button>
            </div>
          </div>
        )}

        {/* Top Summary Metrics */}
        {portfolio && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Portfolio Value"
              value={`₹${totalCurrentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
              change={`₹${totalReturns.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
              changePercent={`${totalReturnsPercent}%`}
              isPositive={totalReturns >= 0}
              secondaryText={`Holdings: ${summary.holdingsCount} Stocks`}
            />
            <MetricCard
              label="Invested Amount"
              value={`₹${totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
              secondaryText="Total Capital Deployed"
            />
            <MetricCard
              label="Unrealized P&L"
              value={`${totalReturns >= 0 ? "+₹" : "-₹"}${Math.abs(totalReturns).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
              changePercent={`${totalReturns >= 0 ? "+" : ""}${totalReturnsPercent}%`}
              isPositive={totalReturns >= 0}
              secondaryText={totalReturns >= 0 ? "Aggregate Portfolio Gain" : "Aggregate Portfolio Loss"}
            />
            <MetricCard
              label="Top Asset"
              value={summary.largestHolding?.symbol || "N/A"}
              secondaryText={summary.largestHolding ? `${summary.largestHolding.allocationPercentage}% portfolio allocation` : "None"}
            />
          </div>
        )}

        {/* Holdings Table */}
        {portfolio && (
          <div className="p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
                Holdings Breakdown ({holdings.length} Securities)
              </span>
              <span className="text-[11px] font-mono text-[#A9A39B]">PRICING: LIVE YAHOO FINANCE NSE/BSE</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8] text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
                    <th className="py-2.5 px-3 font-semibold uppercase">Security / Company</th>
                    <th className="py-2.5 px-3 font-semibold uppercase text-right">Qty</th>
                    <th className="py-2.5 px-3 font-semibold uppercase text-right">Avg Buy Price</th>
                    <th className="py-2.5 px-3 font-semibold uppercase text-right">Current Price</th>
                    <th className="py-2.5 px-3 font-semibold uppercase text-right">Invested</th>
                    <th className="py-2.5 px-3 font-semibold uppercase text-right">Current Value</th>
                    <th className="py-2.5 px-3 font-semibold uppercase text-right">Returns</th>
                    <th className="py-2.5 px-3 font-semibold uppercase text-right">Alloc %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24201D]/40 dark:divide-[#24201D]/40 light:divide-[#E8E2D8]">
                  {holdings.map((h) => {
                    const isPos = h.profitLoss >= 0;
                    return (
                      <tr key={h.id} className="hover:bg-[#181615] dark:hover:bg-[#181615] light:hover:bg-[#FAF7F2] transition-colors">
                        <td className="py-3 px-3">
                          <Link
                            href={`/stocks/${h.symbol}`}
                            className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514] hover:text-[#3A7BD5] hover:underline flex items-center gap-1.5"
                          >
                            <span>{h.symbol}</span>
                            <span className="text-[10px] px-1 py-0.2 rounded bg-[#24201D] text-[#A9A39B] font-normal">
                              {h.exchange}
                            </span>
                          </Link>
                          <div className="text-[11px] text-[#A9A39B] truncate max-w-[200px] sm:max-w-xs">{h.company}</div>
                        </td>
                        <td className="py-3 px-3 text-right text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                          {h.quantity.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-3 text-right text-[#A9A39B]">
                          ₹{h.avgPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                          ₹{h.currentPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right text-[#A9A39B]">
                          ₹{h.investedValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                          ₹{h.currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </td>
                        <td className={`py-3 px-3 text-right font-semibold ${isPos ? "text-[#4E9F76] dark:text-[#4E9F76] light:text-[#2E8555]" : "text-[#D9534F] dark:text-[#D9534F] light:text-[#C0392B]"}`}>
                          {isPos ? "+" : ""}₹{h.profitLoss.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          <span className="block text-[10px] opacity-80">
                            ({isPos ? "+" : ""}{(h.returnPercentage ?? 0).toFixed(2)}%)
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                          {h.allocationPercentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sector Diversification & AI Insights */}
        {portfolio && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sector Diversification */}
            <div className="lg:col-span-5 p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64] block mb-4">
                  Sector Concentration Breakdown
                </span>
                {sectorSlices.length > 0 ? (
                  <AssetDonutChart slices={sectorSlices} totalValue="100%" />
                ) : (
                  <p className="text-xs text-[#A9A39B]">Sector data pending.</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8] text-[11px] font-mono text-[#6F6A64] dark:text-[#6F6A64] light:text-[#9E978F]">
                {summary.largestSector ? `Top sector: ${summary.largestSector.sector} (${summary.largestSector.allocationPercentage}%)` : "Diversified across sectors."}
              </div>
            </div>

            {/* AI Portfolio Analysis */}
            <div className="lg:col-span-7 p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-inherit">
                <span className="text-xs font-mono uppercase tracking-wider font-bold">
                  AI Intelligence Insights
                </span>
                <Badge variant="positive">MODEL: WEALTHZY NEMOTRON</Badge>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {portfolio.analysis ? (
                  <>
                    <div className="p-3.5 rounded border border-[#2E2925] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] space-y-1">
                      <div className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                        Executive Summary
                      </div>
                      <p className="text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64] leading-relaxed">
                        {portfolio.analysis.summary}
                      </p>
                    </div>

                    {portfolio.analysis.diversification && (
                      <div className="p-3.5 rounded border border-[#2E2925] bg-[#181615] dark:bg-[#181615] light:bg-[#FAF7F2] space-y-1">
                        <div className="flex justify-between font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                          <span>Diversification &amp; Concentration</span>
                          <span className="text-[#4E9F76]">Observation</span>
                        </div>
                        <p className="text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64] leading-relaxed">
                          {portfolio.analysis.diversification.observation}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 rounded border border-[#2E2925] text-[#A9A39B] text-xs">
                    Automated AI analysis is ready. Upload or refresh to trigger analysis.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Upload Modal */}
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => !isUploading && setIsUploadModalOpen(false)}
          title="Upload Excel or CSV Portfolio"
          subtitle="Supports standard Excel (.xlsx, .xls) and broker CSV exports (Zerodha, Groww, ICICI)."
        >
          <div className="space-y-4 font-mono text-xs">
            {uploadError && (
              <div className="p-3 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs">
                {uploadError}
              </div>
            )}

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isUploading
                  ? "border-[#3A7BD5] bg-[#3A7BD5]/5"
                  : "border-[#2E2925] hover:border-[#3A7BD5] bg-[#181615]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                disabled={isUploading}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {isUploading ? (
                <div className="space-y-3">
                  <div className="w-8 h-8 border-2 border-[#3A7BD5] border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="text-sm font-bold text-[#FAF7F2]">{uploadProgressText}</div>
                  <div className="text-[11px] text-[#A9A39B]">Processing: {selectedFileName}</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#24201D] text-[#A9A39B] flex items-center justify-center mx-auto">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold text-[#FAF7F2]">
                    Click to select or drag &amp; drop your Excel file
                  </div>
                  <div className="text-[11px] text-[#A9A39B]">
                    Accepts .xlsx, .xls, .csv (Max 5MB)
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 rounded bg-[#181615] border border-[#24201D] text-[11px] text-[#A9A39B] space-y-1">
              <div className="font-semibold text-[#FAF7F2]">Sample Files Available:</div>
              <div>You can test with sample files in the <code className="text-[#3A7BD5]">samples/</code> folder (e.g. <code className="text-[#3A7BD5]">diversified_portfolio.xlsx</code>).</div>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useTheme } from "@/components/theme-provider";
import {
  AllocationDoughnut,
  formatINR,
  HoldingsPnLChart,
  PerformanceLineChart,
  PortfolioValueChart,
  SectorAllocationChart,
} from "@/components/portfolio/portfolio-charts";
import type { PortfolioAnalysis } from "@/lib/ai/portfolioAnalysis";
import type { StoredPortfolio } from "@/lib/portfolio/repository";
import type { AnalysisStatus } from "@/lib/portfolio/types";

interface DashboardClientProps {
  userName?: string;
  portfolio: StoredPortfolio;
}

type Severity = "low" | "medium" | "high";

function useStyles() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  return {
    dark,
    panel: dark ? "bg-[#151312] border-[#24201D]" : "bg-[#FFFFFF] border-[#E8E2D8]",
    inset: dark ? "bg-[#181615] border-[#2E2925]" : "bg-[#FAF7F2] border-[#DDD5C9]",
    divider: dark ? "border-[#24201D]" : "border-[#E8E2D8]",
    rowDivider: dark ? "divide-[#24201D]" : "divide-[#E8E2D8]",
    strong: dark ? "text-[#FAF7F2]" : "text-[#171514]",
    muted: dark ? "text-[#A9A39B]" : "text-[#6F6A64]",
    faint: dark ? "text-[#6F6A64]" : "text-[#9E978F]",
    positive: dark ? "text-[#4E9F76]" : "text-[#2E8555]",
    negative: dark ? "text-[#D9534F]" : "text-[#C0392B]",
    accent: dark ? "text-[#3A7BD5]" : "text-[#2E68B8]",
    button: dark
      ? "bg-[#151312] border-[#2E2925] text-[#FAF7F2] hover:bg-[#201C19]"
      : "bg-[#FFFFFF] border-[#DDD5C9] text-[#171514] hover:bg-[#F0EDE6]",
    severity: (s: Severity) =>
      ({
        low: dark ? "bg-[#13241A] text-[#4E9F76] border-[#1E3A2B]" : "bg-[#E8F5EE] text-[#2E8555] border-[#C4E5D4]",
        medium: dark ? "bg-[#2B1C10] text-[#D9822B] border-[#442C18]" : "bg-[#FEF3E6] text-[#B35C00] border-[#FCDCB5]",
        high: dark ? "bg-[#2B1414] text-[#D9534F] border-[#422020]" : "bg-[#FDE8E8] text-[#C0392B] border-[#F8C1C1]",
      })[s],
    tag: dark ? "bg-[#1B1918] text-[#A9A39B] border-[#2E2925]" : "bg-[#F4F1EC] text-[#6F6A64] border-[#DDD5C9]",
  };
}

type Styles = ReturnType<typeof useStyles>;

const signed = (n: number, suffix = "") => `${n >= 0 ? "+" : ""}${n.toFixed(2)}${suffix}`;

function Panel({ title, right, children, className = "", s }: { title: string; right?: React.ReactNode; children: React.ReactNode; className?: string; s: Styles }) {
  return (
    <section className={`p-5 rounded border ${s.panel} ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className={`text-xs font-mono uppercase tracking-wider font-bold ${s.muted}`}>{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, sub, tone, s }: { label: string; value: string; sub?: string; tone?: "positive" | "negative"; s: Styles }) {
  return (
    <div className={`p-4 sm:p-5 rounded border ${s.panel}`}>
      <div className={`text-xs uppercase font-mono tracking-wider mb-2 ${s.muted}`}>{label}</div>
      <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${tone ? s[tone] : s.strong}`}>{value}</div>
      {sub && <div className={`mt-2 pt-2 border-t text-[11px] font-mono ${s.divider} ${s.faint}`}>{sub}</div>}
    </div>
  );
}

function SeverityTag({ severity, s }: { severity: Severity; s: Styles }) {
  return (
    <span className={`inline-flex px-2 py-0.5 text-[10px] font-mono font-medium uppercase rounded border ${s.severity(severity)}`}>
      {severity}
    </span>
  );
}

function AnalysisCard({ title, children, right, s }: { title: string; children: React.ReactNode; right?: React.ReactNode; s: Styles }) {
  return (
    <div className={`p-4 rounded border space-y-3 ${s.inset}`}>
      <div className={`flex items-center justify-between gap-2 pb-2 border-b ${s.divider}`}>
        <h3 className={`text-xs font-mono uppercase tracking-wider font-bold ${s.strong}`}>{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function Observation({ heading, body, reason, s }: { heading?: string; body: string; reason?: string; s: Styles }) {
  return (
    <div className="space-y-1">
      {heading && <div className={`text-xs font-semibold font-mono ${s.strong}`}>{heading}</div>}
      <p className={`text-xs leading-relaxed ${s.strong}`}>{body}</p>
      {reason && <p className={`text-[11px] leading-relaxed ${s.muted}`}>Why: {reason}</p>}
    </div>
  );
}

function AnalysisSection({
  portfolioId,
  initial,
  initialStatus,
  initialError,
  s,
}: {
  portfolioId: number;
  initial: PortfolioAnalysis | null;
  initialStatus: AnalysisStatus | null;
  initialError: string | null;
  s: Styles;
}) {
  const [analysis, setAnalysis] = useState(initial);
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const regenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/portfolio/${portfolioId}/analysis`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(res.status === 401 ? "Your session has expired. Please sign in again." : body?.message ?? "Analysis failed.");
        return;
      }
      setAnalysis(body.analysis);
      setStatus(body.analysisStatus);
      setError(body.analysisError);
    } catch {
      setError("Network error: couldn't reach Wealthzy.");
    } finally {
      setLoading(false);
    }
  };

  const header = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-sm ${s.dark ? "bg-[#3A7BD5]" : "bg-[#2E68B8]"}`} />
        <h2 className="text-xs font-mono uppercase tracking-wider font-bold">Wealthzy Analysis</h2>
      </div>
      {status !== "unavailable" && (
        <button
          type="button"
          onClick={regenerate}
          disabled={loading}
          className={`px-3 py-1.5 rounded border text-xs font-mono transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait ${s.button}`}
        >
          {loading ? "Generating…" : analysis ? "Regenerate" : "Generate analysis"}
        </button>
      )}
    </div>
  );

  if (!analysis) {
    return (
      <section className={`p-5 rounded border space-y-3 ${s.panel}`}>
        {header}
        <p className={`text-xs font-mono ${s.muted}`}>
          {loading
            ? "Generating observations from your portfolio data…"
            : status === "unavailable"
            ? "AI analysis is not configured on this server. All portfolio figures above are calculated from your file and live market data."
            : status === "failed"
            ? `The analysis could not be generated${error ? ` (${error})` : ""}. Your portfolio data is unaffected.`
            : error ?? "No analysis has been generated for this portfolio yet."}
        </p>
      </section>
    );
  }

  return (
    <section className={`p-5 rounded border space-y-4 ${s.panel}`}>
      {header}
      {error && <p className={`text-xs font-mono ${s.negative}`}>{error}</p>}
      <p className={`text-sm leading-relaxed ${s.strong}`}>{analysis.summary}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnalysisCard title="Diversification" right={<SeverityTag severity={analysis.diversification.severity} s={s} />} s={s}>
          <Observation body={analysis.diversification.observation} reason={analysis.diversification.evidence} s={s} />
        </AnalysisCard>

        <AnalysisCard title="Risk Observations" s={s}>
          {analysis.riskObservations.length === 0 && <p className={`text-xs ${s.muted}`}>No specific risks noted.</p>}
          {analysis.riskObservations.map((r) => (
            <div key={r.title} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-semibold font-mono ${s.strong}`}>{r.title}</span>
                <SeverityTag severity={r.severity} s={s} />
              </div>
              <Observation body={r.description} reason={r.reason} s={s} />
            </div>
          ))}
        </AnalysisCard>

        <AnalysisCard title="Sector Exposure" s={s}>
          {analysis.sectorExposure.map((x) => (
            <div key={x.sector} className="space-y-1">
              <div className={`flex justify-between text-xs font-mono ${s.strong}`}>
                <span className="font-semibold">{x.sector}</span>
                <span>{x.allocation.toFixed(2)}%</span>
              </div>
              <p className={`text-xs leading-relaxed ${s.muted}`}>{x.observation}</p>
            </div>
          ))}
        </AnalysisCard>

        <AnalysisCard title="Valuation" s={s}>
          {analysis.valuationObservations.length === 0 && <p className={`text-xs ${s.muted}`}>No valuation observations.</p>}
          {analysis.valuationObservations.map((v, i) => (
            <Observation key={`${v.symbol}-${i}`} heading={v.symbol} body={v.observation} reason={v.reason} s={s} />
          ))}
        </AnalysisCard>

        <AnalysisCard title="Holdings" s={s}>
          {analysis.holdingsAnalysis.map((h, i) => (
            <Observation key={`${h.symbol}-${i}`} heading={h.symbol} body={h.observation} reason={h.reason} s={s} />
          ))}
        </AnalysisCard>

        <AnalysisCard title="Performance" s={s}>
          {analysis.performanceObservations.map((o, i) => (
            <Observation key={i} body={o.observation} reason={o.reason} s={s} />
          ))}
        </AnalysisCard>

        <AnalysisCard title="Strengths" s={s}>
          {analysis.strengths.map((o) => (
            <Observation key={o.title} heading={o.title} body={o.description} s={s} />
          ))}
        </AnalysisCard>

        <AnalysisCard title="May Need Attention" s={s}>
          {analysis.attentionAreas.length === 0 && <p className={`text-xs ${s.muted}`}>Nothing flagged.</p>}
          {analysis.attentionAreas.map((o) => (
            <div key={o.title} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-semibold font-mono ${s.strong}`}>{o.title}</span>
                <SeverityTag severity={o.severity} s={s} />
              </div>
              <p className={`text-xs leading-relaxed ${s.strong}`}>{o.description}</p>
            </div>
          ))}
        </AnalysisCard>
      </div>

      {analysis.dataLimitations.length > 0 && (
        <div className={`pt-3 border-t ${s.divider}`}>
          <div className={`text-[10px] font-mono uppercase tracking-wider font-bold mb-1 ${s.faint}`}>Data limitations</div>
          <ul className={`list-disc pl-4 space-y-0.5 text-[11px] ${s.muted}`}>
            {analysis.dataLimitations.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      )}
      <p className={`text-[11px] ${s.faint}`}>
        Observations are generated by AI from the figures shown on this page. They are informational and not investment advice.
      </p>
    </section>
  );
}

export function DashboardClient({ userName, portfolio }: DashboardClientProps) {
  const s = useStyles();
  const { summary, holdings, sectorAllocation } = portfolio;
  const pnlTone = summary.totalProfitLoss >= 0 ? "positive" : "negative";
  const firstName = (userName ?? "Investor").split(" ")[0];
  const processed = portfolio.processedAt
    ? new Date(portfolio.processedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : null;
  const anyFilePrices = holdings.some((h) => h.priceSource === "file");

  return (
    <AppShell>
      <div className="space-y-6">
        <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b ${s.divider}`}>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Portfolio Overview</h1>
            <p className={`text-xs font-mono ${s.muted}`}>
              {firstName}&apos;s portfolio{portfolio.fileName ? ` · ${portfolio.fileName}` : ""}
              {processed ? ` · prices as of ${processed}` : ""}
            </p>
          </div>
          <Link href="/portfolio-upload" className={`self-start sm:self-auto px-3 py-1.5 rounded border text-xs font-mono font-medium transition-colors ${s.button}`}>
            Re-upload portfolio
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Current Value" value={formatINR(summary.totalCurrentValue)} sub={`Invested ${formatINR(summary.totalInvested)}`} s={s} />
          <Stat
            label="Total P&L"
            value={`${summary.totalProfitLoss >= 0 ? "+" : ""}${formatINR(summary.totalProfitLoss)}`}
            tone={pnlTone}
            sub="Unrealised, at current market prices"
            s={s}
          />
          <Stat
            label="Total Return"
            value={summary.totalReturnPercentage === null ? "—" : signed(summary.totalReturnPercentage, "%")}
            tone={pnlTone}
            sub={`${summary.holdingsCount} holding${summary.holdingsCount === 1 ? "" : "s"}`}
            s={s}
          />
          <Stat
            label="Concentration"
            value={summary.largestHolding ? `${summary.largestHolding.allocationPercentage.toFixed(1)}%` : "—"}
            sub={[
              summary.largestHolding ? `Largest holding: ${summary.largestHolding.symbol}` : null,
              summary.largestSector ? `Largest sector: ${summary.largestSector.sector} ${summary.largestSector.allocationPercentage.toFixed(1)}%` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
            s={s}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Panel
            title="Portfolio Performance"
            right={<span className={`text-[10px] font-mono ${s.faint}`}>Current holdings × historical close</span>}
            className="lg:col-span-8"
            s={s}
          >
            <PerformanceLineChart history={portfolio.history} />
          </Panel>
          <Panel title="Portfolio Value" className="lg:col-span-4" s={s}>
            <PortfolioValueChart invested={summary.totalInvested} current={summary.totalCurrentValue} />
          </Panel>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Portfolio Allocation" s={s}>
            <AllocationDoughnut holdings={holdings} total={summary.totalCurrentValue} />
          </Panel>
          <Panel title="Sector Allocation" s={s}>
            <SectorAllocationChart sectors={sectorAllocation} />
          </Panel>
        </div>

        <Panel title="Profit / Loss by Holding" s={s}>
          <HoldingsPnLChart holdings={holdings} />
        </Panel>

        <Panel title="Holdings" right={<span className={`text-[10px] font-mono ${s.faint}`}>{holdings.length} positions</span>} s={s}>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full min-w-[760px] text-xs font-mono">
              <thead>
                <tr className={`text-left uppercase tracking-wider text-[10px] ${s.muted}`}>
                  <th className="py-2 pr-3 font-semibold">Company</th>
                  <th className="py-2 px-3 font-semibold text-right">Qty</th>
                  <th className="py-2 px-3 font-semibold text-right">Avg Price</th>
                  <th className="py-2 px-3 font-semibold text-right">Price</th>
                  <th className="py-2 px-3 font-semibold text-right">Value</th>
                  <th className="py-2 px-3 font-semibold text-right">P&amp;L</th>
                  <th className="py-2 px-3 font-semibold text-right">Return</th>
                  <th className="py-2 pl-3 font-semibold text-right">Weight</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${s.rowDivider} border-t ${s.divider}`}>
                {holdings.map((h) => {
                  const tone = h.profitLoss >= 0 ? s.positive : s.negative;
                  return (
                    <tr key={`${h.exchange}:${h.symbol}`}>
                      <td className="py-2.5 pr-3">
                        <Link href={`/stocks/${h.symbol}`} className={`font-semibold hover:underline ${s.strong}`}>
                          {h.company}
                        </Link>
                        <div className={`text-[10px] ${s.faint}`}>
                          {h.symbol} · {h.exchange} · {h.sector}
                        </div>
                      </td>
                      <td className={`py-2.5 px-3 text-right ${s.strong}`}>{h.quantity.toLocaleString("en-IN")}</td>
                      <td className={`py-2.5 px-3 text-right ${s.muted}`}>{formatINR(h.avgPrice, 2)}</td>
                      <td className={`py-2.5 px-3 text-right ${s.strong}`}>
                        {formatINR(h.currentPrice, 2)}
                        {h.priceSource === "file" && <span title="Price from your uploaded file" className={s.faint}>*</span>}
                      </td>
                      <td className={`py-2.5 px-3 text-right ${s.strong}`}>{formatINR(h.currentValue)}</td>
                      <td className={`py-2.5 px-3 text-right ${tone}`}>
                        {h.profitLoss >= 0 ? "+" : ""}
                        {formatINR(h.profitLoss)}
                      </td>
                      <td className={`py-2.5 px-3 text-right ${tone}`}>
                        {h.returnPercentage === null ? "—" : signed(h.returnPercentage, "%")}
                      </td>
                      <td className={`py-2.5 pl-3 text-right ${s.muted}`}>{h.allocationPercentage.toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {(anyFilePrices || portfolio.excluded.length > 0) && (
            <div className={`mt-3 pt-3 border-t space-y-1 text-[11px] font-mono ${s.divider} ${s.faint}`}>
              {anyFilePrices && <p>* Live price unavailable; current price taken from your uploaded file.</p>}
              {portfolio.excluded.length > 0 && (
                <p>
                  Excluded during review (not in calculations):{" "}
                  {portfolio.excluded.map((e) => `${e.inputName} (row ${e.rowNumber}, qty ${e.quantity})`).join(", ")}
                </p>
              )}
            </div>
          )}
        </Panel>

        <AnalysisSection
          portfolioId={portfolio.id}
          initial={portfolio.analysis}
          initialStatus={portfolio.analysisStatus}
          initialError={portfolio.analysisError}
          s={s}
        />
      </div>
    </AppShell>
  );
}

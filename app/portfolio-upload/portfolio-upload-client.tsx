"use client";

import React, { useRef, useState, DragEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import type { PipelineEvent, ProcessingStage, ReviewItem } from "@/lib/portfolio/types";

interface PortfolioUploadClientProps {
  userEmail: string;
  alreadyUploaded: boolean;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls"];

interface ProgressStep {
  stage: ProcessingStage;
  label: string;
  activeMessage: string;
}

const STEPS: ProgressStep[] = [
  { stage: "uploading", label: "Uploading portfolio", activeMessage: "Uploading portfolio..." },
  { stage: "parsing", label: "Reading portfolio data", activeMessage: "Reading portfolio data..." },
  { stage: "identifying", label: "Identifying stocks", activeMessage: "Identifying stocks..." },
  { stage: "fetching_market_data", label: "Fetching market data", activeMessage: "Fetching market data..." },
  { stage: "analyzing", label: "Generating analysis", activeMessage: "Generating analysis..." },
  { stage: "completed", label: "Preparing dashboard", activeMessage: "Preparing your dashboard..." },
];

type Choice =
  | { kind: "candidate"; symbol: string; exchange: "NSE" | "BSE" }
  | { kind: "manual"; symbol: string; exchange: "NSE" | "BSE" }
  | { kind: "exclude" };

interface ErrorState {
  message: string;
  details?: string[];
  sessionExpired?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export function PortfolioUploadClient({ alreadyUploaded }: PortfolioUploadClientProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === "dark";

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [stageDetail, setStageDetail] = useState<Partial<Record<ProcessingStage, string>>>({});
  const [failedStage, setFailedStage] = useState<ProcessingStage | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [review, setReview] = useState<{ portfolioId: number; items: ReviewItem[]; message: string } | null>(null);
  const [choices, setChoices] = useState<Record<number, Choice | undefined>>({});
  const [analysisNote, setAnalysisNote] = useState<string | null>(null);

  const isProcessing = ["uploading", "parsing", "identifying", "fetching_market_data", "calculating", "saving", "analyzing", "completed"].includes(stage);
  const isFullScreenActive = isProcessing || (stage === "error" && failedStage !== null);

  const c = {
    muted: isDark ? "text-[#9E978F]" : "text-[#6B635B]",
    faint: isDark ? "text-[#6E6760]" : "text-[#968E85]",
    panel: isDark ? "bg-[#151210] border-[#27221E]" : "bg-[#FFFFFF] border-[#E5DFD7]",
    control: isDark
      ? "bg-[#181513] border-[#2A2420] text-[#FAF7F2]"
      : "bg-[#FAF7F2] border-[#DDD5C9] text-[#171412]",
    divider: isDark ? "border-[#27221E]" : "border-[#E5DFD7]",
    positive: isDark ? "text-[#4E9F76]" : "text-[#2E8555]",
    negative: isDark ? "text-[#D9534F]" : "text-[#C0392B]",
    warning: isDark ? "text-[#D9822B]" : "text-[#B35C00]",
    accent: isDark ? "text-[#3A7BD5]" : "text-[#2E68B8]",
    primaryBtn: isDark
      ? "bg-[#FAF7F2] text-[#0F0D0C] hover:bg-[#E6E1D8]"
      : "bg-[#171412] text-[#FAF7F2] hover:bg-[#2A2420]",
    disabledBtn: isDark
      ? "bg-[#201C19] text-[#4A423A] border border-[#27221E] cursor-not-allowed"
      : "bg-[#EBE4DA] text-[#B8AEA2] border border-[#DDD5C9] cursor-not-allowed",
  };

  const resetRun = () => {
    setStage("idle");
    setStageDetail({});
    setFailedStage(null);
    setError(null);
    setReview(null);
    setChoices({});
    setAnalysisNote(null);
  };

  const validateAndSetFile = (file: File) => {
    resetRun();
    const lower = file.name.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      setError({ message: `"${file.name}" is not supported. Please upload a .csv, .xlsx or .xls file.` });
      setSelectedFile(null);
      return;
    }
    if (file.size === 0) {
      setError({ message: "The selected file is empty." });
      setSelectedFile(null);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError({ message: `The file is larger than ${MAX_FILE_BYTES / (1024 * 1024)} MB. Please upload a smaller file.` });
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    resetRun();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runPipeline = async (url: string, init: RequestInit) => {
    let currentStage: ProcessingStage = stage;
    const advance = (s: ProcessingStage) => {
      currentStage = s;
      setStage(s);
    };
    const fail = (err: ErrorState) => {
      setFailedStage(currentStage || "uploading");
      setError(err);
      setStage("error");
    };

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch {
      fail({ message: "Network error: unable to reach server. Please check your connection and try again." });
      return;
    }

    if (!response.ok || !response.body) {
      const body = await response.json().catch(() => null);
      fail({
        message: body?.message ?? "The portfolio processing request failed.",
        details: body?.details,
        sessionExpired: response.status === 401,
      });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finished = false;

    const handle = (event: PipelineEvent) => {
      switch (event.type) {
        case "stage":
          advance(event.stage);
          if (event.detail) setStageDetail((d) => ({ ...d, [event.stage]: event.detail }));
          break;
        case "needs_review":
          finished = true;
          setReview({ portfolioId: event.portfolioId, items: event.holdings, message: event.message });
          setChoices({});
          advance("needs_review");
          break;
        case "completed":
          finished = true;
          advance("completed");
          if (event.analysisStatus === "failed") {
            setAnalysisNote("Your portfolio is ready. AI analysis could not be generated and can be retried from the dashboard.");
          } else if (event.analysisStatus === "unavailable") {
            setAnalysisNote("Your portfolio is ready.");
          }
          router.refresh();
          setTimeout(() => {
            router.push(event.redirectTo || "/dashboard");
          }, 1200);
          break;
        case "error":
          finished = true;
          fail({ message: event.message, details: event.details });
          break;
      }
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.trim()) handle(JSON.parse(line) as PipelineEvent);
        }
      }
      if (buffer.trim()) handle(JSON.parse(buffer) as PipelineEvent);
    } catch {
      fail({ message: "The connection was interrupted while processing your portfolio. Please try again." });
      return;
    }
    if (!finished && stage !== "error") {
      fail({ message: "Portfolio processing ended unexpectedly. Please try again." });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    resetRun();
    setStage("uploading");
    const formData = new FormData();
    formData.append("file", selectedFile);
    await runPipeline("/api/portfolio/process", { method: "POST", body: formData });
  };

  const reviewItems = review?.items.filter((i) => i.status === "needs_review") ?? [];
  const allReviewed = reviewItems.every((i) => {
    const ch = choices[i.rowNumber];
    return ch && (ch.kind === "exclude" || ch.symbol.trim().length > 0);
  });

  const handleSubmitReview = async () => {
    if (!review || !allReviewed) return;
    const resolutions = reviewItems.map((i) => {
      const ch = choices[i.rowNumber]!;
      return ch.kind === "exclude"
        ? { rowNumber: i.rowNumber, action: "exclude" as const }
        : { rowNumber: i.rowNumber, action: "select" as const, symbol: ch.symbol.trim().toUpperCase(), exchange: ch.exchange };
    });
    setError(null);
    setFailedStage(null);
    setStage("identifying");
    await runPipeline(`/api/portfolio/${review.portfolioId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolutions }),
    });
  };

  const getStepIndex = (s: ProcessingStage): number => {
    switch (s) {
      case "uploading":
        return 0;
      case "parsing":
        return 1;
      case "identifying":
        return 2;
      case "fetching_market_data":
      case "calculating":
      case "saving":
        return 3;
      case "analyzing":
        return 4;
      case "completed":
        return 5;
      default:
        return 0;
    }
  };

  const activeStepIdx = stage === "completed" ? 5 : getStepIndex(stage);
  const currentStepInfo = STEPS[activeStepIdx] || STEPS[0];

  return (
    <div
      className={`min-h-screen flex flex-col justify-between font-sans transition-colors duration-150 ${
        isDark ? "bg-[#0F0D0C] text-[#FAF7F2]" : "bg-[#FAF7F2] text-[#171514]"
      }`}
    >
      {/* FULL-SCREEN LOADING / PROCESSING OVERLAY */}
      {isFullScreenActive && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio Processing Progress"
          className={`fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 transition-all duration-300 backdrop-blur-xl ${
            isDark ? "bg-[#0F0D0C]/95 text-[#FAF7F2]" : "bg-[#FAF7F2]/95 text-[#171514]"
          }`}
        >
          {/* Header */}
          <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded flex items-center justify-center border font-mono text-xs font-bold ${
                  isDark ? "bg-[#181513] border-[#2A2420] text-[#FAF7F2]" : "bg-[#FFFFFF] border-[#DDD5C9] text-[#171514]"
                }`}
              >
                W
              </div>
              <span className="text-xs font-bold tracking-tight uppercase font-mono">
                WEALTHZY PIPELINE
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${stage === "error" ? "bg-rose-500" : "bg-[#3A7BD5] animate-ping"}`} />
              <span className={`text-[11px] font-mono uppercase tracking-wider ${stage === "error" ? "text-rose-400" : c.accent}`}>
                {stage === "error" ? "PROCESSING FAILED" : "GENERATING ANALYSIS"}
              </span>
            </div>
          </div>

          {/* Central Progress Content */}
          <div className="max-w-xl w-full mx-auto my-auto py-8 text-center space-y-8">
            {/* Animated Center Spinner / Status Glyph */}
            <div className="relative flex items-center justify-center mx-auto w-24 h-24">
              {stage === "error" ? (
                <div className="w-20 h-20 rounded-full border-2 border-rose-500/40 bg-rose-500/10 flex items-center justify-center text-rose-500 text-3xl">
                  ✕
                </div>
              ) : stage === "completed" ? (
                <div className="w-20 h-20 rounded-full border-2 border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-3xl animate-bounce">
                  ✓
                </div>
              ) : (
                <>
                  <div className={`absolute inset-0 rounded-full border-2 border-t-transparent animate-spin ${isDark ? "border-[#3A7BD5]" : "border-[#2E68B8]"}`} />
                  <div className={`w-16 h-16 rounded-full border flex items-center justify-center ${isDark ? "bg-[#181513] border-[#2A2420]" : "bg-[#FFFFFF] border-[#DDD5C9]"}`}>
                    <svg className="w-7 h-7 text-[#3A7BD5] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </>
              )}
            </div>

            {/* Current Stage Message */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {stage === "error"
                  ? "Analysis Failed"
                  : stage === "completed"
                  ? "Preparing your dashboard..."
                  : currentStepInfo.activeMessage}
              </h2>
              <p className={`text-xs sm:text-sm font-mono ${c.muted}`}>
                {selectedFile?.name ? `Processing ${selectedFile.name}` : "Analyzing portfolio holdings"}
                {stageDetail[stage] ? ` · ${stageDetail[stage]}` : ""}
              </p>
            </div>

            {/* Error Message Box inside Full-Screen Mode */}
            {stage === "error" && error && (
              <div
                role="alert"
                className={`p-4 rounded border text-left text-xs font-mono space-y-2 ${
                  isDark ? "bg-[#2B1414] border-rose-500/40 text-rose-300" : "bg-rose-50 border-rose-300 text-rose-800"
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
                  </svg>
                  <span>{error.message}</span>
                </div>
                {error.details && error.details.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1 opacity-90">
                    {error.details.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                )}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={resetRun}
                    className={`h-9 px-4 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
                      isDark ? "bg-rose-500 text-white hover:bg-rose-600" : "bg-rose-700 text-white hover:bg-rose-800"
                    }`}
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className={`h-9 px-4 rounded border text-xs font-mono transition-all cursor-pointer ${
                      isDark ? "border-[#2A2420] text-[#FAF7F2] hover:bg-[#181513]" : "border-[#DDD5C9] text-[#171412] hover:bg-white"
                    }`}
                  >
                    Choose Another File
                  </button>
                </div>
              </div>
            )}

            {/* Stepper Progression Timeline */}
            <div className={`p-5 rounded border text-left space-y-3 ${c.panel}`}>
              <div className={`text-[10px] font-mono uppercase tracking-wider font-bold ${c.faint}`}>
                PIPELINE STAGES
              </div>
              <ol className="space-y-2.5">
                {STEPS.map((step, idx) => {
                  const isDone = idx < activeStepIdx || stage === "completed";
                  const isCurrent = idx === activeStepIdx && stage !== "completed" && stage !== "error";
                  const isFailed = idx === activeStepIdx && stage === "error";

                  return (
                    <li key={step.stage} className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-center shrink-0">
                          {isDone ? (
                            <span className="text-emerald-500 font-bold">✓</span>
                          ) : isFailed ? (
                            <span className="text-rose-500 font-bold">✕</span>
                          ) : isCurrent ? (
                            <span className={`inline-block w-2.5 h-2.5 rounded-full animate-ping ${isDark ? "bg-[#3A7BD5]" : "bg-[#2E68B8]"}`} />
                          ) : (
                            <span className={c.faint}>○</span>
                          )}
                        </span>
                        <span
                          className={`font-medium ${
                            isDone
                              ? isDark ? "text-[#FAF7F2]" : "text-[#171412]"
                              : isCurrent
                              ? `${c.accent} font-semibold`
                              : isFailed
                              ? "text-rose-400 font-semibold"
                              : c.faint
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>

                      {stageDetail[step.stage] && (isDone || isCurrent) && (
                        <span className={`text-[11px] ${c.faint}`}>
                          {stageDetail[step.stage]}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Footer note */}
          <div className="max-w-4xl w-full mx-auto text-center text-xs font-mono text-zinc-500">
            Institutional portfolio analytics powered by Wealthzy engine.
          </div>
        </div>
      )}

      {/* Top Header for regular upload screen */}
      <header className={`w-full border-b py-4 px-6 ${isDark ? "border-[#201C19] bg-[#0F0D0C]" : "border-[#EBE4DA] bg-[#FAF7F2]"}`}>
        <div className="max-w-[1140px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div
              className={`w-7 h-7 rounded flex items-center justify-center border font-mono text-xs font-bold transition-colors ${
                isDark
                  ? "bg-[#181513] border-[#2A2420] text-[#FAF7F2] group-hover:border-[#3A7BD5]"
                  : "bg-[#FFFFFF] border-[#DDD5C9] text-[#171412] group-hover:border-[#2E68B8]"
              }`}
            >
              W
            </div>
            <span className="text-sm font-bold tracking-tight uppercase font-mono">WEALTHZY</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className={`text-xs font-mono font-medium px-2.5 py-1 rounded border tracking-wider uppercase ${c.control} ${c.muted}`}>
              PORTFOLIO IMPORT
            </div>
            <button
              onClick={toggleTheme}
              type="button"
              aria-label="Toggle theme"
              className={`w-8 h-8 rounded border flex items-center justify-center transition-colors cursor-pointer ${c.control}`}
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Upload / Review Body */}
      <main className="flex-1 flex items-start justify-center px-4 py-10 md:py-14">
        <div className={`w-full mx-auto space-y-6 ${stage === "needs_review" ? "max-w-3xl" : "max-w-xl"}`}>
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Upload your portfolio</h1>
            <p className={`text-xs sm:text-sm leading-relaxed ${c.muted}`}>
              Upload your holdings as CSV or Excel. Wealthzy identifies each stock, fetches live market data and
              generates your analysis before opening the dashboard.
            </p>
          </div>

          {error && !isFullScreenActive && (
            <div
              role="alert"
              className={`p-3.5 rounded border text-xs font-mono flex items-start gap-3 ${
                isDark ? "bg-[#2B1414] border-[#D9534F]/40 text-[#D9534F]" : "bg-[#FDE8E8] border-[#C0392B]/40 text-[#C0392B]"
              }`}
            >
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
              </svg>
              <div className="space-y-1 min-w-0">
                <p className="font-semibold">{error.message}</p>
                {error.details && (
                  <ul className="list-disc pl-4 opacity-90 space-y-0.5">
                    {error.details.map((d) => (
                      <li key={d} className="break-words">{d}</li>
                    ))}
                  </ul>
                )}
                {error.sessionExpired && (
                  <Link href="/login" className="underline font-semibold">Sign in again &rarr;</Link>
                )}
              </div>
            </div>
          )}

          {/* Drop zone */}
          {(stage === "idle" || stage === "error") && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              className={`rounded border-2 border-dashed p-8 sm:p-10 text-center transition-colors ${
                isDragging
                  ? isDark
                    ? "border-[#3A7BD5] bg-[#1A2535]"
                    : "border-[#2E68B8] bg-[#EEF4FD]"
                  : isDark
                  ? "border-[#2A2420] bg-[#151210] hover:border-[#38302A]"
                  : "border-[#DDD5C9] bg-[#FFFFFF] hover:border-[#C8BFB2]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="portfolio-file-input"
                accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className={`w-12 h-12 rounded border flex items-center justify-center ${c.control} ${c.accent}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Drag &amp; drop your CSV or Excel file here</p>
                  <p className={`text-xs ${c.muted}`}>or browse from your computer</p>
                </div>
                <button
                  type="button"
                  id="btn-browse-files"
                  onClick={() => fileInputRef.current?.click()}
                  className={`h-9 px-4 rounded border text-xs font-mono font-medium transition-colors cursor-pointer ${c.control}`}
                >
                  Browse Files
                </button>
                <div className={`text-[11px] font-mono tracking-wider ${c.faint}`}>
                  Supported: <span className={`font-bold ${c.accent}`}>.csv, .xlsx, .xls</span> (max 10 MB)
                </div>
              </div>
            </div>
          )}

          {selectedFile && stage !== "needs_review" && (
            <div className={`p-4 rounded border flex items-center justify-between ${c.panel}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className={`w-9 h-9 rounded border shrink-0 flex items-center justify-center font-mono text-[10px] font-bold ${
                    isDark ? "bg-[#13241A] border-[#4E9F76]/40 text-[#4E9F76]" : "bg-[#E8F5EE] border-[#2E8555]/40 text-[#2E8555]"
                  }`}
                >
                  {selectedFile.name.toLowerCase().endsWith(".csv") ? "CSV" : "XLS"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate font-mono">{selectedFile.name}</p>
                  <p className={`text-[11px] font-mono ${c.faint}`}>{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              {(stage === "idle" || stage === "error") && (
                <button
                  type="button"
                  id="btn-remove-file"
                  onClick={handleRemoveFile}
                  className={`p-1.5 rounded hover:opacity-80 text-xs font-mono ${c.negative} cursor-pointer`}
                >
                  Remove
                </button>
              )}
            </div>
          )}

          {/* Review step for holdings we could not identify with confidence */}
          {stage === "needs_review" && review && (
            <div className={`rounded border ${c.panel}`}>
              <div className={`p-4 border-b ${c.divider}`}>
                <div className={`text-[10px] font-mono uppercase tracking-wider font-bold ${c.warning}`}>Needs review</div>
                <p className="text-sm font-semibold mt-1">{review.message}</p>
                <p className={`text-xs mt-1 ${c.muted}`}>
                  Choose the correct listing, enter the NSE/BSE symbol, or exclude the holding. Excluded holdings are kept on record but left out of calculations.
                </p>
              </div>

              <div className={`divide-y ${isDark ? "divide-[#27221E]" : "divide-[#E5DFD7]"}`}>
                {reviewItems.map((item) => {
                  const choice = choices[item.rowNumber];
                  const selectValue =
                    choice?.kind === "candidate"
                      ? `${choice.exchange}:${choice.symbol}`
                      : choice?.kind === "manual"
                      ? "__manual"
                      : choice?.kind === "exclude"
                      ? "__exclude"
                      : "";
                  return (
                    <div key={item.rowNumber} className="p-4 space-y-2">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div className="font-mono text-sm font-semibold">&ldquo;{item.input}&rdquo;</div>
                        <div className={`text-[11px] font-mono ${c.faint}`}>
                          Row {item.rowNumber} · Qty {item.quantity} · Avg {inr(item.avgPrice)}
                        </div>
                      </div>
                      {item.note && <p className={`text-xs ${c.warning}`}>{item.note}</p>}
                      {item.symbol && (
                        <p className={`text-[11px] font-mono ${c.muted}`}>
                          Low-confidence suggestion: {item.company} ({item.symbol}, {item.exchange})
                          {item.confidence !== null ? ` · ${Math.round(item.confidence * 100)}% confidence` : ""}
                        </p>
                      )}
                      <select
                        aria-label={`Resolve ${item.input}`}
                        value={selectValue}
                        onChange={(e) => {
                          const v = e.target.value;
                          setChoices((prev) => {
                            const next = { ...prev };
                            if (v === "") next[item.rowNumber] = undefined;
                            else if (v === "__exclude") next[item.rowNumber] = { kind: "exclude" };
                            else if (v === "__manual") next[item.rowNumber] = { kind: "manual", symbol: "", exchange: "NSE" };
                            else {
                              const [exchange, symbol] = v.split(":");
                              next[item.rowNumber] = { kind: "candidate", symbol, exchange: exchange as "NSE" | "BSE" };
                            }
                            return next;
                          });
                        }}
                        className={`w-full h-9 px-2 rounded border text-xs font-mono ${c.control}`}
                      >
                        <option value="">Select the correct stock…</option>
                        {item.candidates.map((cand) => (
                          <option key={`${cand.exchange}:${cand.symbol}`} value={`${cand.exchange}:${cand.symbol}`}>
                            {cand.company} — {cand.symbol} ({cand.exchange})
                          </option>
                        ))}
                        <option value="__manual">Enter symbol manually…</option>
                        <option value="__exclude">Exclude this holding</option>
                      </select>
                      {choice?.kind === "manual" && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={choice.symbol}
                            placeholder="e.g. RELIANCE"
                            aria-label="Stock symbol"
                            onChange={(e) =>
                              setChoices((prev) => ({ ...prev, [item.rowNumber]: { ...choice, symbol: e.target.value } }))
                            }
                            className={`flex-1 h-9 px-2 rounded border text-xs font-mono uppercase ${c.control}`}
                          />
                          <select
                            value={choice.exchange}
                            aria-label="Exchange"
                            onChange={(e) =>
                              setChoices((prev) => ({
                                ...prev,
                                [item.rowNumber]: { ...choice, exchange: e.target.value as "NSE" | "BSE" },
                              }))
                            }
                            className={`h-9 px-2 rounded border text-xs font-mono ${c.control}`}
                          >
                            <option value="NSE">NSE</option>
                            <option value="BSE">BSE</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {review.items.some((i) => i.status === "identified") && (
                <div className={`p-4 border-t ${c.divider}`}>
                  <div className={`text-[10px] font-mono uppercase tracking-wider font-bold mb-2 ${c.positive}`}>
                    Identified
                  </div>
                  <ul className="space-y-1">
                    {review.items
                      .filter((i) => i.status === "identified")
                      .map((i) => (
                        <li key={i.rowNumber} className="flex justify-between gap-3 text-xs font-mono">
                          <span className="truncate">{i.input}</span>
                          <span className={`shrink-0 ${c.muted}`}>
                            {i.symbol} · {i.exchange}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              <div className={`p-4 border-t flex flex-col sm:flex-row gap-2 ${c.divider}`}>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className={`h-10 px-4 rounded border text-xs font-mono ${c.control} cursor-pointer`}
                >
                  Upload a different file
                </button>
                <button
                  type="button"
                  disabled={!allReviewed}
                  onClick={handleSubmitReview}
                  className={`flex-1 h-10 px-4 rounded font-semibold text-xs uppercase tracking-wider ${
                    allReviewed ? `${c.primaryBtn} cursor-pointer` : c.disabledBtn
                  }`}
                >
                  Continue processing
                </button>
              </div>
            </div>
          )}

          {(stage === "idle" || stage === "error") && (
            <div className="space-y-3 pt-2">
              <button
                type="button"
                id="btn-upload-portfolio"
                disabled={!selectedFile}
                onClick={handleUpload}
                className={`w-full h-11 px-4 rounded font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                  selectedFile ? `${c.primaryBtn} cursor-pointer` : c.disabledBtn
                }`}
              >
                {stage === "error" ? "Try again" : "Upload & Analyze Portfolio"}
              </button>
              <div className="flex items-center justify-between text-xs pt-2">
                <Link href="/portfolio-check" className={`font-mono transition-colors ${c.muted}`}>
                  &larr; Back to Question
                </Link>
                {alreadyUploaded && (
                  <Link href="/dashboard" className={`font-mono hover:underline ${c.accent}`}>
                    Go to Dashboard &rarr;
                  </Link>
                )}
              </div>
            </div>
          )}

          {stage === "idle" && (
            <div className={`p-4 rounded border text-[11px] font-mono space-y-2 ${c.panel} ${c.muted}`}>
              <div className={`font-semibold uppercase tracking-wider text-[10px] ${c.accent}`}>Required columns</div>
              <p className="leading-relaxed">
                Column names are detected automatically (Zerodha, Groww, Upstox, Dhan and custom spreadsheets). Your file needs a
                company/symbol, quantity and average buy price.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["Company / Symbol", "Quantity / Qty", "Avg Price / Buy Price", "LTP (optional)", "P&L (optional)"].map((col) => (
                  <span key={col} className={`px-2 py-0.5 rounded border text-[10px] ${c.control}`}>
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className={`w-full border-t py-4 text-center text-xs font-mono ${isDark ? "border-[#201C19] text-[#6E6760]" : "border-[#EBE4DA] text-[#968E85]"}`}>
        &copy; {new Date().getFullYear()} Wealthzy Financial Technologies.
      </footer>
    </div>
  );
}

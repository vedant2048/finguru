import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { PortfolioAnalysis } from "@/lib/ai/portfolioAnalysis";
import { PortfolioError } from "./errors";
import type {
  AnalysisStatus,
  CalculatedPortfolio,
  IdentifiedHolding,
  PerformanceHistory,
  PortfolioHolding,
  SectorAllocation,
} from "./types";

/**
 * Persistence for portfolios. Every query is scoped by the authenticated user's id,
 * so a portfolio id supplied by a client can never reach another user's data.
 */

type HoldingRow = Record<string, unknown>;

function dbError(context: string, error: unknown): PortfolioError {
  console.error(`[portfolio-repo] ${context}:`, error);
  return new PortfolioError("DATABASE_ERROR", "We couldn't save your portfolio right now. Please try again.");
}

function identificationColumns(h: IdentifiedHolding) {
  const id = h.identification;
  return {
    row_number: h.rowNumber,
    input_name: h.company,
    identification_status: id.status,
    identification_method: id.method,
    identification_confidence: id.confidence,
    identification_note: id.note,
    candidates: id.candidates,
    company_name: id.company,
    symbol: id.symbol,
    exchange: id.exchange,
    quantity: h.quantity,
    average_price: h.avgPrice,
    file_current_price: h.currentPrice,
  };
}

function rowToIdentified(r: HoldingRow): IdentifiedHolding {
  return {
    rowNumber: Number(r.row_number),
    company: String(r.input_name),
    symbolHint: null,
    quantity: Number(r.quantity),
    avgPrice: Number(r.average_price),
    currentPrice: r.file_current_price === null ? null : Number(r.file_current_price),
    investedValue: null,
    marketValue: null,
    pnl: null,
    pnlPercentage: null,
    identification: {
      status: r.identification_status as IdentifiedHolding["identification"]["status"],
      company: (r.company_name as string) ?? null,
      symbol: (r.symbol as string) ?? null,
      exchange: (r.exchange as "NSE" | "BSE") ?? null,
      confidence: r.identification_confidence === null ? null : Number(r.identification_confidence),
      method: (r.identification_method as IdentifiedHolding["identification"]["method"]) ?? null,
      note: (r.identification_note as string) ?? null,
      candidates: (r.candidates as IdentifiedHolding["identification"]["candidates"]) ?? [],
    },
  };
}

/** Removes abandoned drafts so only the latest upload is ever in review. */
export async function deleteUnfinishedPortfolios(userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("portfolios")
    .delete()
    .eq("user_id", userId)
    .in("status", ["needs_review", "error"]);
  if (error) throw dbError("delete drafts", error);
}

async function replaceHoldings(portfolioId: number, rows: HoldingRow[]) {
  const { error: delError } = await supabaseAdmin.from("portfolio_holdings").delete().eq("portfolio_id", portfolioId);
  if (delError) throw dbError("delete holdings", delError);
  if (rows.length === 0) return;
  const { error } = await supabaseAdmin
    .from("portfolio_holdings")
    .insert(rows.map((r) => ({ ...r, portfolio_id: portfolioId })));
  if (error) throw dbError("insert holdings", error);
}

/** Saves identified + unresolved holdings so the user can review them without re-uploading. */
export async function saveReviewDraft(userId: string, fileName: string, holdings: IdentifiedHolding[]): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("portfolios")
    .insert({ user_id: userId, source_file_name: fileName, status: "needs_review", holdings_count: holdings.length })
    .select("id")
    .single();
  if (error || !data) throw dbError("insert draft", error);
  await replaceHoldings(data.id, holdings.map(identificationColumns));
  return data.id;
}

export async function loadReviewDraft(
  userId: string,
  portfolioId: number
): Promise<{ fileName: string; holdings: IdentifiedHolding[] }> {
  const { data: portfolio, error } = await supabaseAdmin
    .from("portfolios")
    .select("id, source_file_name, status")
    .eq("id", portfolioId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw dbError("load draft", error);
  if (!portfolio || portfolio.status !== "needs_review") {
    throw new PortfolioError("NOT_FOUND", "This portfolio review has expired. Please upload your file again.");
  }
  const { data: rows, error: hErr } = await supabaseAdmin
    .from("portfolio_holdings")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .order("row_number");
  if (hErr) throw dbError("load draft holdings", hErr);
  return { fileName: portfolio.source_file_name ?? "portfolio", holdings: (rows ?? []).map(rowToIdentified) };
}

export async function savePortfolio(params: {
  userId: string;
  draftId: number | null;
  fileName: string;
  calculated: CalculatedPortfolio;
  history: PerformanceHistory;
  excluded: IdentifiedHolding[];
  identified: IdentifiedHolding[];
  provider: string;
}): Promise<number> {
  const { userId, calculated, history } = params;
  const record = {
    user_id: userId,
    source_file_name: params.fileName,
    status: "completed",
    total_invested: calculated.summary.totalInvested,
    total_current_value: calculated.summary.totalCurrentValue,
    total_pnl: calculated.summary.totalProfitLoss,
    total_return_percentage: calculated.summary.totalReturnPercentage,
    holdings_count: calculated.summary.holdingsCount,
    sector_allocation: calculated.sectorAllocation,
    performance_history: history,
    analysis: null,
    analysis_status: null,
    analysis_error: null,
    market_data_provider: params.provider,
    processed_at: new Date().toISOString(),
  };

  let portfolioId = params.draftId;
  if (portfolioId) {
    const { data, error } = await supabaseAdmin
      .from("portfolios")
      .update(record)
      .eq("id", portfolioId)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();
    if (error || !data) throw dbError("update portfolio", error);
  } else {
    const { data, error } = await supabaseAdmin.from("portfolios").insert(record).select("id").single();
    if (error || !data) throw dbError("insert portfolio", error);
    portfolioId = data.id as number;
  }

  const byRow = new Map(params.identified.map((h) => [h.rowNumber, h]));
  const holdingRows: HoldingRow[] = calculated.holdings.map((h) => ({
    ...identificationColumns(byRow.get(h.rowNumber)!),
    input_name: h.inputName,
    quantity: h.quantity,
    average_price: h.avgPrice,
    company_name: h.company,
    symbol: h.symbol,
    exchange: h.exchange,
    current_price: h.currentPrice,
    price_source: h.priceSource,
    invested_value: h.investedValue,
    current_value: h.currentValue,
    pnl: h.profitLoss,
    pnl_percentage: h.returnPercentage,
    allocation_percentage: h.allocationPercentage,
    sector: h.sector,
    industry: h.industry,
    market_data: h.market,
  }));
  // Holdings the user excluded during review are kept, clearly marked, rather than deleted.
  holdingRows.push(...params.excluded.map(identificationColumns));
  await replaceHoldings(portfolioId, holdingRows);

  // Keep the profile flag in sync for other parts of the app; routing relies on portfolio status.
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({ has_portfolio: true, portfolio_uploaded: true })
    .eq("user_id", userId);
  if (profileError) console.warn("[portfolio-repo] Could not update profile flag:", profileError.message);

  // Superseded portfolios are removed once the new one is safely stored.
  const { error: cleanupError } = await supabaseAdmin
    .from("portfolios")
    .delete()
    .eq("user_id", userId)
    .neq("id", portfolioId);
  if (cleanupError) console.warn("[portfolio-repo] Could not remove old portfolios:", cleanupError.message);

  return portfolioId;
}

export async function saveAnalysis(
  userId: string,
  portfolioId: number,
  status: AnalysisStatus,
  analysis: PortfolioAnalysis | null,
  errorMessage: string | null
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("portfolios")
    .update({ analysis, analysis_status: status, analysis_error: errorMessage })
    .eq("id", portfolioId)
    .eq("user_id", userId);
  if (error) throw dbError("save analysis", error);
}

export async function hasCompletedPortfolio(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("portfolios")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .limit(1);
  if (error) {
    console.error("[portfolio-repo] hasCompletedPortfolio:", error.message);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

export interface StoredPortfolio extends CalculatedPortfolio {
  id: number;
  fileName: string | null;
  processedAt: string | null;
  history: PerformanceHistory | null;
  analysis: PortfolioAnalysis | null;
  analysisStatus: AnalysisStatus | null;
  analysisError: string | null;
  excluded: { rowNumber: number; inputName: string; quantity: number; avgPrice: number }[];
}

function rowToHolding(r: HoldingRow): PortfolioHolding {
  const n = (v: unknown) => (v === null || v === undefined ? null : Number(v));
  return {
    id: Number(r.id),
    rowNumber: Number(r.row_number),
    inputName: String(r.input_name),
    company: String(r.company_name ?? r.input_name),
    symbol: String(r.symbol),
    exchange: r.exchange as "NSE" | "BSE",
    quantity: Number(r.quantity),
    avgPrice: Number(r.average_price),
    currentPrice: Number(r.current_price),
    priceSource: (r.price_source as "market" | "file") ?? "market",
    investedValue: Number(r.invested_value),
    currentValue: Number(r.current_value),
    profitLoss: Number(r.pnl),
    returnPercentage: n(r.pnl_percentage),
    allocationPercentage: Number(r.allocation_percentage),
    sector: String(r.sector ?? "Unclassified"),
    industry: (r.industry as string) ?? null,
    identificationMethod: (r.identification_method as PortfolioHolding["identificationMethod"]) ?? null,
    identificationConfidence: n(r.identification_confidence),
    market: (r.market_data as PortfolioHolding["market"]) ?? null,
  };
}

/** Loads a completed portfolio for its owner. Pass portfolioId to load a specific one. */
export async function getCompletedPortfolio(userId: string, portfolioId?: number): Promise<StoredPortfolio | null> {
  let query = supabaseAdmin.from("portfolios").select("*").eq("user_id", userId).eq("status", "completed");
  if (portfolioId !== undefined) query = query.eq("id", portfolioId);
  const { data: p, error } = await query.order("processed_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw dbError("load portfolio", error);
  if (!p) return null;

  const { data: rows, error: hErr } = await supabaseAdmin
    .from("portfolio_holdings")
    .select("*")
    .eq("portfolio_id", p.id)
    .order("current_value", { ascending: false, nullsFirst: false });
  if (hErr) throw dbError("load holdings", hErr);

  const active = (rows ?? []).filter((r) => r.identification_status === "identified").map(rowToHolding);
  const excluded = (rows ?? [])
    .filter((r) => r.identification_status === "excluded")
    .map((r) => ({
      rowNumber: Number(r.row_number),
      inputName: String(r.input_name),
      quantity: Number(r.quantity),
      avgPrice: Number(r.average_price),
    }));
  const sectorAllocation = (p.sector_allocation ?? []) as SectorAllocation[];
  const largest = active[0];

  return {
    id: p.id,
    fileName: p.source_file_name,
    processedAt: p.processed_at,
    holdings: active,
    excluded,
    sectorAllocation,
    history: p.performance_history,
    analysis: p.analysis,
    analysisStatus: p.analysis_status,
    analysisError: p.analysis_error,
    summary: {
      totalInvested: Number(p.total_invested),
      totalCurrentValue: Number(p.total_current_value),
      totalProfitLoss: Number(p.total_pnl),
      totalReturnPercentage: p.total_return_percentage === null ? null : Number(p.total_return_percentage),
      holdingsCount: Number(p.holdings_count),
      largestHolding: largest
        ? { symbol: largest.symbol, company: largest.company, allocationPercentage: largest.allocationPercentage }
        : null,
      largestSector: sectorAllocation[0]
        ? { sector: sectorAllocation[0].sector, allocationPercentage: sectorAllocation[0].allocationPercentage }
        : null,
    },
  };
}

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { StockFundamentals, Exchange } from "./types";

interface MemoryCacheEntry {
  data: StockFundamentals;
  expiresAt: number;
}

const memoryCache = new Map<string, MemoryCacheEntry>();
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
let warnedDbUnavailable = false;

function mapRowToFundamentals(row: Record<string, unknown>): StockFundamentals {
  return {
    symbol: String(row.symbol),
    exchange: (row.exchange as Exchange) || "NSE",
    tickerWithSuffix: String(row.ticker_with_suffix),
    name: row.name ? String(row.name) : undefined,
    sector: row.sector ? String(row.sector) : undefined,
    marketCap: row.market_cap != null ? Number(row.market_cap) : null,
    trailingPE: row.trailing_pe != null ? Number(row.trailing_pe) : null,
    returnOnEquity: row.return_on_equity != null ? Number(row.return_on_equity) : null,
    debtToEquity: row.debt_to_equity != null ? Number(row.debt_to_equity) : null,
    industryPe: row.industry_pe != null ? Number(row.industry_pe) : null,
    roce: row.roce != null ? Number(row.roce) : null,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    rawData: (row.raw_data as Record<string, unknown>) || undefined,
  };
}

/**
 * Retrieve cached fundamentals for the requested ticker symbols.
 * Checks Supabase PostgreSQL first; falls back seamlessly to memory cache.
 */
export async function getCachedFundamentals(
  tickersWithSuffix: string[]
): Promise<Map<string, StockFundamentals>> {
  const result = new Map<string, StockFundamentals>();
  const now = Date.now();

  // 1. Check in-memory cache first for instant hits (ensure enriched with ROCE)
  const missingFromMemory: string[] = [];
  for (const ticker of tickersWithSuffix) {
    const mem = memoryCache.get(ticker.toUpperCase());
    if (mem && mem.expiresAt > now && mem.data.roce != null) {
      result.set(ticker.toUpperCase(), mem.data);
    } else {
      missingFromMemory.push(ticker.toUpperCase());
    }
  }

  if (missingFromMemory.length === 0) {
    return result;
  }

  // 2. Query existing Supabase database
  try {
    const { data, error } = await supabaseAdmin
      .from("stock_fundamentals_cache")
      .select("*")
      .in("ticker_with_suffix", missingFromMemory)
      .gt("expires_at", new Date(now).toISOString());

    if (error) {
      if (!warnedDbUnavailable) {
        console.warn(
          "[fundamentals-cache] Supabase stock_fundamentals_cache notice:",
          error.message || error
        );
        warnedDbUnavailable = true;
      }
    } else if (Array.isArray(data)) {
      for (const row of data) {
        const item = mapRowToFundamentals(row as Record<string, unknown>);
        const key = item.tickerWithSuffix.toUpperCase();
        if (item.roce != null) {
          result.set(key, item);
          const expiresTime = row.expires_at ? new Date(String(row.expires_at)).getTime() : now + CACHE_TTL_MS;
          memoryCache.set(key, { data: item, expiresAt: expiresTime });
        }
      }
    }
  } catch (err: unknown) {
    if (!warnedDbUnavailable) {
      console.warn("[fundamentals-cache] Error querying Supabase cache:", err);
      warnedDbUnavailable = true;
    }
  }

  return result;
}

/**
 * Persist fetched fundamentals into Supabase stock_fundamentals_cache table,
 * and mirror in the in-memory cache.
 */
export async function saveCachedFundamentals(items: StockFundamentals[]): Promise<void> {
  if (items.length === 0) return;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);

  // 1. Save to in-memory cache immediately
  for (const item of items) {
    const key = item.tickerWithSuffix.toUpperCase();
    memoryCache.set(key, { data: item, expiresAt: expiresAt.getTime() });
  }

  // 2. Upsert to Supabase in background without blocking
  const rows = items.map((item) => ({
    ticker_with_suffix: item.tickerWithSuffix.toUpperCase(),
    symbol: item.symbol.toUpperCase(),
    exchange: item.exchange,
    name: item.name ?? null,
    sector: item.sector ?? null,
    market_cap: item.marketCap,
    trailing_pe: item.trailingPE,
    return_on_equity: item.returnOnEquity,
    debt_to_equity: item.debtToEquity,
    industry_pe: item.industryPe ?? null,
    roce: item.roce ?? null,
    raw_data: item.rawData ?? null,
    updated_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  }));

  Promise.resolve(
    supabaseAdmin
      .from("stock_fundamentals_cache")
      .upsert(rows, { onConflict: "ticker_with_suffix" })
  )
    .then(({ error }) => {
      if (error && !warnedDbUnavailable) {
        console.warn(
          "[fundamentals-cache] Notice: Could not upsert into Supabase stock_fundamentals_cache:",
          error.message || error
        );
        warnedDbUnavailable = true;
      }
    })
    .catch((err: unknown) => {
      if (!warnedDbUnavailable) {
        console.warn("[fundamentals-cache] Notice: Database save error:", err instanceof Error ? err.message : err);
        warnedDbUnavailable = true;
      }
    });
}


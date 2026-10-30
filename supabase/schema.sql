-- Supabase schema for Wealthzy portfolio onboarding & portfolio import pipeline.
-- Idempotent: safe to re-run in the Supabase SQL Editor.
--
-- Ownership: profiles.user_id is the authenticated user's id (NextAuth Google account id).
-- All portfolio reads/writes go through server-side API routes that verify the session and
-- filter by user_id. RLS is enabled so the anon/authenticated keys can never read another
-- user's rows directly; the server uses the service-role key.

-- ─────────────────────────────────────────────────────────────
-- 1. profiles: onboarding columns
-- ─────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS has_portfolio BOOLEAN DEFAULT NULL;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS portfolio_uploaded BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- portfolios.user_id references this column, so it must be unique (NextAuth upserts on it).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass AND contype IN ('u', 'p')
      AND conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'user_id')]
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 2. portfolios
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.portfolios (
  id                      BIGSERIAL PRIMARY KEY,
  user_id                 TEXT NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  name                    TEXT NOT NULL DEFAULT 'My Portfolio',
  source_file_name        TEXT,
  status                  TEXT NOT NULL CHECK (status IN ('needs_review', 'completed', 'error')),
  total_invested          NUMERIC(18, 2),
  total_current_value     NUMERIC(18, 2),
  total_pnl               NUMERIC(18, 2),
  total_return_percentage NUMERIC(10, 2),
  holdings_count          INT NOT NULL DEFAULT 0,
  sector_allocation       JSONB NOT NULL DEFAULT '[]'::jsonb,
  performance_history     JSONB,
  analysis                JSONB,
  analysis_status         TEXT CHECK (analysis_status IN ('completed', 'failed', 'unavailable')),
  analysis_error          TEXT,
  market_data_provider    TEXT,
  processed_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user_status ON public.portfolios (user_id, status, processed_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 3. portfolio_holdings
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
  id                        BIGSERIAL PRIMARY KEY,
  portfolio_id              BIGINT NOT NULL REFERENCES public.portfolios (id) ON DELETE CASCADE,
  row_number                INT NOT NULL,
  input_name                TEXT NOT NULL,
  identification_status     TEXT NOT NULL CHECK (identification_status IN ('identified', 'needs_review', 'excluded')),
  identification_method     TEXT,
  identification_confidence NUMERIC(4, 3),
  identification_note       TEXT,
  candidates                JSONB NOT NULL DEFAULT '[]'::jsonb,
  company_name              TEXT,
  symbol                    TEXT,
  exchange                  TEXT CHECK (exchange IN ('NSE', 'BSE')),
  quantity                  NUMERIC(18, 4) NOT NULL,
  average_price             NUMERIC(18, 4) NOT NULL,
  file_current_price        NUMERIC(18, 4),
  current_price             NUMERIC(18, 4),
  price_source              TEXT CHECK (price_source IN ('market', 'file')),
  invested_value            NUMERIC(18, 2),
  current_value             NUMERIC(18, 2),
  pnl                       NUMERIC(18, 2),
  pnl_percentage            NUMERIC(10, 2),
  allocation_percentage     NUMERIC(6, 2),
  sector                    TEXT,
  industry                  TEXT,
  market_data               JSONB,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio ON public.portfolio_holdings (portfolio_id);

-- ─────────────────────────────────────────────────────────────
-- 4. updated_at maintenance
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_portfolios_updated_at ON public.portfolios;
CREATE TRIGGER trg_portfolios_updated_at BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_portfolio_holdings_updated_at ON public.portfolio_holdings;
CREATE TRIGGER trg_portfolio_holdings_updated_at BEFORE UPDATE ON public.portfolio_holdings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 5. Row Level Security
-- A user may only see portfolios whose owning profile carries their verified email.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own portfolio" ON public.portfolios;
DROP POLICY IF EXISTS "Users can insert own portfolio" ON public.portfolios;
DROP POLICY IF EXISTS "Users can update own portfolio" ON public.portfolios;
DROP POLICY IF EXISTS "portfolios_owner_all" ON public.portfolios;
CREATE POLICY "portfolios_owner_all" ON public.portfolios
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = portfolios.user_id AND p.email = auth.jwt() ->> 'email'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = portfolios.user_id AND p.email = auth.jwt() ->> 'email'
  ));

DROP POLICY IF EXISTS "portfolio_holdings_owner_all" ON public.portfolio_holdings;
CREATE POLICY "portfolio_holdings_owner_all" ON public.portfolio_holdings
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.portfolios pf
    JOIN public.profiles p ON p.user_id = pf.user_id
    WHERE pf.id = portfolio_holdings.portfolio_id AND p.email = auth.jwt() ->> 'email'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.portfolios pf
    JOIN public.profiles p ON p.user_id = pf.user_id
    WHERE pf.id = portfolio_holdings.portfolio_id AND p.email = auth.jwt() ->> 'email'
  ));


-- ─────────────────────────────────────────────────────────────
-- 6. stock_fundamentals_cache (Yahoo Finance fundamentals cache)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stock_fundamentals_cache (
  ticker_with_suffix      TEXT PRIMARY KEY,
  symbol                  TEXT NOT NULL,
  exchange                TEXT NOT NULL DEFAULT 'NSE',
  name                    TEXT,
  sector                  TEXT,
  market_cap              NUMERIC(18, 2),
  trailing_pe             NUMERIC(10, 2),
  return_on_equity        NUMERIC(10, 4),
  debt_to_equity          NUMERIC(10, 4),
  industry_pe             NUMERIC(10, 2),
  roce                    NUMERIC(10, 4),
  raw_data                JSONB,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at              TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '12 hours'
);

CREATE INDEX IF NOT EXISTS idx_stock_fundamentals_symbol ON public.stock_fundamentals_cache (symbol, exchange);
CREATE INDEX IF NOT EXISTS idx_stock_fundamentals_expires ON public.stock_fundamentals_cache (expires_at);

DROP TRIGGER IF EXISTS trg_stock_fundamentals_updated_at ON public.stock_fundamentals_cache;
CREATE TRIGGER trg_stock_fundamentals_updated_at BEFORE UPDATE ON public.stock_fundamentals_cache
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.stock_fundamentals_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stock_fundamentals_public_read" ON public.stock_fundamentals_cache;
CREATE POLICY "stock_fundamentals_public_read" ON public.stock_fundamentals_cache
  FOR SELECT USING (true);

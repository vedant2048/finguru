import type {
  CalculatedPortfolio,
  IdentifiedHolding,
  MarketQuote,
  PerformanceHistory,
  PortfolioHolding,
  PricePoint,
  SectorAllocation,
} from "./types";

export const UNCLASSIFIED_SECTOR = "Unclassified";

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Pure calculation engine. All values derive from the user's quantities / average prices
 * and the market-data quote. `quote` may be null only when the file supplied a current price.
 */
export function calculatePortfolioMetrics(
  entries: { holding: IdentifiedHolding; quote: MarketQuote | null }[]
): CalculatedPortfolio {
  const base = entries.map(({ holding, quote }) => {
    const currentPrice = quote?.currentPrice ?? holding.currentPrice;
    if (currentPrice === null || currentPrice === undefined) {
      throw new Error(`No current price for row ${holding.rowNumber}`);
    }
    const id = holding.identification;
    const investedValue = holding.quantity * holding.avgPrice;
    const currentValue = holding.quantity * currentPrice;
    const profitLoss = currentValue - investedValue;

    const market = quote
      ? {
          currency: quote.currency,
          previousClose: quote.previousClose,
          marketCap: quote.marketCap,
          pe: quote.pe,
          eps: quote.eps,
          week52High: quote.week52High,
          week52Low: quote.week52Low,
          volume: quote.volume,
          sector: quote.sector,
          industry: quote.industry,
          dividendYield: quote.dividendYield,
          asOf: quote.asOf,
        }
      : null;

    return {
      rowNumber: holding.rowNumber,
      inputName: holding.company,
      company: id.company ?? holding.company,
      symbol: id.symbol!,
      exchange: id.exchange!,
      quantity: holding.quantity,
      avgPrice: round2(holding.avgPrice),
      currentPrice: round2(currentPrice),
      priceSource: quote ? "market" : "file",
      investedValue,
      currentValue,
      profitLoss,
      returnPercentage: investedValue > 0 ? (profitLoss / investedValue) * 100 : null,
      allocationPercentage: 0,
      sector: quote?.sector || UNCLASSIFIED_SECTOR,
      industry: quote?.industry ?? null,
      identificationMethod: id.method,
      identificationConfidence: id.confidence,
      market,
    } satisfies PortfolioHolding;
  });

  const totalInvested = base.reduce((s, h) => s + h.investedValue, 0);
  const totalCurrentValue = base.reduce((s, h) => s + h.currentValue, 0);
  const totalProfitLoss = totalCurrentValue - totalInvested;

  const holdings: PortfolioHolding[] = base
    .map((h) => ({
      ...h,
      investedValue: round2(h.investedValue),
      currentValue: round2(h.currentValue),
      profitLoss: round2(h.profitLoss),
      returnPercentage: h.returnPercentage === null ? null : round2(h.returnPercentage),
      allocationPercentage: totalCurrentValue > 0 ? round2((h.currentValue / totalCurrentValue) * 100) : 0,
    }))
    .sort((a, b) => b.currentValue - a.currentValue);

  const sectors = new Map<string, { value: number; count: number }>();
  for (const h of base) {
    const s = sectors.get(h.sector) ?? { value: 0, count: 0 };
    s.value += h.currentValue;
    s.count += 1;
    sectors.set(h.sector, s);
  }
  const sectorAllocation: SectorAllocation[] = [...sectors.entries()]
    .map(([sector, s]) => ({
      sector,
      currentValue: round2(s.value),
      allocationPercentage: totalCurrentValue > 0 ? round2((s.value / totalCurrentValue) * 100) : 0,
      holdingsCount: s.count,
    }))
    .sort((a, b) => b.currentValue - a.currentValue);

  const largest = holdings[0];
  const largestSector = sectorAllocation[0];

  return {
    holdings,
    sectorAllocation,
    summary: {
      totalInvested: round2(totalInvested),
      totalCurrentValue: round2(totalCurrentValue),
      totalProfitLoss: round2(totalProfitLoss),
      totalReturnPercentage: totalInvested > 0 ? round2((totalProfitLoss / totalInvested) * 100) : null,
      holdingsCount: holdings.length,
      largestHolding: largest
        ? { symbol: largest.symbol, company: largest.company, allocationPercentage: largest.allocationPercentage }
        : null,
      largestSector: largestSector
        ? { sector: largestSector.sector, allocationPercentage: largestSector.allocationPercentage }
        : null,
    },
  };
}

/**
 * Historical value of the current holdings: Σ quantity × closing price on each date.
 * Only dates on which every holding has a price are included (a holding's last close is
 * carried forward over exchange holidays). If any holding has no history, none is produced.
 */
export function buildPortfolioHistory(
  holdings: { symbol: string; exchange: string; quantity: number }[],
  histories: Map<string, PricePoint[]>
): PerformanceHistory {
  const missing = holdings.filter((h) => !(histories.get(`${h.exchange}:${h.symbol}`)?.length));
  if (holdings.length === 0 || missing.length > 0) {
    return {
      available: false,
      note:
        missing.length > 0
          ? `Historical prices are unavailable for ${missing.map((m) => m.symbol).join(", ")}, so a portfolio history can't be calculated.`
          : "No holdings.",
      points: [],
    };
  }

  const series = holdings.map((h) => ({
    quantity: h.quantity,
    points: [...histories.get(`${h.exchange}:${h.symbol}`)!].sort((a, b) => a.date.localeCompare(b.date)),
  }));
  const start = series.reduce((max, s) => (s.points[0].date > max ? s.points[0].date : max), "");
  const dates = [...new Set(series.flatMap((s) => s.points.map((p) => p.date)))].filter((d) => d >= start).sort();

  const cursors = series.map(() => 0);
  const points = dates.map((date) => {
    let value = 0;
    series.forEach((s, i) => {
      while (cursors[i] + 1 < s.points.length && s.points[cursors[i] + 1].date <= date) cursors[i]++;
      value += s.quantity * s.points[cursors[i]].close;
    });
    return { date, value: round2(value) };
  });

  return {
    available: points.length > 1,
    note: points.length > 1 ? null : "Not enough overlapping price history to chart.",
    points,
  };
}

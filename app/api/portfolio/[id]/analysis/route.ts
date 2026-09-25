import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/requireUser";
import { toUserFacingError } from "@/lib/portfolio/errors";
import { runPortfolioAnalysis } from "@/lib/portfolio/pipeline";
import { getCompletedPortfolio } from "@/lib/portfolio/repository";

export const runtime = "nodejs";
export const maxDuration = 300;

/** POST → regenerates the AI analysis for the caller's own portfolio. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Your session has expired. Please sign in again." },
      { status: 401 }
    );
  }

  const portfolioId = Number((await params).id);
  if (!Number.isSafeInteger(portfolioId) || portfolioId <= 0) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Portfolio not found." }, { status: 404 });
  }

  try {
    const portfolio = await getCompletedPortfolio(user.id, portfolioId);
    if (!portfolio) {
      return NextResponse.json({ code: "NOT_FOUND", message: "Portfolio not found." }, { status: 404 });
    }
    const history = portfolio.history ?? { available: false, note: "History unavailable.", points: [] };
    const status = await runPortfolioAnalysis(user.id, portfolio.id, portfolio, history);
    const updated = await getCompletedPortfolio(user.id, portfolioId);
    return NextResponse.json({
      analysisStatus: status,
      analysis: updated?.analysis ?? null,
      analysisError: updated?.analysisError ?? null,
    });
  } catch (err) {
    return NextResponse.json(toUserFacingError(err), { status: 500 });
  }
}

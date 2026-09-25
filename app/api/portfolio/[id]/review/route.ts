import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth/requireUser";
import { resumePortfolioAfterReview } from "@/lib/portfolio/pipeline";
import { streamPipeline } from "@/lib/portfolio/stream";

export const runtime = "nodejs";
export const maxDuration = 300;

const BodySchema = z.object({
  resolutions: z
    .array(
      z.discriminatedUnion("action", [
        z.object({
          rowNumber: z.number().int().positive(),
          action: z.literal("select"),
          symbol: z.string().trim().min(1).max(20),
          exchange: z.enum(["NSE", "BSE"]),
        }),
        z.object({ rowNumber: z.number().int().positive(), action: z.literal("exclude") }),
      ])
    )
    .max(500),
});

/** POST { resolutions } → resumes a paused upload; NDJSON stream of PipelineEvent. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ code: "INVALID_REQUEST", message: "Invalid review request." }, { status: 400 });
  }

  // Ownership is enforced inside the pipeline: the draft is loaded by (id, user.id).
  return streamPipeline((emit) =>
    resumePortfolioAfterReview({ userId: user.id, portfolioId, resolutions: parsed.data.resolutions }, emit)
  );
}

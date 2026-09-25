import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/requireUser";
import { assertSupportedUpload } from "@/lib/portfolio/fileParser";
import { PortfolioError, toUserFacingError } from "@/lib/portfolio/errors";
import { processPortfolioUpload } from "@/lib/portfolio/pipeline";
import { streamPipeline } from "@/lib/portfolio/stream";

export const runtime = "nodejs";
export const maxDuration = 300;

/** POST multipart/form-data { file } → NDJSON stream of PipelineEvent. */
export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Your session has expired. Please sign in again." },
      { status: 401 }
    );
  }

  let file: File;
  try {
    const form = await req.formData();
    const value = form.get("file");
    if (!(value instanceof File)) {
      throw new PortfolioError("INVALID_REQUEST", "Please choose a CSV or Excel file to upload.");
    }
    assertSupportedUpload(value.name, value.size);
    file = value;
  } catch (err) {
    return NextResponse.json(toUserFacingError(err), { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return streamPipeline((emit) =>
    processPortfolioUpload({ userId: user.id, fileName: file.name, buffer }, emit)
  );
}

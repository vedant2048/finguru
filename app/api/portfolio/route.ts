import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/requireUser";
import { toUserFacingError } from "@/lib/portfolio/errors";
import { getCompletedPortfolio } from "@/lib/portfolio/repository";

export const runtime = "nodejs";

/** GET → the signed-in user's latest processed portfolio. Never accepts a user id from the client. */
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Your session has expired. Please sign in again." },
      { status: 401 }
    );
  }
  try {
    const portfolio = await getCompletedPortfolio(user.id);
    if (!portfolio) {
      return NextResponse.json({ code: "NOT_FOUND", message: "No processed portfolio yet." }, { status: 404 });
    }
    return NextResponse.json({ portfolio });
  } catch (err) {
    return NextResponse.json(toUserFacingError(err), { status: 500 });
  }
}

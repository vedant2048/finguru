import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserProfile, updateHasPortfolio, getOnboardingRoute } from "@/lib/onboarding";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const profile = await getUserProfile(session.user.email);
    const targetRoute = profile ? getOnboardingRoute(profile) : "/portfolio-check";

    return NextResponse.json({
      success: true,
      has_portfolio: profile?.has_portfolio ?? null,
      portfolio_uploaded: profile?.portfolio_uploaded ?? false,
      targetRoute,
    });
  } catch (error: any) {
    console.error("[api/onboarding] GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { has_portfolio } = body;

    if (typeof has_portfolio !== "boolean") {
      return NextResponse.json(
        { error: "Invalid value for has_portfolio. Must be true or false." },
        { status: 400 }
      );
    }

    const result = await updateHasPortfolio(session.user.email, has_portfolio);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update portfolio status." },
        { status: 500 }
      );
    }

    // Determine target route immediately
    const targetRoute = has_portfolio ? "/portfolio-upload" : "/knowing-customer";

    return NextResponse.json({
      success: true,
      has_portfolio,
      targetRoute,
      message: "Portfolio onboarding status updated successfully.",
    });
  } catch (error: any) {
    console.error("[api/onboarding] POST error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while saving your choice." },
      { status: 500 }
    );
  }
}

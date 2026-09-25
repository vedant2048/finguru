import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getUserProfile, getOnboardingRoute } from "@/lib/onboarding";
import { PortfolioCheckClient } from "./portfolio-check-client";

export default async function PortfolioCheckPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const profile = await getUserProfile(session.user.email);

  // If user already answered and completed their flow, redirect them appropriately
  if (profile) {
    const route = getOnboardingRoute(profile);
    if (route !== "/portfolio-check") {
      redirect(route);
    }
  }

  return <PortfolioCheckClient userEmail={session.user.email} userName={session.user.name || "Investor"} />;
}

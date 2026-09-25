import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/requireUser";
import { getUserProfile, getOnboardingRoute } from "@/lib/onboarding";
import { getCompletedPortfolio } from "@/lib/portfolio/repository";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  // 1. Unauthenticated users are redirected to login
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Resolve onboarding state server-side so typing /dashboard can't bypass it:
  // - has_portfolio === null  -> /portfolio-check
  // - has_portfolio === false -> /knowing-customer
  // - has_portfolio === true without a successfully processed portfolio -> /portfolio-upload
  const profile = await getUserProfile(user.email);
  const targetRoute = profile ? getOnboardingRoute(profile) : "/portfolio-check";
  if (targetRoute !== "/dashboard") {
    redirect(targetRoute);
  }

  // 3. Load the processed portfolio — the single source of truth for every number on the page.
  const portfolio = await getCompletedPortfolio(user.id);
  if (!portfolio) {
    redirect("/portfolio-upload");
  }

  return <DashboardClient userName={user.name ?? undefined} portfolio={portfolio} />;
}

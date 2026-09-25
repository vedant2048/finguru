import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getUserProfile, getOnboardingRoute } from "@/lib/onboarding";
import { KnowingCustomerClient } from "./knowing-customer-client";

export default async function KnowingCustomerPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const profile = await getUserProfile(session.user.email);

  if (profile) {
    const route = getOnboardingRoute(profile);
    // If the user's state is not meant for knowing-customer, redirect them
    if (route !== "/knowing-customer") {
      redirect(route);
    }
  } else {
    // If no profile exists, go to portfolio-check
    redirect("/portfolio-check");
  }

  return <KnowingCustomerClient userEmail={session.user.email} />;
}

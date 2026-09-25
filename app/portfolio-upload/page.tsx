import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/onboarding";
import { PortfolioUploadClient } from "./portfolio-upload-client";

export default async function PortfolioUploadPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const profile = await getUserProfile(session.user.email);

  if (!profile || profile.has_portfolio === null || profile.has_portfolio === undefined) {
    redirect("/portfolio-check");
  }

  if (profile.has_portfolio === false) {
    redirect("/knowing-customer");
  }

  return (
    <PortfolioUploadClient
      userEmail={session.user.email}
      alreadyUploaded={Boolean(profile.portfolio_uploaded)}
    />
  );
}

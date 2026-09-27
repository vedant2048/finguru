import { getAuthenticatedUser } from "@/lib/auth/requireUser";
import { getCompletedPortfolio } from "@/lib/portfolio/repository";
import { PortfolioClient } from "./portfolio-client";

export default async function PortfolioPage() {
  const user = await getAuthenticatedUser();
  const portfolio = user ? await getCompletedPortfolio(user.id).catch(() => null) : null;

  return (
    <PortfolioClient
      initialPortfolio={portfolio}
      userName={user?.name ?? undefined}
    />
  );
}


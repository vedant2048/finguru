import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/requireUser";
import { getUserProfile } from "@/lib/onboarding";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getUserProfile(user.email);
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || user.name || "";

  return (
    <ProfileClient
      initialProfile={{
        id: profile?.id,
        userId: profile?.user_id,
        email: profile?.email || user.email,
        firstName: profile?.first_name || "",
        lastName: profile?.last_name || "",
        fullName: fullName || "Investor",
        phoneNo: profile?.phone_no || "",
        dob: profile?.dob || "",
        hasPortfolio: profile?.has_portfolio ?? false,
      }}
    />
  );
}

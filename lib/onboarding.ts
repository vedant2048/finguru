import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasCompletedPortfolio } from "@/lib/portfolio/repository";

export interface UserProfileState {
  id?: number | string;
  email: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  phone_no?: string | null;
  dob?: string | null;
  has_portfolio: boolean | null;
  portfolio_uploaded: boolean;
}

export type OnboardingRoute =
  | "/portfolio-check"
  | "/knowing-customer"
  | "/portfolio-upload"
  | "/dashboard";

/**
 * Pure state resolver according to Wealthzy specifications:
 *
 * IF has_portfolio === NULL
 *     → /portfolio-check
 * IF has_portfolio === false
 *     → /knowing-customer
 * IF has_portfolio === true AND portfolio_uploaded === false
 *     → /portfolio-upload
 * IF has_portfolio === true AND portfolio_uploaded === true
 *     → /dashboard
 */
export function getOnboardingRoute(state: {
  has_portfolio: boolean | null | undefined;
  portfolio_uploaded?: boolean | null | undefined;
}): OnboardingRoute {
  if (state.has_portfolio === null || state.has_portfolio === undefined) {
    return "/portfolio-check";
  }

  if (state.has_portfolio === false) {
    return "/knowing-customer";
  }

  if (state.has_portfolio === true) {
    if (Boolean(state.portfolio_uploaded)) {
      return "/dashboard";
    }
    return "/portfolio-upload";
  }

  return "/portfolio-check";
}

/**
 * Fetch authenticated user's profile and current onboarding state from Supabase.
 */
export async function getUserProfile(email: string): Promise<UserProfileState | null> {
  if (!email) return null;

  try {
    // Attempt to query all relevant profile columns
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("email", email)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[onboarding] Error fetching profile from Supabase:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Only a fully processed portfolio unlocks the dashboard; the profile flag alone is not trusted.
    const portfolioUploaded =
      data.has_portfolio === true && data.user_id ? await hasCompletedPortfolio(String(data.user_id)) : false;

    return {
      id: data.id,
      email: data.email,
      user_id: data.user_id,
      first_name: data.first_name,
      last_name: data.last_name,
      phone_no: data.phone_no,
      dob: data.dob,
      has_portfolio: data.has_portfolio !== undefined ? data.has_portfolio : null,
      portfolio_uploaded: portfolioUploaded,
    };
  } catch (err: any) {
    console.error("[onboarding] Unexpected error getting user profile:", err);
    return null;
  }
}

/**
 * Update the user's `has_portfolio` answer in Supabase.
 */
export async function updateHasPortfolio(
  email: string,
  hasPortfolio: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!email) {
    return { success: false, error: "Authenticated session email is required" };
  }

  try {
    const updatePayload: Record<string, any> = {
      has_portfolio: hasPortfolio,
    };

    // If setting to false, ensure portfolio_uploaded is reset
    if (hasPortfolio === false) {
      updatePayload.portfolio_uploaded = false;
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update(updatePayload)
      .eq("email", email);

    if (error) {
      // If portfolio_uploaded column doesn't exist yet, retry updating just has_portfolio
      if (error.code === "42703" || error.message?.includes("portfolio_uploaded")) {
        const { error: retryError } = await supabaseAdmin
          .from("profiles")
          .update({ has_portfolio: hasPortfolio })
          .eq("email", email);

        if (retryError) {
          console.error("[onboarding] Profile update retry failed:", retryError);
          return { success: false, error: "Database update failed. Please try again." };
        }
        return { success: true };
      }

      console.error("[onboarding] Profile update error:", error);
      return { success: false, error: "Database update failed. Please try again." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[onboarding] Exception updating has_portfolio:", err);
    return { success: false, error: "An unexpected error occurred while updating status." };
  }
}

/**
 * Server-side helper to fetch profile and resolve the current onboarding destination route.
 */
export async function resolveUserOnboardingRoute(email: string): Promise<OnboardingRoute> {
  const profile = await getUserProfile(email);

  if (!profile) {
    // Default for new profiles where profile record is not yet filled
    return "/portfolio-check";
  }

  return getOnboardingRoute(profile);
}

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getOnboardingRoute } from "../lib/onboarding";

async function runTests() {
  console.log("=== STARTING WEALTHZY ONBOARDING ACCEPTANCE TESTS ===\n");
  let passed = 0;
  let failed = 0;

  function assert(testName: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details ? `(${details})` : ""}`);
      failed++;
    }
  }

  // 1. ROUTE RESOLVER TESTS
  console.log("--- 1. Testing State Resolver Matrix ---");
  
  // Case A: User with has_portfolio === null
  assert(
    "NULL has_portfolio routes to /portfolio-check",
    getOnboardingRoute({ has_portfolio: null }) === "/portfolio-check"
  );
  assert(
    "Undefined has_portfolio routes to /portfolio-check",
    getOnboardingRoute({ has_portfolio: undefined }) === "/portfolio-check"
  );

  // Case B: User with has_portfolio === false
  assert(
    "has_portfolio === false routes to /knowing-customer",
    getOnboardingRoute({ has_portfolio: false }) === "/knowing-customer"
  );

  // Case C: User with has_portfolio === true and portfolio_uploaded === false
  assert(
    "has_portfolio === true & !portfolio_uploaded routes to /portfolio-upload",
    getOnboardingRoute({ has_portfolio: true, portfolio_uploaded: false }) === "/portfolio-upload"
  );

  // Case D: User with has_portfolio === true and portfolio_uploaded === true
  assert(
    "has_portfolio === true & portfolio_uploaded === true routes to /dashboard",
    getOnboardingRoute({ has_portfolio: true, portfolio_uploaded: true }) === "/dashboard"
  );

  // Parser, normalizer and calculation tests live in scratch/test-portfolio-pipeline.ts

  console.log("\n--- 3. Testing Supabase Database Operations ---");
  const { getUserProfile, updateHasPortfolio } = await import("../lib/onboarding");
  
  // Test reading profile
  const testEmail = "vedantsinghh2048@gmail.com";
  const profile = await getUserProfile(testEmail);
  assert("Successfully retrieved profile from Supabase", profile !== null && profile.email === testEmail);

  // Test updating has_portfolio = true
  const updateYesResult = await updateHasPortfolio(testEmail, true);
  assert("Successfully updated has_portfolio = true in Supabase", updateYesResult.success);

  const updatedProfile1 = await getUserProfile(testEmail);
  assert("Profile has_portfolio verified as true", updatedProfile1?.has_portfolio === true);

  // Test updating has_portfolio = false
  const updateNoResult = await updateHasPortfolio(testEmail, false);
  assert("Successfully updated has_portfolio = false in Supabase", updateNoResult.success);

  const updatedProfile2 = await getUserProfile(testEmail);
  assert("Profile has_portfolio verified as false", updatedProfile2?.has_portfolio === false);

  // Reset to null for clean testing state
  const { supabaseAdmin } = await import("../lib/supabaseAdmin");
  await supabaseAdmin.from("profiles").update({ has_portfolio: null }).eq("email", testEmail);
  const resetProfile = await getUserProfile(testEmail);
  assert("Profile has_portfolio cleanly reset to null", resetProfile?.has_portfolio === null);

  console.log(`\n=== SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

runTests();

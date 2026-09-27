import { supabaseAdmin } from "../lib/supabaseAdmin";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function testFullRegisterFlow() {
  const testEmail = `user_${Date.now()}@example.com`;
  const testFullName = "Test User";
  const testPassword = "password123";

  console.log("Simulating /api/auth/register with email:", testEmail);

  // 1. Check existing
  const { data: existingUser } = await supabaseAdmin
    .from("profiles")
    .select("id, email")
    .eq("email", testEmail)
    .maybeSingle();

  console.log("Existing user check:", existingUser);

  // 2. Insert profile
  const userId = `usr_${Date.now()}`;
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("profiles")
    .insert({
      user_id: userId,
      email: testEmail,
      first_name: "Test",
      last_name: "User",
      has_portfolio: null,
    })
    .select()
    .single();

  console.log("Insert result:", { inserted, insertError });

  // Cleanup
  if (inserted?.id) {
    await supabaseAdmin.from("profiles").delete().eq("user_id", userId);
    console.log("Cleanup done.");
  }
}

testFullRegisterFlow();

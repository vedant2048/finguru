import { supabaseAdmin } from "../lib/supabaseAdmin";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function checkProfiles() {
  console.log("Checking Supabase connection & profiles table...");
  const { data, error } = await supabaseAdmin.from("profiles").select("*").limit(2);
  console.log("Select result:", { data, error });

  console.log("\nAttempting test insert...");
  const testUserId = "test_" + Date.now();
  const testEmail = `test_${Date.now()}@example.com`;

  const { data: insertData, error: insertError } = await supabaseAdmin.from("profiles").insert({
    user_id: testUserId,
    email: testEmail,
    first_name: "Test",
    last_name: "User",
  }).select();

  console.log("Insert result (minimal columns):", { insertData, error: insertError });

  const { data: insertWithAll, error: insertWithAllError } = await supabaseAdmin.from("profiles").insert({
    user_id: testUserId + "_2",
    email: testEmail + "_2",
    first_name: "Test",
    last_name: "User",
    password_hash: "dummy_hash",
    has_portfolio: null,
    portfolio_uploaded: false,
  }).select();

  console.log("Insert result (with password_hash, has_portfolio, etc):", { insertWithAll, error: insertWithAllError });

  // Cleanup test users
  await supabaseAdmin.from("profiles").delete().eq("user_id", testUserId);
  await supabaseAdmin.from("profiles").delete().eq("user_id", testUserId + "_2");
}

checkProfiles();

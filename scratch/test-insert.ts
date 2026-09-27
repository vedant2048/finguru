import { supabaseAdmin } from "../lib/supabaseAdmin";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function testInsert() {
  const testUserId = "usr_" + Date.now();
  const testEmail = `test_${Date.now()}@example.com`;

  const { data, error } = await supabaseAdmin.from("profiles").insert({
    user_id: testUserId,
    email: testEmail,
    first_name: "Test",
    last_name: "User",
    has_portfolio: null,
  }).select();

  console.log("Insert result with existing columns:", { data, error });

  if (data?.[0]?.id) {
    await supabaseAdmin.from("profiles").delete().eq("user_id", testUserId);
    console.log("Cleanup succeeded.");
  }
}

testInsert();

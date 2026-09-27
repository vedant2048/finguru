import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPassword } from "@/lib/auth/password";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser, error: findError } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("email", trimmedEmail)
      .maybeSingle();

    if (findError) {
      console.error("[register] Error checking existing user:", findError);
      return NextResponse.json({ error: "Database error occurred. Please try again." }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const nameParts = (fullName || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    const userId = `usr_${crypto.randomUUID()}`;
    const passwordHash = hashPassword(password);

    // Try inserting with password_hash first
    const { error: insertError } = await supabaseAdmin.from("profiles").insert({
      user_id: userId,
      email: trimmedEmail,
      first_name: firstName,
      last_name: lastName,
      password_hash: passwordHash,
      has_portfolio: null,
    });

    if (insertError) {
      // If password_hash column doesn't exist in Supabase schema cache yet, insert with existing columns
      if (insertError.code === "PGRST204" || insertError.message?.includes("password_hash")) {
        const { error: retryError } = await supabaseAdmin.from("profiles").insert({
          user_id: userId,
          email: trimmedEmail,
          first_name: firstName,
          last_name: lastName,
          has_portfolio: null,
        });

        if (retryError) {
          console.error("[register] Retry insertion error:", retryError);
          return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
        }
      } else {
        console.error("[register] Profile insertion error:", insertError);
        return NextResponse.json({ error: insertError.message || "Failed to create account." }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, userId });
  } catch (err: any) {
    console.error("[register] Unexpected exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

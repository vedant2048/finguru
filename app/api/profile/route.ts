import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone_no, dob, portfolio_status } = body;

    const session = await getServerSession(authOptions);

    if (session?.user?.email) {
      const email = session.user.email;

      // Update Supabase profile
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          phone_no: phone_no || null,
          dob: dob || null,
        })
        .eq("email", email);

      if (error) {
        console.error("Supabase profile update error:", error);
        return NextResponse.json(
          { error: "Failed to update profile in database" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

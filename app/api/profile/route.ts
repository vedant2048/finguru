import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("[profile GET] Supabase fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || session.user.name || "";

    return NextResponse.json({
      success: true,
      profile: {
        id: profile?.id,
        user_id: profile?.user_id,
        email: profile?.email || email,
        first_name: profile?.first_name || "",
        last_name: profile?.last_name || "",
        name: fullName,
        phone_no: profile?.phone_no || null,
        dob: profile?.dob || null,
        has_portfolio: profile?.has_portfolio ?? null,
      },
    });
  } catch (error) {
    console.error("[profile GET] Internal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const body = await req.json();
    const { phone_no, dob, first_name, last_name, name, fullName } = body;

    const updateData: Record<string, any> = {};

    if (phone_no !== undefined) {
      updateData.phone_no = phone_no ? String(phone_no).trim() : null;
    }

    if (dob !== undefined) {
      updateData.dob = dob ? String(dob).trim() : null;
    }

    if (first_name !== undefined) {
      updateData.first_name = String(first_name).trim();
    }

    if (last_name !== undefined) {
      updateData.last_name = String(last_name).trim();
    }

    const resolvedName = name || fullName;
    if (resolvedName && first_name === undefined) {
      const parts = String(resolvedName).trim().split(/\s+/);
      updateData.first_name = parts[0] || "";
      updateData.last_name = parts.slice(1).join(" ") || "";
    }

    // Update Supabase profile
    const { data: updated, error } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("email", email)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("[profile POST] Supabase profile update error:", error);
      return NextResponse.json(
        { error: "Failed to update profile in database" },
        { status: 500 }
      );
    }

    const computedName = [updated?.first_name, updated?.last_name].filter(Boolean).join(" ") || session.user.name || "";

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        id: updated?.id,
        user_id: updated?.user_id,
        email: updated?.email || email,
        first_name: updated?.first_name || "",
        last_name: updated?.last_name || "",
        name: computedName,
        phone_no: updated?.phone_no || null,
        dob: updated?.dob || null,
        has_portfolio: updated?.has_portfolio ?? null,
      },
    });
  } catch (error) {
    console.error("[profile POST] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

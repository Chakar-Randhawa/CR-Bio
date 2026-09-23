import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/publicClient";

/**
 * Verifies a visitor-entered password against the creator's stored
 * hash (never sent to the client — see verify_page_password in the
 * DB) and, on success, sets a short-lived per-profile unlock cookie
 * that app/[username]/page.tsx checks server-side before it ever
 * fetches or renders the real page content.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profileId = typeof body?.profileId === "string" ? body.profileId : null;
    const password = typeof body?.password === "string" ? body.password : "";

    if (!profileId) {
      return NextResponse.json({ error: "Missing page reference." }, { status: 400 });
    }

    const supabase = createPublicClient();
    const { data: verified, error } = await supabase.rpc("verify_page_password", {
      p_profile_id: profileId,
      p_password: password,
    });

    if (error || !verified) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(`crbio_unlock_${profileId}`, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 6, // 6 hours
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

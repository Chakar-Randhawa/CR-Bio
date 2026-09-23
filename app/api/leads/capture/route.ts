import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/publicClient";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const linkId = typeof body?.linkId === "string" ? body.linkId : null;
    const profileId = typeof body?.profileId === "string" ? body.profileId : null;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : null;
    const honeypot = typeof body?.website === "string" ? body.website : "";

    if (!linkId || !profileId) return NextResponse.json({ error: "Missing block reference." }, { status: 400 });
    if (honeypot) return NextResponse.json({ ok: true });
    if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

    const supabase = createPublicClient();
    const { error } = await supabase.from("leads").insert({ link_id: linkId, profile_id: profileId, email, name: name || null });
    if (error) return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

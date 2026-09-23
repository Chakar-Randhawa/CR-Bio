import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/publicClient";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const linkId = typeof body?.linkId === "string" ? body.linkId : null;
    const profileId = typeof body?.profileId === "string" ? body.profileId : null;
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const notes = typeof body?.notes === "string" ? body.notes.trim().slice(0, 500) : null;
    const startsAt = typeof body?.startsAt === "string" ? body.startsAt : null;
    const durationMinutes = typeof body?.durationMinutes === "number" ? body.durationMinutes : null;
    const honeypot = typeof body?.website === "string" ? body.website : "";

    if (!linkId || !profileId || !startsAt || !durationMinutes) return NextResponse.json({ error: "Missing booking details." }, { status: 400 });
    if (honeypot) return NextResponse.json({ ok: true });
    if (name.length === 0) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
    if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

    const startDate = new Date(startsAt);
    if (isNaN(startDate.getTime()) || startDate.getTime() < Date.now() - 60000) return NextResponse.json({ error: "That time has passed. Pick another slot." }, { status: 400 });

    const supabase = createPublicClient();
    const { error } = await supabase.from("bookings").insert({ link_id: linkId, profile_id: profileId, name, email, notes, starts_at: startDate.toISOString(), duration_minutes: durationMinutes });

    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "That slot was just taken — pick another time." }, { status: 409 });
      return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

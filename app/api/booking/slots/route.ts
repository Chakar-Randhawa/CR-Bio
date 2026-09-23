import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/publicClient";
import { generateAvailableSlots, groupSlotsByDay } from "@/lib/booking";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");
  if (!profileId) return NextResponse.json({ error: "profileId is required" }, { status: 400 });

  const supabase = createPublicClient();
  const [{ data: profile, error: profileError }, { data: availability }, { data: existing }] = await Promise.all([
    supabase.from("profiles").select("booking_timezone, booking_duration_minutes").eq("id", profileId).single(),
    supabase.from("booking_availability").select("*").eq("profile_id", profileId),
    supabase.from("public_booking_slots").select("starts_at, duration_minutes").eq("profile_id", profileId),
  ]);

  if (profileError || !profile) return NextResponse.json({ error: "Booking page not found." }, { status: 404 });

  const bookedInstants = new Set((existing || []).map((b) => new Date(b.starts_at).getTime()));
  const slots = generateAvailableSlots({ availability: availability || [], durationMinutes: profile.booking_duration_minutes, timezone: profile.booking_timezone, bookedInstants });
  const grouped = groupSlotsByDay(slots, profile.booking_timezone);

  return NextResponse.json({
    timezone: profile.booking_timezone,
    durationMinutes: profile.booking_duration_minutes,
    days: grouped.map((g) => ({ dateKey: g.dateKey, label: g.label, slots: g.slots.map((s) => s.startsAt.toISOString()) })),
  });
}

import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/publicClient";
import { countryFromHeaders, parseUserAgent } from "@/lib/device";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profileId = typeof body?.profileId === "string" ? body.profileId : null;
    const referrer = typeof body?.referrer === "string" ? body.referrer.slice(0, 500) : null;
    if (!profileId) return NextResponse.json({ error: "profileId is required" }, { status: 400 });

    const country = countryFromHeaders(request.headers);
    const { device, browser } = parseUserAgent(request.headers.get("user-agent"));

    const supabase = createPublicClient();
    const { error } = await supabase.from("profile_views").insert({ profile_id: profileId, referrer, country, device, browser });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/publicClient";
import { countryFromHeaders, parseUserAgent } from "@/lib/device";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const linkId = typeof body?.linkId === "string" ? body.linkId : null;
    const referrer = typeof body?.referrer === "string" ? body.referrer.slice(0, 500) : null;
    if (!linkId) return NextResponse.json({ error: "linkId is required" }, { status: 400 });

    const country = countryFromHeaders(request.headers);
    const { device, browser } = parseUserAgent(request.headers.get("user-agent"));

    const supabase = createPublicClient();
    const { error } = await supabase.rpc("increment_link_click", { p_link_id: linkId, p_referrer: referrer, p_country: country, p_device: device, p_browser: browser });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

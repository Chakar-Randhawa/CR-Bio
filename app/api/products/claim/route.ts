import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/publicClient";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const linkId = typeof body?.linkId === "string" ? body.linkId : null;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : null;
    const honeypot = typeof body?.website === "string" ? body.website : "";

    if (!linkId) return NextResponse.json({ error: "Missing product reference." }, { status: 400 });
    if (honeypot) return NextResponse.json({ ok: true });
    if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

    const supabase = createPublicClient();
    const { data: link, error: linkError } = await supabase.from("links").select("id, profile_id, price_cents, delivery_type, file_url, is_active, block_type").eq("id", linkId).single();

    if (linkError || !link || link.block_type !== "product" || !link.is_active) return NextResponse.json({ error: "This product isn't available." }, { status: 404 });
    if (link.delivery_type !== "file" || !link.file_url) return NextResponse.json({ error: "This product doesn't offer a direct download." }, { status: 400 });

    const { error: insertError } = await supabase.from("product_orders").insert({ link_id: link.id, profile_id: link.profile_id, email, name, amount_cents: link.price_cents || 0 });
    if (insertError) return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 400 });

    return NextResponse.json({ ok: true, fileUrl: link.file_url });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

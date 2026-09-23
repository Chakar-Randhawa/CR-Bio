import { NextResponse } from "next/server";
import { resolveCname, resolve4 } from "node:dns/promises";
import { createClient } from "@/lib/supabase/server";
import { CNAME_TARGET, APEX_A_RECORD } from "@/lib/domain";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: profile, error: profileError } = await supabase.from("profiles").select("id, custom_domain").eq("id", user.id).single();
  if (profileError || !profile?.custom_domain) return NextResponse.json({ error: "No custom domain is set for your account." }, { status: 400 });

  const domain: string = profile.custom_domain;
  let verified = false;
  let detail = "";

  try {
    const cnameRecords = await resolveCname(domain);
    verified = cnameRecords.some((r) => r.toLowerCase().replace(/\.$/, "") === CNAME_TARGET.toLowerCase());
    if (!verified) detail = `Found a CNAME, but it doesn't point to ${CNAME_TARGET} yet.`;
  } catch {
    try {
      const aRecords = await resolve4(domain);
      verified = aRecords.includes(APEX_A_RECORD);
      if (!verified) detail = `Found an A record, but it doesn't point to ${APEX_A_RECORD} yet.`;
    } catch {
      detail = "No DNS record found yet. DNS changes can take a few minutes to a few hours to propagate.";
    }
  }

  if (verified) {
    await supabase.from("profiles").update({ custom_domain_verified: true }).eq("id", user.id);
    return NextResponse.json({ verified: true });
  }
  return NextResponse.json({ verified: false, detail });
}

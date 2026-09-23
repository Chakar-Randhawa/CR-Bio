import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let token: string | null = null;
  try {
    const body = await request.json();
    token = typeof body?.token === "string" ? body.token : null;
  } catch {
    // ignore
  }
  if (!token) return NextResponse.json({ error: "Missing invite token." }, { status: 400 });

  const { data, error } = await supabase.rpc("accept_team_invite", { p_token: token });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data?.ok) return NextResponse.json({ error: data?.error || "Couldn't accept this invite." }, { status: 400 });

  return NextResponse.json({ ok: true, profileId: data.profile_id });
}

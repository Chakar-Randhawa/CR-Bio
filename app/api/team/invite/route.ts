import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let invitedEmail: string | null = null;
  try {
    const body = await request.json();
    invitedEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;
  } catch {
    // no body is fine
  }

  const { data, error } = await supabase.from("team_members").insert({ profile_id: user.id, invited_email: invitedEmail, role: "editor" }).select("id, invite_token").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, inviteToken: data.invite_token });
}

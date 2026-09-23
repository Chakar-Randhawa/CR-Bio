import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeadsView } from "@/components/dashboard/LeadsView";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: leads }, { data: captureBlocks }] = await Promise.all([
    supabase.from("leads").select("id, link_id, email, name, captured_at").eq("profile_id", user.id).order("captured_at", { ascending: false }),
    supabase.from("links").select("id, title").eq("profile_id", user.id).eq("block_type", "lead_capture"),
  ]);

  return <LeadsView initialLeads={leads || []} captureBlocks={captureBlocks || []} />;
}

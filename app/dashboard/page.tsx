import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LinkManager } from "@/components/dashboard/LinkManager";

export default async function DashboardLinksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: links }, { data: profile }, { data: collections }] = await Promise.all([
    supabase.from("links").select("*").eq("profile_id", user.id).order("position", { ascending: true }),
    supabase.from("profiles").select("username").eq("id", user.id).single(),
    supabase.from("link_collections").select("*").eq("profile_id", user.id).order("position", { ascending: true }),
  ]);

  return <LinkManager initialLinks={links || []} initialCollections={collections || []} profileId={user.id} username={profile?.username || ""} />;
}

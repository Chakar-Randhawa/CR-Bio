import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminChrome } from "@/components/admin/AdminChrome";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("username, is_platform_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_platform_admin) redirect("/dashboard");

  return <AdminChrome username={profile.username}>{children}</AdminChrome>;
}

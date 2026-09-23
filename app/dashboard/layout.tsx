import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id, username, display_name, bio, avatar_url, theme, is_published, custom_domain, custom_domain_verified, chatbot_enabled, chatbot_name, chatbot_welcome_message, chatbot_fallback_message, booking_timezone, booking_duration_minutes, auto_order_links, translations, is_platform_admin, has_seen_tour, is_password_protected, created_at, updated_at").eq("id", user.id).maybeSingle();
  if (!profile) redirect("/onboarding");

  return <DashboardChrome profile={profile}>{children}</DashboardChrome>;
}

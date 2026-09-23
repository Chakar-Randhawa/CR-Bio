import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingManager } from "@/components/dashboard/BookingManager";

export default async function BookingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: availability }, { data: bookings }] = await Promise.all([
    supabase.from("profiles").select("id, username, display_name, bio, avatar_url, theme, is_published, custom_domain, custom_domain_verified, chatbot_enabled, chatbot_name, chatbot_welcome_message, chatbot_fallback_message, booking_timezone, booking_duration_minutes, auto_order_links, translations, is_platform_admin, has_seen_tour, is_password_protected, created_at, updated_at").eq("id", user.id).single(),
    supabase.from("booking_availability").select("*").eq("profile_id", user.id).order("day_of_week", { ascending: true }),
    supabase.from("bookings").select("*").eq("profile_id", user.id).eq("status", "confirmed").gte("starts_at", new Date().toISOString()).order("starts_at", { ascending: true }),
  ]);
  if (!profile) redirect("/onboarding");

  return <BookingManager initialProfile={profile} initialAvailability={availability || []} initialBookings={bookings || []} />;
}

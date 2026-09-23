import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { PublicBioPage } from "@/components/PublicBioPage";
import { PasswordGate } from "@/components/PasswordGate";
import { resolveTheme, getSurface, applyAutoOrder } from "@/lib/utils";
import { parseAcceptLanguage, pickBestLanguage } from "@/lib/i18n";

// ISR: the page is cached at the edge for fast repeat visits, and
// invalidated on-demand the moment the creator saves a change (see
// lib/revalidate.ts + /api/revalidate). 60s is the fallback ceiling
// for staleness if an invalidation call is ever missed.
export const revalidate = 60;

const PROFILE_COLUMNS =
  "id, username, display_name, bio, avatar_url, theme, is_published, custom_domain, custom_domain_verified, chatbot_enabled, chatbot_name, chatbot_welcome_message, chatbot_fallback_message, booking_timezone, booking_duration_minutes, auto_order_links, translations, is_platform_admin, has_seen_tour, is_password_protected, created_at, updated_at";

async function getProfileRow(username: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("username", username.toLowerCase())
    .eq("is_published", true)
    .maybeSingle();
  return profile;
}

async function getPageContent(profileId: string) {
  const supabase = await createClient();
  const [{ data: links }, { data: collections }] = await Promise.all([
    supabase
      .from("links")
      .select("id, title, url, icon, position, click_count, block_type, embed_provider, display_style, description, starts_at, ends_at, price_cents, currency, delivery_type, external_checkout_url, translations, collection_id")
      .eq("profile_id", profileId)
      .eq("is_active", true)
      .order("position", { ascending: true }),
    supabase.from("link_collections").select("*").eq("profile_id", profileId).order("position", { ascending: true }),
  ]);

  const now = Date.now();
  let visibleLinks = (links || []).filter((link) => {
    const startsOk = !link.starts_at || new Date(link.starts_at).getTime() <= now;
    const endsOk = !link.ends_at || new Date(link.ends_at).getTime() >= now;
    return startsOk && endsOk;
  });

  return { links: visibleLinks, collections: collections || [] };
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileRow(username);
  if (!profile) return { title: "Page not found" };

  const name = profile.display_name || `@${profile.username}`;
  // Don't reveal bio content in previews for password-protected pages —
  // only that the page exists.
  const description = profile.is_password_protected
    ? "This page is password protected."
    : profile.bio || `${name} on CRbio — every link in one place.`;

  return {
    title: name,
    description,
    openGraph: { title: `${name} · CRbio`, description, type: "profile" },
    twitter: { card: "summary", title: `${name} · CRbio`, description },
    alternates: { canonical: `/${profile.username}` },
    manifest: `/api/manifest/${profile.username}`,
  };
}

export default async function UsernamePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getProfileRow(username);
  if (!profile) notFound();

  const theme = resolveTheme(profile.theme);
  const surface = getSurface(theme);

  // Password gate — checked BEFORE fetching any link/content data, so
  // a locked page's real content is never fetched for this render,
  // let alone sent to the browser.
  if (profile.is_password_protected) {
    const cookieStore = await cookies();
    const unlocked = cookieStore.get(`crbio_unlock_${profile.id}`)?.value === "1";
    if (!unlocked) {
      return (
        <div className="min-h-screen" style={{ background: surface.background }}>
          <PasswordGate profileId={profile.id} displayName={profile.display_name || `@${profile.username}`} />
        </div>
      );
    }
  }

  const { links, collections } = await getPageContent(profile.id);
  const orderedLinks = profile.auto_order_links ? applyAutoOrder(links) : links;

  const headersList = await headers();
  const preferredLangs = parseAcceptLanguage(headersList.get("accept-language"));
  const availableLangs = Object.keys(profile.translations || {});
  const initialLang = pickBestLanguage(availableLangs, preferredLangs);

  const chatbot = profile.chatbot_enabled
    ? { enabled: true, name: profile.chatbot_name, welcomeMessage: profile.chatbot_welcome_message, fallbackMessage: profile.chatbot_fallback_message }
    : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://crbio.app";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateModified: profile.updated_at,
    mainEntity: {
      "@type": "Person",
      name: profile.display_name || profile.username,
      alternateName: profile.username,
      description: profile.bio || undefined,
      image: profile.avatar_url || undefined,
      url: `${siteUrl}/${profile.username}`,
      sameAs: orderedLinks.filter((l) => l.block_type === "link" && l.url).slice(0, 20).map((l) => l.url),
    },
  };

  return (
    <div className="min-h-screen" style={{ background: surface.background }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicBioPage profileId={profile.id} profile={profile} links={orderedLinks} collections={collections} initialLang={initialLang} chatbot={chatbot} />
    </div>
  );
}

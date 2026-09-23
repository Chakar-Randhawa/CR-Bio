"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Link as LinkRow, LinkCollection, Profile } from "@/lib/types";
import { BioPageView } from "@/components/BioPageView";
import { resolveProfileTranslation, resolveLinkTranslation } from "@/lib/i18n";

type PublicLink = Pick<LinkRow, "id" | "title" | "url" | "click_count" | "block_type" | "display_style" | "description" | "price_cents" | "currency" | "delivery_type" | "external_checkout_url" | "translations" | "collection_id">;
type PublicProfile = Pick<Profile, "username" | "display_name" | "bio" | "avatar_url" | "theme" | "translations">;

export function PublicBioPage({ profileId, profile, links, collections = [], initialLang, chatbot }: {
  profileId: string; profile: PublicProfile; links: PublicLink[]; collections?: LinkCollection[]; initialLang: string | null;
  chatbot?: { enabled: boolean; name: string; welcomeMessage: string; fallbackMessage: string } | null;
}) {
  const loggedView = useRef(false);
  const availableLangs = useMemo(() => {
    const langs = new Set<string>(["en"]);
    Object.keys(profile.translations || {}).forEach((l) => langs.add(l));
    return [...langs];
  }, [profile.translations]);

  const [lang, setLang] = useState<string | null>(initialLang && availableLangs.includes(initialLang) ? initialLang : null);

  useEffect(() => {
    if (loggedView.current) return;
    loggedView.current = true;
    fetch("/api/track/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileId, referrer: typeof document !== "undefined" ? document.referrer || null : null }), keepalive: true }).catch(() => {});
  }, [profileId]);

  function handleLinkClick(link: Pick<LinkRow, "id" | "url">) {
    fetch("/api/track/click", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ linkId: link.id, referrer: typeof document !== "undefined" ? document.referrer || null : null }), keepalive: true }).catch(() => {});
  }

  const resolvedProfile = useMemo(() => {
    const t = resolveProfileTranslation(profile, lang);
    return { ...profile, display_name: t.display_name, bio: t.bio };
  }, [profile, lang]);

  const resolvedLinks = useMemo(() => links.map((link) => {
    const t = resolveLinkTranslation(link, lang);
    return { ...link, title: t.title, description: t.description };
  }), [links, lang]);

  return (
    <BioPageView
      profile={resolvedProfile}
      profileId={profileId}
      links={resolvedLinks}
      collections={collections}
      onLinkClick={handleLinkClick}
      chatbot={chatbot}
      languageSwitcher={availableLangs.length > 1 ? { availableLangs, currentLang: lang || "en", onChange: setLang } : null}
    />
  );
}

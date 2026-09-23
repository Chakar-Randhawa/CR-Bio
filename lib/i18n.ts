import type { Link as LinkRow, LinkTranslation, Profile, Translation } from "@/lib/types";

export const SUPPORTED_LANGUAGES: { code: string; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "ur", label: "Urdu", nativeLabel: "اردو" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "de", label: "German", nativeLabel: "Deutsch" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português" },
  { code: "tr", label: "Turkish", nativeLabel: "Türkçe" },
  { code: "id", label: "Indonesian", nativeLabel: "Bahasa Indonesia" },
  { code: "zh", label: "Chinese", nativeLabel: "中文" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা" },
];

export function languageLabel(code: string): string {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.label || code.toUpperCase();
}

export function parseAcceptLanguage(header: string | null): string[] {
  if (!header) return [];
  return header.split(",").map((part) => {
    const [tag, qPart] = part.trim().split(";q=");
    const q = qPart ? parseFloat(qPart) : 1;
    return { code: tag.split("-")[0].toLowerCase(), q: isNaN(q) ? 1 : q };
  }).sort((a, b) => b.q - a.q).map((x) => x.code);
}

export function pickBestLanguage(available: string[], preferredOrder: string[]): string | null {
  for (const pref of preferredOrder) if (available.includes(pref)) return pref;
  return null;
}

export function resolveProfileTranslation(profile: Pick<Profile, "display_name" | "bio" | "translations">, lang: string | null) {
  if (!lang) return { display_name: profile.display_name, bio: profile.bio };
  const t: Translation | undefined = profile.translations?.[lang];
  return { display_name: t?.display_name || profile.display_name, bio: t?.bio || profile.bio };
}

export function resolveLinkTranslation(link: Pick<LinkRow, "title" | "description" | "translations">, lang: string | null) {
  if (!lang) return { title: link.title, description: link.description };
  const t: LinkTranslation | undefined = link.translations?.[lang];
  return { title: t?.title || link.title, description: t?.description ?? link.description };
}

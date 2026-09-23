import { Facebook, Github, Globe, Instagram, Link2, Linkedin, Mail, MessageCircle, Music2, Music4, ShoppingBag, Twitch, Twitter, Youtube } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const PLATFORM_MAP: Array<{ match: RegExp; icon: LucideIcon; key: string }> = [
  { match: /instagram\.com/i, icon: Instagram, key: "instagram" },
  { match: /(youtube\.com|youtu\.be)/i, icon: Youtube, key: "youtube" },
  { match: /(twitter\.com|x\.com)/i, icon: Twitter, key: "twitter" },
  { match: /tiktok\.com/i, icon: Music4, key: "tiktok" },
  { match: /open\.spotify\.com/i, icon: Music2, key: "spotify" },
  { match: /facebook\.com/i, icon: Facebook, key: "facebook" },
  { match: /linkedin\.com/i, icon: Linkedin, key: "linkedin" },
  { match: /github\.com/i, icon: Github, key: "github" },
  { match: /twitch\.tv/i, icon: Twitch, key: "twitch" },
  { match: /wa\.me|whatsapp\.com/i, icon: MessageCircle, key: "whatsapp" },
  { match: /^mailto:/i, icon: Mail, key: "email" },
  { match: /(etsy\.com|shopify\.com|gumroad\.com)/i, icon: ShoppingBag, key: "shop" },
];

export function detectPlatformIcon(url: string): LucideIcon {
  return (PLATFORM_MAP.find((p) => p.match.test(url))?.icon) || Link2;
}
export function detectPlatformKey(url: string): string {
  return (PLATFORM_MAP.find((p) => p.match.test(url))?.key) || "link";
}
export function iconForKey(key: string): LucideIcon {
  return (PLATFORM_MAP.find((p) => p.key === key)?.icon) || Globe;
}

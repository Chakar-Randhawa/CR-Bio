export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const RESERVED_USERNAMES = new Set([
  "admin","api","app","auth","crbio","dashboard","login","logout","signup","settings",
  "support","help","about","pricing","terms","privacy","blog","docs","static","public",
  "assets","cr-digital","crdigital","root","null","undefined","favicon.ico",
]);

const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

export function isValidUsername(value: string): boolean {
  const v = value.trim().toLowerCase();
  return USERNAME_PATTERN.test(v) && !RESERVED_USERNAMES.has(v);
}

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(n);
}

// ============================================================
// THEME PRESETS — an original, expanded gallery (24 looks)
// ============================================================
export const THEME_PRESETS = {
  midnight: { label: "Midnight Violet", background: "linear-gradient(180deg, #0A0A12 0%, #14101F 100%)", accent: "#7C6CF6", textOnBg: "#F7F7FB", isLight: false },
  aurora: { label: "Aurora Gold", background: "linear-gradient(160deg, #0B0E13 0%, #1C1607 100%)", accent: "#F0B429", textOnBg: "#F7F7FB", isLight: false },
  rosequartz: { label: "Rose Quartz", background: "linear-gradient(160deg, #16090F 0%, #241019 100%)", accent: "#F5789A", textOnBg: "#F7F7FB", isLight: false },
  emerald: { label: "Emerald Glass", background: "linear-gradient(160deg, #06120F 0%, #0E1F19 100%)", accent: "#34D399", textOnBg: "#F7F7FB", isLight: false },
  cobalt: { label: "Cobalt Ice", background: "linear-gradient(160deg, #060B14 0%, #0B1B2E 100%)", accent: "#38BDF8", textOnBg: "#F7F7FB", isLight: false },
  noir: { label: "Noir Editorial", background: "linear-gradient(160deg, #050505 0%, #111111 100%)", accent: "#F7F7FB", textOnBg: "#F7F7FB", isLight: false },
  sunset: { label: "Sunset Copper", background: "linear-gradient(160deg, #140A06 0%, #2A1408 100%)", accent: "#F2854C", textOnBg: "#F7F7FB", isLight: false },
  paperlight: { label: "Paper Light", background: "linear-gradient(160deg, #F7F7FB 0%, #ECEAF7 100%)", accent: "#5B4FE0", textOnBg: "#0A0A12", isLight: true },
  obsidianGold: { label: "Obsidian & Gold", background: "linear-gradient(150deg, #030303 0%, #171008 100%)", accent: "#D4AF37", textOnBg: "#F7F7FB", isLight: false },
  deepOcean: { label: "Deep Ocean", background: "linear-gradient(165deg, #020814 0%, #041B33 100%)", accent: "#22D3EE", textOnBg: "#F7F7FB", isLight: false },
  plumVelvet: { label: "Plum Velvet", background: "linear-gradient(155deg, #12060F 0%, #2B0F26 100%)", accent: "#C084FC", textOnBg: "#F7F7FB", isLight: false },
  forestNight: { label: "Forest Night", background: "linear-gradient(160deg, #04120A 0%, #0A2317 100%)", accent: "#4ADE80", textOnBg: "#F7F7FB", isLight: false },
  crimsonInk: { label: "Crimson Ink", background: "linear-gradient(160deg, #100304 0%, #260A0D 100%)", accent: "#FB7185", textOnBg: "#F7F7FB", isLight: false },
  graphiteSlate: { label: "Graphite Slate", background: "linear-gradient(160deg, #0B0C10 0%, #1A1D24 100%)", accent: "#94A3B8", textOnBg: "#F7F7FB", isLight: false },
  amberDusk: { label: "Amber Dusk", background: "linear-gradient(160deg, #130A02 0%, #2E1704 100%)", accent: "#FB923C", textOnBg: "#F7F7FB", isLight: false },
  arcticMint: { label: "Arctic Mint", background: "linear-gradient(160deg, #041210 0%, #0B2925 100%)", accent: "#2DD4BF", textOnBg: "#F7F7FB", isLight: false },
  royalIndigo: { label: "Royal Indigo", background: "linear-gradient(155deg, #06071A 0%, #14163B 100%)", accent: "#818CF8", textOnBg: "#F7F7FB", isLight: false },
  blushPaper: { label: "Blush Paper", background: "linear-gradient(160deg, #FFF7F7 0%, #FBEAEE 100%)", accent: "#E1447A", textOnBg: "#0A0A12", isLight: true },
  saharaSand: { label: "Sahara Sand", background: "linear-gradient(160deg, #FBF6EE 0%, #F1E3CC 100%)", accent: "#B4823A", textOnBg: "#0A0A12", isLight: true },
  mintPaper: { label: "Mint Paper", background: "linear-gradient(160deg, #F3FBF8 0%, #E1F3EB 100%)", accent: "#0F9D77", textOnBg: "#0A0A12", isLight: true },
  skylinePaper: { label: "Skyline Paper", background: "linear-gradient(160deg, #F4F8FC 0%, #E4EDF7 100%)", accent: "#2563EB", textOnBg: "#0A0A12", isLight: true },
  charcoalRose: { label: "Charcoal Rose", background: "linear-gradient(160deg, #0D0A0B 0%, #1F1315 100%)", accent: "#FDA4AF", textOnBg: "#F7F7FB", isLight: false },
  ultraviolet: { label: "Ultraviolet", background: "linear-gradient(150deg, #0A0414 0%, #23093F 100%)", accent: "#A855F7", textOnBg: "#F7F7FB", isLight: false },
  goldenHour: { label: "Golden Hour", background: "linear-gradient(160deg, #170A02 0%, #3B1D05 100%)", accent: "#FBBF24", textOnBg: "#F7F7FB", isLight: false },
} as const;

export type ThemePresetKey = keyof typeof THEME_PRESETS;

// ============================================================
// FONT PAIRS
// ============================================================
export const FONT_PAIRS = {
  signature: { label: "Signature", sample: "Fraunces + Inter", display: "'Fraunces', serif", body: "'Inter', sans-serif", googleFontsUrl: "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&display=swap", displayStyle: "italic" as const },
  editorial: { label: "Editorial", sample: "Playfair Display + Manrope", display: "'Playfair Display', serif", body: "'Manrope', sans-serif", googleFontsUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=Manrope:wght@400;500;600&display=swap", displayStyle: "normal" as const },
  modern: { label: "Modern", sample: "Space Grotesk", display: "'Space Grotesk', sans-serif", body: "'Space Grotesk', sans-serif", googleFontsUrl: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap", displayStyle: "normal" as const },
  classic: { label: "Classic", sample: "DM Serif Display + DM Sans", display: "'DM Serif Display', serif", body: "'DM Sans', sans-serif", googleFontsUrl: "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap", displayStyle: "normal" as const },
  clean: { label: "Clean", sample: "Poppins", display: "'Poppins', sans-serif", body: "'Poppins', sans-serif", googleFontsUrl: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap", displayStyle: "normal" as const },
  bold: { label: "Bold Poster", sample: "Bebas Neue + Work Sans", display: "'Bebas Neue', sans-serif", body: "'Work Sans', sans-serif", googleFontsUrl: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Work+Sans:wght@400;500;600&display=swap", displayStyle: "normal" as const },
  luxury: { label: "Luxury Serif", sample: "Cormorant Garamond + Jost", display: "'Cormorant Garamond', serif", body: "'Jost', sans-serif", googleFontsUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Jost:wght@400;500&display=swap", displayStyle: "normal" as const },
  techMono: { label: "Tech Mono", sample: "Space Mono + Inter", display: "'Space Mono', monospace", body: "'Inter', sans-serif", googleFontsUrl: "https://fonts.googleapis.com/css2?family=Space+Mono:wght@700&family=Inter:wght@400;500&display=swap", displayStyle: "normal" as const },
} as const;

export type FontPairKey = keyof typeof FONT_PAIRS;

// ============================================================
// BUTTON ANIMATIONS
// ============================================================
export const BUTTON_ANIMATIONS = {
  none: { label: "None" }, lift: { label: "Lift" }, grow: { label: "Grow" }, pulse: { label: "Pulse" }, shine: { label: "Shine sweep" },
} as const;

export type ButtonAnimationKey = keyof typeof BUTTON_ANIMATIONS;
export type BackgroundType = "theme" | "gradient" | "image" | "video";
export type HeaderLayout = "classic" | "hero" | "banner" | "cutout" | "shape";

// ============================================================
// STICKERS — lightweight decorative emoji overlays (no image assets
// to host, renders crisp at any size, zero load cost)
// ============================================================
export const STICKER_OPTIONS = ["✨", "🔥", "💫", "🌟", "💎", "🎯", "🚀", "🌈", "⚡", "🎨", "🏆", "💜"] as const;
export type StickerKey = (typeof STICKER_OPTIONS)[number];

export interface PlacedSticker {
  emoji: StickerKey;
  x: number; // percent, 0-100
  y: number; // percent, 0-100
  rotation: number; // degrees
  scale: number; // 0.6-1.8
}

export interface ProfileTheme {
  preset: ThemePresetKey;
  accent: string;
  buttonStyle: "fill" | "outline" | "glass";
  buttonShape: "rounded" | "pill" | "square";
  buttonAnimation: ButtonAnimationKey;
  fontPair: FontPairKey;
  backgroundType: BackgroundType;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  backgroundImageUrl: string | null;
  backgroundVideoUrl: string | null;
  overlayOpacity: number;
  headerLayout: HeaderLayout;
  stickers: PlacedSticker[];
  footerVisible: boolean;
}

export const DEFAULT_THEME: ProfileTheme = {
  preset: "midnight",
  accent: "#7C6CF6",
  buttonStyle: "fill",
  buttonShape: "pill",
  buttonAnimation: "lift",
  fontPair: "signature",
  backgroundType: "theme",
  gradientFrom: "#0A0A12",
  gradientTo: "#241A3D",
  gradientAngle: 160,
  backgroundImageUrl: null,
  backgroundVideoUrl: null,
  overlayOpacity: 0.45,
  headerLayout: "classic",
  stickers: [],
  footerVisible: true,
};

export function resolveTheme(theme: Partial<ProfileTheme> | null | undefined): ProfileTheme {
  return { ...DEFAULT_THEME, ...(theme || {}) };
}

export function getSurface(theme: ProfileTheme) {
  const preset = THEME_PRESETS[theme.preset] || THEME_PRESETS.midnight;
  if (theme.backgroundType === "gradient") {
    const bothLight = isColorLight(theme.gradientFrom) && isColorLight(theme.gradientTo);
    return {
      background: `linear-gradient(${theme.gradientAngle}deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
      isLight: bothLight, textOnBg: bothLight ? "#0A0A12" : "#F7F7FB",
    };
  }
  return { background: preset.background, isLight: preset.isLight, textOnBg: preset.textOnBg };
}

export function isColorLight(hex: string): boolean {
  const clean = (hex || "").replace("#", "");
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

/**
 * A/B auto-order: when enabled, "link" blocks are reordered among
 * themselves by click-through performance. Other block types keep
 * the creator's manual placement exactly as set.
 */
export function applyAutoOrder<T extends { block_type: string; click_count: number }>(blocks: T[]): T[] {
  const result = [...blocks];
  const linkIndices: number[] = [];
  const linkItems: T[] = [];
  result.forEach((block, i) => {
    if (block.block_type === "link") { linkIndices.push(i); linkItems.push(block); }
  });
  const sortedLinks = [...linkItems].sort((a, b) => b.click_count - a.click_count);
  linkIndices.forEach((idx, i) => { result[idx] = sortedLinks[i]; });
  return result;
}

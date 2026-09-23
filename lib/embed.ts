import type { EmbedProvider } from "@/lib/types";

export interface ParsedEmbed { provider: EmbedProvider; embedSrc: string; aspectRatio: number; }

function extractYouTubeId(url: string): string | null {
  const patterns = [/(?:youtube\.com\/watch\?v=)([\w-]{11})/, /(?:youtu\.be\/)([\w-]{11})/, /(?:youtube\.com\/shorts\/)([\w-]{11})/, /(?:youtube\.com\/embed\/)([\w-]{11})/];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}
function extractSpotify(url: string): { type: string; id: string } | null {
  const m = url.match(/open\.spotify\.com\/(track|album|playlist|episode|show|artist)\/([a-zA-Z0-9]+)/);
  return m ? { type: m[1], id: m[2] } : null;
}
function extractTikTokId(url: string): string | null {
  const m = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/) || url.match(/tiktok\.com\/.*?(\d{15,})/);
  return m ? m[1] : null;
}

export function parseEmbedUrl(url: string): ParsedEmbed | null {
  const trimmed = url.trim();
  if (/(youtube\.com|youtu\.be)/i.test(trimmed)) {
    const id = extractYouTubeId(trimmed);
    return id ? { provider: "youtube", embedSrc: `https://www.youtube.com/embed/${id}`, aspectRatio: 16 / 9 } : null;
  }
  if (/open\.spotify\.com/i.test(trimmed)) {
    const parsed = extractSpotify(trimmed);
    if (!parsed) return null;
    const isTrackOrEpisode = parsed.type === "track" || parsed.type === "episode";
    return { provider: "spotify", embedSrc: `https://open.spotify.com/embed/${parsed.type}/${parsed.id}`, aspectRatio: isTrackOrEpisode ? 3.2 : 1.5 };
  }
  if (/tiktok\.com/i.test(trimmed)) {
    const id = extractTikTokId(trimmed);
    return id ? { provider: "tiktok", embedSrc: `https://www.tiktok.com/embed/v2/${id}`, aspectRatio: 9 / 16 } : null;
  }
  return null;
}

export const EMBED_PROVIDER_LABEL: Record<EmbedProvider, string> = { youtube: "YouTube", spotify: "Spotify", tiktok: "TikTok" };

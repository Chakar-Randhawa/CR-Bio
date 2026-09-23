import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/publicClient";
import { resolveTheme, getSurface } from "@/lib/utils";

/**
 * Per-creator PWA manifest. Next.js's manifest.ts special-file
 * convention only works at static route segments, not dynamic ones
 * like [username] — so this is a plain Route Handler instead,
 * linked from the page via `metadata.manifest` in generateMetadata.
 */
export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = createPublicClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, theme")
    .eq("username", username.toLowerCase())
    .eq("is_published", true)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const theme = resolveTheme(profile.theme);
  const surface = getSurface(theme);
  const name = profile.display_name || `@${profile.username}`;

  const manifest = {
    name: `${name} · CRbio`,
    short_name: name.slice(0, 20),
    description: `${name}'s links, all in one place.`,
    start_url: `/${profile.username}`,
    display: "standalone",
    background_color: surface.isLight ? "#F7F7FB" : "#0A0A12",
    theme_color: theme.accent || "#7C6CF6",
    icons: [{ src: `/${profile.username}/icon`, sizes: "192x192", type: "image/png" }],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}

import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { resolveTheme, getSurface, THEME_PRESETS } from "@/lib/utils";
import { initialsFromName } from "@/lib/utils";

export const runtime = "nodejs";
export const alt = "CRbio profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, bio, avatar_url, theme")
    .eq("username", username.toLowerCase())
    .eq("is_published", true)
    .maybeSingle();

  const theme = resolveTheme(profile?.theme);
  const surface = getSurface(theme);
  const accent = theme.accent || THEME_PRESETS.midnight.accent;
  const name = profile?.display_name || `@${profile?.username || "crbio"}`;
  const bio = profile?.bio || "";
  const initials = initialsFromName(name);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: surface.isLight
            ? "linear-gradient(160deg, #F7F7FB 0%, #ECEAF7 100%)"
            : "linear-gradient(160deg, #0A0A12 0%, #14101F 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 20% -10%, ${accent}33, transparent 45%)`,
            display: "flex",
          }}
        />
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: profile?.avatar_url ? "transparent" : accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            fontWeight: 700,
            color: surface.isLight ? "#0A0A12" : "#fff",
            overflow: "hidden",
            border: `4px solid ${accent}`,
          }}
        >
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} width={160} height={160} style={{ objectFit: "cover" }} alt="" />
          ) : (
            initials
          )}
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 56,
            fontWeight: 600,
            color: surface.isLight ? "#0A0A12" : "#fff",
            display: "flex",
          }}
        >
          {name}
        </div>
        {bio && (
          <div
            style={{
              marginTop: 16,
              fontSize: 28,
              color: surface.isLight ? "#0A0A12AA" : "#ffffffAA",
              maxWidth: 800,
              textAlign: "center",
              display: "flex",
            }}
          >
            {bio.length > 100 ? `${bio.slice(0, 100)}…` : bio}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 24,
            fontWeight: 600,
            fontStyle: "italic",
            color: accent,
            display: "flex",
          }}
        >
          CRbio
        </div>
      </div>
    ),
    { ...size }
  );
}

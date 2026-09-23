import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { resolveTheme, getSurface, initialsFromName } from "@/lib/utils";

export const runtime = "nodejs";
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default async function Icon({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, avatar_url, theme")
    .eq("username", username.toLowerCase())
    .eq("is_published", true)
    .maybeSingle();

  const theme = resolveTheme(profile?.theme);
  const surface = getSurface(theme);
  const accent = theme.accent || "#7C6CF6";
  const initials = initialsFromName(profile?.display_name || profile?.username || "CR");

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: accent,
          borderRadius: 36,
        }}
      >
        {profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            width={size.width}
            height={size.height}
            style={{ objectFit: "cover", borderRadius: 36 }}
            alt=""
          />
        ) : (
          <div style={{ fontSize: 88, fontWeight: 700, color: surface.isLight ? "#0A0A12" : "#fff", display: "flex" }}>
            {initials}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}

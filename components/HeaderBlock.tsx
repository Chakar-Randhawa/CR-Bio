"use client";

import Image from "next/image";
import { cn, initialsFromName, type HeaderLayout } from "@/lib/utils";

interface HeaderBlockProps {
  layout: HeaderLayout;
  displayName: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  accent: string;
  hasMedia: boolean;
  isLight: boolean;
  fontDisplay: string;
  fontDisplayStyle: "normal" | "italic";
}

function Avatar({
  avatarUrl, displayName, accent, hasMedia, isLight, size, shape = "circle",
}: {
  avatarUrl: string | null; displayName: string; accent: string; hasMedia: boolean; isLight: boolean; size: number; shape?: "circle" | "hex";
}) {
  const clip = shape === "hex" ? "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)" : undefined;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {shape === "circle" && (
        <div className="absolute inset-0 rounded-full opacity-90" style={{ background: `conic-gradient(from 0deg, ${accent}, transparent 40%, ${accent})` }} />
      )}
      <div
        className={cn(
          "absolute flex items-center justify-center overflow-hidden text-2xl",
          shape === "circle" ? "inset-[3px] rounded-full" : "inset-0",
          hasMedia || !isLight ? "bg-ink text-white" : "bg-white text-ink"
        )}
        style={shape === "hex" ? { clipPath: clip, border: `3px solid ${accent}` } : undefined}
      >
        {avatarUrl ? (
          <Image src={avatarUrl} alt={displayName} fill sizes={`${size}px`} className="object-cover" priority />
        ) : (
          initialsFromName(displayName)
        )}
      </div>
    </div>
  );
}

export function HeaderBlock({ layout, displayName, username, bio, avatarUrl, accent, hasMedia, isLight, fontDisplay, fontDisplayStyle }: HeaderBlockProps) {
  const nameStyle = { fontFamily: fontDisplay, fontStyle: fontDisplayStyle };
  const bioClass = cn("mt-1.5 max-w-xs text-sm leading-relaxed", hasMedia ? "text-white/80" : isLight ? "text-ink/70" : "text-white/70");

  if (layout === "banner") {
    return (
      <div className="flex w-full flex-col items-center">
        <div className="h-20 w-full rounded-2xl" style={{ background: `linear-gradient(120deg, ${accent}, transparent)`, opacity: 0.5 }} />
        <div className="-mt-10">
          <Avatar avatarUrl={avatarUrl} displayName={displayName} accent={accent} hasMedia={hasMedia} isLight={isLight} size={88} />
        </div>
        <h1 className="mt-4 text-center text-xl font-medium" style={nameStyle}>{displayName || `@${username}`}</h1>
        {bio && <p className={cn(bioClass, "text-center")}>{bio}</p>}
      </div>
    );
  }

  if (layout === "hero") {
    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-full opacity-30 blur-2xl" style={{ background: accent, transform: "scale(1.4)" }} />
          <Avatar avatarUrl={avatarUrl} displayName={displayName} accent={accent} hasMedia={hasMedia} isLight={isLight} size={128} />
        </div>
        <h1 className="mt-5 text-center text-2xl font-medium" style={nameStyle}>{displayName || `@${username}`}</h1>
        {bio && <p className={cn(bioClass, "text-center")}>{bio}</p>}
      </div>
    );
  }

  if (layout === "cutout") {
    return (
      <div className="flex flex-col items-center">
        <Avatar avatarUrl={avatarUrl} displayName={displayName} accent={accent} hasMedia={hasMedia} isLight={isLight} size={100} shape="hex" />
        <h1 className="mt-4 text-center text-xl font-medium" style={nameStyle}>{displayName || `@${username}`}</h1>
        {bio && <p className={cn(bioClass, "text-center")}>{bio}</p>}
      </div>
    );
  }

  if (layout === "shape") {
    return (
      <div
        className={cn("flex w-full max-w-sm items-center gap-4 rounded-2xl border px-5 py-4 text-left", hasMedia ? "border-white/15 bg-white/5" : isLight ? "border-ink/10 bg-ink/[0.03]" : "border-white/10 bg-white/[0.04]")}
      >
        <Avatar avatarUrl={avatarUrl} displayName={displayName} accent={accent} hasMedia={hasMedia} isLight={isLight} size={64} />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-medium" style={nameStyle}>{displayName || `@${username}`}</h1>
          {bio && <p className={cn(bioClass, "mt-0.5 line-clamp-2")}>{bio}</p>}
        </div>
      </div>
    );
  }

  // classic (default)
  return (
    <div className="flex flex-col items-center">
      <Avatar avatarUrl={avatarUrl} displayName={displayName} accent={accent} hasMedia={hasMedia} isLight={isLight} size={96} />
      <h1 className="mt-4 text-center text-xl font-medium" style={nameStyle}>{displayName || `@${username}`}</h1>
      {bio && <p className={cn(bioClass, "text-center")}>{bio}</p>}
    </div>
  );
}

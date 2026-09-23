"use client";
import { parseEmbedUrl, EMBED_PROVIDER_LABEL } from "@/lib/embed";
import { cn } from "@/lib/utils";

export function EmbedBlock({ url, title, isLight }: { url: string; title?: string | null; isLight: boolean }) {
  const parsed = parseEmbedUrl(url);
  if (!parsed) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={cn("flex w-full items-center justify-center rounded-xl border px-5 py-4 text-sm font-medium", isLight ? "border-ink/15 text-ink/80" : "border-white/15 text-white/80")}>
        Open link
      </a>
    );
  }
  return (
    <div className="w-full">
      {title && <p className={cn("mb-2 text-xs font-medium", isLight ? "text-ink/60" : "text-white/60")}>{title}</p>}
      <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-black/20" style={{ aspectRatio: parsed.aspectRatio }}>
        <iframe src={parsed.embedSrc} title={`${EMBED_PROVIDER_LABEL[parsed.provider]} embed`} className="h-full w-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" />
      </div>
    </div>
  );
}

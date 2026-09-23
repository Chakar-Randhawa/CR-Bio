"use client";
import { useRef, useState } from "react";
import { Check, Film, ImageIcon, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { THEME_PRESETS, type BackgroundType, type ProfileTheme, type ThemePresetKey, cn } from "@/lib/utils";

const MAX_IMAGE_MB = 8;
const MAX_VIDEO_MB = 25;

export function BackgroundEditor({ theme, profileId, onChange }: { theme: ProfileTheme; profileId: string; onChange: (patch: Partial<ProfileTheme>) => void }) {
  const supabase = createClient();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"image" | "video" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleUpload(file: File, kind: "image" | "video") {
    setUploadError(null);
    const maxMb = kind === "image" ? MAX_IMAGE_MB : MAX_VIDEO_MB;
    if (file.size > maxMb * 1024 * 1024) { setUploadError(`File must be under ${maxMb}MB.`); return; }
    setUploading(kind);
    const ext = file.name.split(".").pop();
    const path = `${profileId}/${kind}-bg.${ext}`;
    const { error } = await supabase.storage.from("backgrounds").upload(path, file, { upsert: true, cacheControl: "3600" });
    setUploading(null);
    if (error) { setUploadError(error.message); return; }
    const { data } = supabase.storage.from("backgrounds").getPublicUrl(path);
    const bustedUrl = `${data.publicUrl}?t=${Date.now()}`;
    if (kind === "image") onChange({ backgroundType: "image", backgroundImageUrl: bustedUrl });
    else onChange({ backgroundType: "video", backgroundVideoUrl: bustedUrl });
  }

  const TABS: { key: BackgroundType; label: string }[] = [
    { key: "theme", label: "Theme" }, { key: "gradient", label: "Custom gradient" }, { key: "image", label: "Image" }, { key: "video", label: "Video" },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button key={tab.key} type="button" onClick={() => onChange({ backgroundType: tab.key })} className={cn("rounded-full border px-4 py-2 text-xs font-medium transition-colors", theme.backgroundType === tab.key ? "border-violet-soft bg-violet/15 text-white" : "border-white/10 text-mist hover:border-white/25")}>{tab.label}</button>
        ))}
      </div>

      {theme.backgroundType === "theme" && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(THEME_PRESETS) as ThemePresetKey[]).map((key) => {
            const preset = THEME_PRESETS[key];
            const active = theme.preset === key;
            return (
              <button key={key} type="button" onClick={() => onChange({ preset: key, accent: preset.accent })} className={cn("flex flex-col items-center gap-2 rounded-xl border-2 p-2.5 transition-colors", active ? "border-violet-soft" : "border-white/10 hover:border-white/25")}>
                <div className="h-12 w-full rounded-lg" style={{ background: preset.background }} />
                <span className="text-[11px] font-medium text-white/85">{preset.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {theme.backgroundType === "gradient" && (
        <div className="mt-5 space-y-4">
          <div className="h-20 w-full rounded-xl border border-white/10" style={{ background: `linear-gradient(${theme.gradientAngle}deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)` }} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1.5 text-xs font-medium text-mist">From</p>
              <div className="flex items-center gap-2">
                <label className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-white/20"><input type="color" value={theme.gradientFrom} onChange={(e) => onChange({ gradientFrom: e.target.value })} className="absolute -left-1 -top-1 h-11 w-11 cursor-pointer" /></label>
                <span className="font-mono text-xs text-mist">{theme.gradientFrom}</span>
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-mist">To</p>
              <div className="flex items-center gap-2">
                <label className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-white/20"><input type="color" value={theme.gradientTo} onChange={(e) => onChange({ gradientTo: e.target.value })} className="absolute -left-1 -top-1 h-11 w-11 cursor-pointer" /></label>
                <span className="font-mono text-xs text-mist">{theme.gradientTo}</span>
              </div>
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between"><p className="text-xs font-medium text-mist">Angle</p><span className="font-mono text-xs text-mist">{theme.gradientAngle}°</span></div>
            <input type="range" min={0} max={360} value={theme.gradientAngle} onChange={(e) => onChange({ gradientAngle: Number(e.target.value) })} className="w-full accent-violet" />
          </div>
        </div>
      )}

      {theme.backgroundType === "image" && (
        <div className="mt-5">
          {theme.backgroundImageUrl ? (
            <div className="relative overflow-hidden rounded-xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={theme.backgroundImageUrl} alt="" className="h-40 w-full object-cover" />
              <button type="button" onClick={() => onChange({ backgroundImageUrl: null })} className="absolute right-2 top-2 rounded-lg bg-black/60 p-2 text-white backdrop-blur-sm hover:bg-black/80" aria-label="Remove background image"><Trash2 className="h-4 w-4" /></button>
            </div>
          ) : (
            <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploading === "image"} className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 text-mist transition-colors hover:border-white/30 hover:text-white">
              {uploading === "image" ? <Loader2 className="h-6 w-6 animate-spin" /> : (<><ImageIcon className="h-6 w-6" /><span className="text-xs font-medium">Upload a background image</span><span className="text-[11px] text-mist/60">JPG or PNG, up to {MAX_IMAGE_MB}MB</span></>)}
            </button>
          )}
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "image")} />
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between"><p className="text-xs font-medium text-mist">Overlay darkness</p><span className="font-mono text-xs text-mist">{Math.round(theme.overlayOpacity * 100)}%</span></div>
            <input type="range" min={0} max={0.85} step={0.05} value={theme.overlayOpacity} onChange={(e) => onChange({ overlayOpacity: Number(e.target.value) })} className="w-full accent-violet" />
          </div>
        </div>
      )}

      {theme.backgroundType === "video" && (
        <div className="mt-5">
          {theme.backgroundVideoUrl ? (
            <div className="relative overflow-hidden rounded-xl border border-white/10">
              <video src={theme.backgroundVideoUrl} muted loop autoPlay playsInline className="h-40 w-full object-cover" />
              <button type="button" onClick={() => onChange({ backgroundVideoUrl: null })} className="absolute right-2 top-2 rounded-lg bg-black/60 p-2 text-white backdrop-blur-sm hover:bg-black/80" aria-label="Remove background video"><Trash2 className="h-4 w-4" /></button>
            </div>
          ) : (
            <button type="button" onClick={() => videoInputRef.current?.click()} disabled={uploading === "video"} className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 text-mist transition-colors hover:border-white/30 hover:text-white">
              {uploading === "video" ? <Loader2 className="h-6 w-6 animate-spin" /> : (<><Film className="h-6 w-6" /><span className="text-xs font-medium">Upload a background video</span><span className="text-[11px] text-mist/60">MP4, up to {MAX_VIDEO_MB}MB</span></>)}
            </button>
          )}
          <input ref={videoInputRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "video")} />
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between"><p className="text-xs font-medium text-mist">Overlay darkness</p><span className="font-mono text-xs text-mist">{Math.round(theme.overlayOpacity * 100)}%</span></div>
            <input type="range" min={0} max={0.85} step={0.05} value={theme.overlayOpacity} onChange={(e) => onChange({ overlayOpacity: Number(e.target.value) })} className="w-full accent-violet" />
          </div>
        </div>
      )}

      {uploadError && <p className="mt-3 text-xs text-red-300">{uploadError}</p>}

      <div className="mt-6 flex items-center gap-3">
        <p className="text-xs font-medium text-mist">Accent color</p>
        <div className="flex items-center gap-2">
          {["#7C6CF6", "#F0B429", "#F5789A", "#34D399", "#38BDF8", "#F97316"].map((color) => (
            <button key={color} type="button" onClick={() => onChange({ accent: color })} className="relative h-7 w-7 rounded-full transition-transform hover:scale-110" style={{ background: color }}>
              {theme.accent === color && <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white drop-shadow" />}
            </button>
          ))}
          <label className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border border-white/20"><input type="color" value={theme.accent} onChange={(e) => onChange({ accent: e.target.value })} className="absolute -left-1 -top-1 h-9 w-9 cursor-pointer" /></label>
        </div>
      </div>
    </div>
  );
}

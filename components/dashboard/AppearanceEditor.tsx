"use client";
import { useRef, useState } from "react";
import { Check, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { triggerRevalidate } from "@/lib/revalidate";
import type { Link as LinkRow, Profile } from "@/lib/types";
import { resolveTheme, type ProfileTheme, initialsFromName, cn } from "@/lib/utils";
import { BioPageView } from "@/components/BioPageView";
import { FontPairPicker } from "@/components/dashboard/FontPairPicker";
import { ButtonStylePicker } from "@/components/dashboard/ButtonStylePicker";
import { BackgroundEditor } from "@/components/dashboard/BackgroundEditor";
import { HeaderLayoutPicker } from "@/components/dashboard/HeaderLayoutPicker";
import { StickerPicker } from "@/components/dashboard/StickerPicker";
import { PagePasswordSection } from "@/components/dashboard/PagePasswordSection";
import { DeviceFrame, DeviceSwitcher, type DeviceKey } from "@/components/dashboard/DevicePreviewFrame";

type Tab = "header" | "design" | "enhance";
const TABS: { key: Tab; label: string }[] = [
  { key: "header", label: "Header" },
  { key: "design", label: "Design" },
  { key: "enhance", label: "Enhance" },
];

export function AppearanceEditor({ initialProfile, links }: { initialProfile: Profile; links: LinkRow[] }) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>("header");
  const [displayName, setDisplayName] = useState(initialProfile.display_name || "");
  const [bio, setBio] = useState(initialProfile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || "");
  const [theme, setTheme] = useState<ProfileTheme>(resolveTheme(initialProfile.theme));
  const [autoOrder, setAutoOrder] = useState(initialProfile.auto_order_links);
  const [device, setDevice] = useState<DeviceKey>("mobile");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateTheme(patch: Partial<ProfileTheme>) { setTheme((prev) => ({ ...prev, ...patch })); }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB."); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${initialProfile.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, cacheControl: "3600" });
    if (uploadError) { alert(uploadError.message); setUploading(false); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true); setSaved(false);
    const { error } = await supabase.from("profiles").update({
      display_name: displayName.trim() || null, bio: bio.trim() || null, avatar_url: avatarUrl || null, theme, auto_order_links: autoOrder,
    }).eq("id", initialProfile.id);
    setSaving(false);
    if (error) { alert(error.message); return; }
    triggerRevalidate(initialProfile.username);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const previewProfile = { username: initialProfile.username, display_name: displayName, bio, avatar_url: avatarUrl, theme };
  const SaveButton = ({ className }: { className?: string }) => (
    <button onClick={handleSave} disabled={saving} className={cn("btn-primary", className)}>
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? (<><Check className="h-4 w-4" /> Saved</>) : "Save changes"}
    </button>
  );

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="font-display text-2xl text-white">Appearance</h1><p className="mt-1 text-sm text-mist">Design the page visitors see.</p></div>
          <SaveButton className="hidden sm:inline-flex" />
        </div>

        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={cn("rounded-full px-4 py-1.5 text-xs font-medium transition-colors", tab === t.key ? "bg-violet/20 text-white" : "text-mist hover:text-white")}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "header" && (
          <div className="space-y-6">
            <section className="glass-panel p-6">
              <h2 className="label-eyebrow mb-5">Profile</h2>
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-violet/15">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : <div className="flex h-full w-full items-center justify-center font-display text-lg text-white">{initialsFromName(displayName || initialProfile.username)}</div>}
                  {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><Loader2 className="h-5 w-5 animate-spin text-white" /></div>}
                </div>
                <div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary !px-4 !py-2 text-xs"><Upload className="h-3.5 w-3.5" />Upload photo</button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <p className="mt-1.5 text-xs text-mist/70">PNG or JPG, up to 5MB.</p>
                </div>
              </div>
              <div className="mt-5">
                <label htmlFor="displayName" className="mb-1.5 block text-xs font-medium text-mist">Display name</label>
                <input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input-field" placeholder={initialProfile.username} maxLength={60} />
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between"><label htmlFor="bio" className="block text-xs font-medium text-mist">Bio</label><span className="text-xs text-mist/60">{bio.length}/280</span></div>
                <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value.slice(0, 280))} rows={3} className="input-field resize-none" placeholder="Tell visitors what you do." />
              </div>
            </section>

            <section className="glass-panel p-6">
              <h2 className="label-eyebrow mb-5">Layout</h2>
              <HeaderLayoutPicker value={theme.headerLayout} onChange={(headerLayout) => updateTheme({ headerLayout })} />
            </section>
          </div>
        )}

        {tab === "design" && (
          <div className="space-y-6">
            <section className="glass-panel p-6"><h2 className="label-eyebrow mb-5">Background</h2><BackgroundEditor theme={theme} profileId={initialProfile.id} onChange={updateTheme} /></section>
            <section className="glass-panel p-6"><h2 className="label-eyebrow mb-5">Fonts</h2><FontPairPicker value={theme.fontPair} onChange={(fontPair) => updateTheme({ fontPair })} /></section>
            <section className="glass-panel p-6"><h2 className="label-eyebrow mb-5">Link buttons</h2><ButtonStylePicker theme={theme} onChange={updateTheme} /></section>
            <section className="glass-panel p-6"><h2 className="label-eyebrow mb-5">Stickers</h2><StickerPicker stickers={theme.stickers} onChange={(stickers) => updateTheme({ stickers })} /></section>
            <section className="glass-panel p-6">
              <div className="flex items-center justify-between">
                <div><h2 className="label-eyebrow mb-1">Footer branding</h2><p className="text-sm text-mist">Show the "Made with CRbio" line at the bottom of your page.</p></div>
                <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                  <input type="checkbox" checked={theme.footerVisible} onChange={(e) => updateTheme({ footerVisible: e.target.checked })} className="peer sr-only" />
                  <div className="h-6 w-11 rounded-full bg-white/10 transition-colors peer-checked:bg-violet after:absolute after:left-[3px] after:top-[3px] after:h-[18px] after:w-[18px] after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:after:translate-x-5" />
                </label>
              </div>
            </section>
          </div>
        )}

        {tab === "enhance" && (
          <div className="space-y-6">
            <section className="glass-panel p-6">
              <div className="flex items-center justify-between">
                <div><h2 className="label-eyebrow mb-1">Auto-optimize link order</h2><p className="text-sm text-mist">Best-performing links automatically float to the top.</p></div>
                <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                  <input type="checkbox" checked={autoOrder} onChange={(e) => setAutoOrder(e.target.checked)} className="peer sr-only" />
                  <div className="h-6 w-11 rounded-full bg-white/10 transition-colors peer-checked:bg-violet after:absolute after:left-[3px] after:top-[3px] after:h-[18px] after:w-[18px] after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:after:translate-x-5" />
                </label>
              </div>
            </section>
            <PagePasswordSection profileId={initialProfile.id} initialProtected={initialProfile.is_password_protected} />
          </div>
        )}

        <SaveButton className="w-full sm:hidden" />
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <div className="mb-3 flex items-center justify-between"><p className="label-eyebrow">Live preview</p><DeviceSwitcher device={device} onChange={setDevice} /></div>
        <DeviceFrame device={device}><BioPageView profile={previewProfile} profileId={initialProfile.id} links={links} interactive={false} /></DeviceFrame>
      </div>
    </div>
  );
}

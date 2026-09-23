"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { AlertCircle, Check, Download, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { triggerRevalidate } from "@/lib/revalidate";
import type { Profile } from "@/lib/types";
import { isValidUsername, normalizeUsername } from "@/lib/utils";
import { CustomDomainSection } from "@/components/dashboard/CustomDomainSection";

type Availability = "idle" | "checking" | "available" | "taken" | "invalid" | "current";

export function SettingsPanel({ initialProfile, userEmail }: { initialProfile: Profile; userEmail: string }) {
  const supabase = createClient();
  const router = useRouter();
  const qrRef = useRef<HTMLDivElement>(null);

  const [username, setUsername] = useState(initialProfile.username);
  const [availability, setAvailability] = useState<Availability>("current");
  const [published, setPublished] = useState(initialProfile.is_published);
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingPublish, setSavingPublish] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const pageUrl = `${siteUrl}/${initialProfile.username}`;

  useEffect(() => {
    const clean = normalizeUsername(username);
    if (clean === initialProfile.username) { setAvailability("current"); return; }
    if (clean.length < 3) { setAvailability(clean.length === 0 ? "idle" : "invalid"); return; }
    if (!isValidUsername(clean)) { setAvailability("invalid"); return; }
    setAvailability("checking");
    const t = setTimeout(async () => {
      const { data } = await supabase.from("profiles").select("id").eq("username", clean).maybeSingle();
      setAvailability(data ? "taken" : "available");
    }, 400);
    return () => clearTimeout(t);
  }, [username, initialProfile.username]);

  async function handleUsernameSave() {
    if (availability !== "available") return;
    setSavingUsername(true); setError(null);
    const clean = normalizeUsername(username);
    const { error: updateError } = await supabase.from("profiles").update({ username: clean }).eq("id", initialProfile.id);
    setSavingUsername(false);
    if (updateError) { setError(updateError.code === "23505" ? "That handle was just taken." : updateError.message); return; }
    triggerRevalidate(initialProfile.username); // old address should stop resolving
    triggerRevalidate(clean); // new address should be fresh immediately
    setAvailability("current"); setSaved(true); setTimeout(() => setSaved(false), 2000); router.refresh();
  }

  async function handlePublishToggle(next: boolean) {
    setSavingPublish(true); setPublished(next);
    await supabase.from("profiles").update({ is_published: next }).eq("id", initialProfile.id);
    triggerRevalidate(initialProfile.username);
    setSavingPublish(false);
  }

  function downloadQr() {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = `crbio-${initialProfile.username}-qr.png`; a.click();
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    await supabase.from("profiles").delete().eq("id", initialProfile.id);
    await supabase.auth.signOut();
    router.push("/"); router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div><h1 className="font-display text-2xl text-white">Settings</h1><p className="mt-1 text-sm text-mist">Account, handle, and page visibility.</p></div>

      <section className="glass-panel p-6">
        <h2 className="label-eyebrow mb-4">Account</h2>
        <div><p className="mb-1.5 text-xs font-medium text-mist">Email</p><p className="text-sm text-white/90">{userEmail}</p></div>
      </section>

      <section className="glass-panel p-6">
        <h2 className="label-eyebrow mb-4">Your handle</h2>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-mist">crbio.app/</span>
          <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} className="input-field pl-[5.6rem] pr-10" maxLength={30} />
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            {availability === "checking" && <Loader2 className="h-4 w-4 animate-spin text-mist" />}
            {availability === "available" && <Check className="h-4 w-4 text-emerald-400" />}
            {(availability === "taken" || availability === "invalid") && <X className="h-4 w-4 text-red-400" />}
          </span>
        </div>
        <p className="mt-2 text-xs text-mist/80">
          {availability === "invalid" && "3–30 characters. Lowercase letters, numbers, and underscores only."}
          {availability === "taken" && "That handle is already taken."}
          {availability === "available" && "This handle is available."}
          {availability === "current" && "This is your current handle."}
        </p>
        {error && <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
        <button onClick={handleUsernameSave} disabled={availability !== "available" || savingUsername} className="btn-primary mt-4 !px-5 !py-2.5 text-sm">
          {savingUsername ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? (<><Check className="h-4 w-4" /> Saved</>) : "Update handle"}
        </button>
      </section>

      <section className="glass-panel p-6">
        <div className="flex items-center justify-between">
          <div><h2 className="label-eyebrow mb-1">Page visibility</h2><p className="text-sm text-mist">{published ? "Your page is live and publicly visible." : "Your page is hidden from visitors."}</p></div>
          <label className="relative inline-flex shrink-0 cursor-pointer items-center">
            <input type="checkbox" checked={published} onChange={(e) => handlePublishToggle(e.target.checked)} disabled={savingPublish} className="peer sr-only" />
            <div className="h-6 w-11 rounded-full bg-white/10 transition-colors peer-checked:bg-violet after:absolute after:left-[3px] after:top-[3px] after:h-[18px] after:w-[18px] after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:after:translate-x-5" />
          </label>
        </div>
      </section>

      <CustomDomainSection profileId={initialProfile.id} initialDomain={initialProfile.custom_domain} initialVerified={initialProfile.custom_domain_verified} />

      <section className="glass-panel p-6">
        <h2 className="label-eyebrow mb-4">QR code</h2>
        <div className="flex items-center gap-5">
          <div ref={qrRef} className="rounded-xl bg-white p-3"><QRCodeCanvas value={pageUrl} size={96} bgColor="#ffffff" fgColor="#0A0A12" level="M" /></div>
          <div>
            <p className="text-sm text-white/90">Scan to open your CRbio page</p>
            <p className="mt-0.5 font-mono text-xs text-mist">{pageUrl}</p>
            <button onClick={downloadQr} className="btn-secondary mt-3 !px-4 !py-2 text-xs"><Download className="h-3.5 w-3.5" />Download PNG</button>
          </div>
        </div>
      </section>

      <section className="glass-panel border-red-500/20 p-6">
        <h2 className="label-eyebrow mb-1 text-red-300">Danger zone</h2>
        <p className="text-sm text-mist">Deleting your account permanently removes your page, links, and analytics.</p>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="btn-secondary mt-4 !border-red-500/30 !px-4 !py-2 text-xs !text-red-300 hover:!bg-red-500/10">Delete account</button>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button onClick={handleDeleteAccount} disabled={deleting} className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, permanently delete"}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="btn-secondary !px-4 !py-2.5 text-sm">Cancel</button>
          </div>
        )}
      </section>
    </div>
  );
}

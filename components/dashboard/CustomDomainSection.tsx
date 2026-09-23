"use client";
import { useState } from "react";
import { Check, Globe2, Loader2, RefreshCw, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CNAME_TARGET, APEX_A_RECORD, isValidDomain, normalizeDomain } from "@/lib/domain";
import { cn } from "@/lib/utils";

export function CustomDomainSection({ profileId, initialDomain, initialVerified }: { profileId: string; initialDomain: string | null; initialVerified: boolean }) {
  const supabase = createClient();
  const [domain, setDomain] = useState(initialDomain || "");
  const [saved, setSaved] = useState(initialDomain || "");
  const [verified, setVerified] = useState(initialVerified);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyDetail, setVerifyDetail] = useState<string | null>(null);

  async function handleConnect() {
    setError(null);
    const clean = normalizeDomain(domain);
    if (!isValidDomain(clean)) { setError("Enter a real domain you own, like links.yourbrand.com"); return; }
    setSaving(true);
    const { error: updateError } = await supabase.from("profiles").update({ custom_domain: clean, custom_domain_verified: false }).eq("id", profileId);
    setSaving(false);
    if (updateError) { setError(updateError.code === "23505" ? "That domain is already connected to another CRbio page." : updateError.message); return; }
    setDomain(clean); setSaved(clean); setVerified(false); setVerifyDetail(null);
  }

  async function handleDisconnect() {
    setSaving(true);
    await supabase.from("profiles").update({ custom_domain: null, custom_domain_verified: false }).eq("id", profileId);
    setSaving(false); setDomain(""); setSaved(""); setVerified(false); setVerifyDetail(null);
  }

  async function handleVerify() {
    setVerifying(true); setVerifyDetail(null);
    try {
      const res = await fetch("/api/domains/verify", { method: "POST" });
      const data = await res.json();
      setVerified(Boolean(data.verified));
      if (!data.verified) setVerifyDetail(data.detail || "Not verified yet.");
    } catch { setVerifyDetail("Couldn't check right now — try again in a moment."); }
    setVerifying(false);
  }

  return (
    <section className="glass-panel p-6">
      <h2 className="label-eyebrow mb-1 flex items-center gap-2"><Globe2 className="h-3.5 w-3.5" />Custom domain</h2>
      <p className="mb-4 text-sm text-mist">Point your own domain at your CRbio page — included free, no paid plan required.</p>

      {!saved ? (
        <div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input value={domain} onChange={(e) => setDomain(e.target.value)} className="input-field flex-1" placeholder="links.yourbrand.com" />
            <button onClick={handleConnect} disabled={saving} className="btn-primary shrink-0 !px-5 !py-3 text-sm">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}</button>
          </div>
          {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-white">{saved}</span>
              <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", verified ? "bg-emerald-500/15 text-emerald-300" : "bg-gold/15 text-gold")}>{verified ? <Check className="h-2.5 w-2.5" /> : null}{verified ? "Verified" : "Pending DNS"}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleVerify} disabled={verifying} className="btn-secondary !px-3.5 !py-1.5 text-xs">{verifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}{verified ? "Re-check" : "Verify"}</button>
              <button onClick={handleDisconnect} disabled={saving} className="rounded-lg p-1.5 text-mist hover:bg-red-500/15 hover:text-red-300" aria-label="Disconnect domain"><X className="h-4 w-4" /></button>
            </div>
          </div>
          {verifyDetail && !verified && <p className="text-xs text-mist">{verifyDetail}</p>}
          {!verified && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="mb-3 text-xs font-medium text-mist">Add one of these DNS records at your domain provider:</p>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-lg bg-black/30 px-3 py-2"><span className="text-mist">Type: CNAME</span><span className="text-mist">Name: {saved.split(".")[0]}</span><span className="text-white">Value: {CNAME_TARGET}</span></div>
                <p className="px-1 text-[11px] text-mist/60">— or, for a root/apex domain —</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-lg bg-black/30 px-3 py-2"><span className="text-mist">Type: A</span><span className="text-mist">Name: @</span><span className="text-white">Value: {APEX_A_RECORD}</span></div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-mist/60">DNS changes can take a few minutes to a few hours to take effect. You'll also need to add this domain in your hosting provider's project settings (e.g. Vercel → Project → Domains) so it can issue an SSL certificate for it.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

"use client";
import { useState } from "react";
import { Check, Loader2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export function LeadCaptureBlock({ linkId, profileId, title, description, accent, isLight, buttonShapeClass, interactive = true }: {
  linkId: string; profileId: string; title: string; description: string | null; accent: string; isLight: boolean; buttonShapeClass: string; interactive?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!interactive) return;
    setStatus("loading"); setError(null);
    try {
      const res = await fetch("/api/leads/capture", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ linkId, profileId, email, name, website }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); setStatus("error"); return; }
      setStatus("done");
    } catch { setError("Network error — try again."); setStatus("error"); }
  }

  if (status === "done") {
    return (
      <div className={cn("flex w-full flex-col items-center gap-2 rounded-xl border px-5 py-6 text-center", isLight ? "border-ink/10 bg-ink/[0.03]" : "border-white/10 bg-white/[0.04]")}>
        <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: accent }}><Check className="h-4 w-4 text-white" /></div>
        <p className={cn("text-sm font-medium", isLight ? "text-ink" : "text-white")}>You're on the list.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative w-full space-y-3 rounded-xl border px-5 py-5", isLight ? "border-ink/10 bg-ink/[0.03]" : "border-white/10 bg-white/[0.04]")}>
      <div className="flex items-center gap-2"><Mail className="h-4 w-4" style={{ color: accent }} /><p className={cn("text-sm font-semibold", isLight ? "text-ink" : "text-white")}>{title}</p></div>
      {description && <p className={cn("text-xs leading-relaxed", isLight ? "text-ink/60" : "text-white/60")}>{description}</p>}
      <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
        <label>Website<input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>
      <input type="text" placeholder="Name (optional)" value={name} disabled={!interactive} onChange={(e) => setName(e.target.value)} className={cn("w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none disabled:opacity-70", isLight ? "border-ink/15 bg-white text-ink placeholder:text-ink/40" : "border-white/15 bg-white/[0.06] text-white placeholder:text-white/40")} />
      <input type="email" required={interactive} disabled={!interactive} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={cn("w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none disabled:opacity-70", isLight ? "border-ink/15 bg-white text-ink placeholder:text-ink/40" : "border-white/15 bg-white/[0.06] text-white placeholder:text-white/40")} />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button type="submit" disabled={status === "loading" || !interactive} className={cn(buttonShapeClass, "flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold disabled:opacity-90")} style={{ background: accent, color: "#0A0A12" }}>
        {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
      </button>
    </form>
  );
}

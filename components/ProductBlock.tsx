"use client";
import { useState } from "react";
import { Check, Download, ExternalLink, Loader2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

function formatPrice(cents: number | null, currency: string): string {
  if (!cents || cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function ProductBlock({ linkId, title, description, priceCents, currency, deliveryType, externalCheckoutUrl, accent, isLight, buttonShapeClass, interactive = true }: {
  linkId: string; title: string; description: string | null; priceCents: number | null; currency: string;
  deliveryType: "file" | "external" | null; externalCheckoutUrl: string | null; accent: string; isLight: boolean; buttonShapeClass: string; interactive?: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const price = formatPrice(priceCents, currency);
  const isFree = !priceCents || priceCents === 0;

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!interactive) return;
    setStatus("loading"); setError(null);
    try {
      const res = await fetch("/api/products/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ linkId, email, name, website }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); setStatus("error"); return; }
      setStatus("done");
      if (data.fileUrl) window.open(data.fileUrl, "_blank", "noopener,noreferrer");
    } catch { setError("Network error — try again."); setStatus("error"); }
  }

  return (
    <div className={cn("w-full overflow-hidden rounded-xl border", isLight ? "border-ink/10 bg-ink/[0.03]" : "border-white/10 bg-white/[0.04]")}>
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: `${accent}26` }}><Package className="h-4.5 w-4.5" style={{ color: accent }} /></div>
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-sm font-semibold", isLight ? "text-ink" : "text-white")}>{title}</p>
          {description && <p className={cn("mt-0.5 truncate text-xs", isLight ? "text-ink/60" : "text-white/60")}>{description}</p>}
        </div>
        <span className={cn("shrink-0 text-sm font-bold", isLight ? "text-ink" : "text-white")}>{price}</span>
      </div>

      {deliveryType === "external" && externalCheckoutUrl ? (
        <a href={interactive ? externalCheckoutUrl : undefined} target="_blank" rel="noreferrer" className={cn(buttonShapeClass, "mx-4 mb-4 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold")} style={{ background: accent, color: "#0A0A12" }}>
          {isFree ? "Get it" : "Buy now"}<ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : status === "done" ? (
        <div className="mx-4 mb-4 flex items-center justify-center gap-2 rounded-lg bg-emerald-500/15 px-4 py-2.5 text-sm font-medium text-emerald-300"><Check className="h-4 w-4" />Check your downloads</div>
      ) : showForm ? (
        <form onSubmit={handleClaim} className="relative mx-4 mb-4 space-y-2.5">
          <div className="absolute -left-[9999px] opacity-0" aria-hidden="true"><input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></div>
          <input type="text" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} className={cn("w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none", isLight ? "border-ink/15 bg-white text-ink placeholder:text-ink/40" : "border-white/15 bg-white/[0.06] text-white placeholder:text-white/40")} />
          <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={cn("w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none", isLight ? "border-ink/15 bg-white text-ink placeholder:text-ink/40" : "border-white/15 bg-white/[0.06] text-white placeholder:text-white/40")} />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={status === "loading"} className={cn(buttonShapeClass, "flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold")} style={{ background: accent, color: "#0A0A12" }}>
            {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Download className="h-3.5 w-3.5" />Download</>)}
          </button>
        </form>
      ) : (
        <button onClick={() => interactive && setShowForm(true)} className={cn(buttonShapeClass, "mx-4 mb-4 flex w-[calc(100%-2rem)] items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold")} style={{ background: accent, color: "#0A0A12" }}>
          {isFree ? "Get it free" : `Get it — ${price}`}
        </button>
      )}
    </div>
  );
}

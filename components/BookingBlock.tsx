"use client";
import { useEffect, useState } from "react";
import { Calendar, Check, ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DayGroup { dateKey: string; label: string; slots: string[]; }

export function BookingBlock({ linkId, profileId, title, description, accent, isLight, buttonShapeClass, interactive = true }: {
  linkId: string; profileId: string; title: string; description: string | null; accent: string; isLight: boolean; buttonShapeClass: string; interactive?: boolean;
}) {
  const [days, setDays] = useState<DayGroup[] | null>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(true);

  useEffect(() => {
    if (!interactive) { setLoadingSlots(false); return; }
    fetch(`/api/booking/slots?profileId=${profileId}`).then((r) => r.json()).then((data) => { setDays(data.days || []); setLoadingSlots(false); }).catch(() => setLoadingSlots(false));
  }, [profileId, interactive]);

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!interactive || !selectedSlot) return;
    setStatus("loading"); setError(null);
    try {
      const res = await fetch("/api/booking/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ linkId, profileId, name, email, notes, startsAt: selectedSlot, durationMinutes: 30, website }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); setStatus("error"); return; }
      setStatus("done");
    } catch { setError("Network error — try again."); setStatus("error"); }
  }

  const wrapClass = cn("w-full overflow-hidden rounded-xl border", isLight ? "border-ink/10 bg-ink/[0.03]" : "border-white/10 bg-white/[0.04]");

  if (status === "done") {
    return (
      <div className={cn(wrapClass, "flex flex-col items-center gap-2 px-5 py-6 text-center")}>
        <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: accent }}><Check className="h-4 w-4 text-white" /></div>
        <p className={cn("text-sm font-medium", isLight ? "text-ink" : "text-white")}>You're booked.</p>
        <p className={cn("text-xs", isLight ? "text-ink/60" : "text-white/60")}>A confirmation was sent to {email}.</p>
      </div>
    );
  }

  return (
    <div className={cn(wrapClass, "px-5 py-4")}>
      <div className="flex items-center gap-2"><Calendar className="h-4 w-4" style={{ color: accent }} /><p className={cn("text-sm font-semibold", isLight ? "text-ink" : "text-white")}>{title}</p></div>
      {description && <p className={cn("mt-1 text-xs leading-relaxed", isLight ? "text-ink/60" : "text-white/60")}>{description}</p>}

      {loadingSlots ? (
        <div className="mt-4 flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin" style={{ color: accent }} /></div>
      ) : !days || days.length === 0 ? (
        <p className={cn("mt-4 text-xs", isLight ? "text-ink/50" : "text-white/50")}>No open times right now — check back soon.</p>
      ) : (
        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={() => setDayIndex((i) => Math.max(0, i - 1))} disabled={dayIndex === 0} className="rounded-full p-1.5 text-mist disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <p className={cn("text-xs font-medium", isLight ? "text-ink" : "text-white")}>{days[dayIndex]?.label}</p>
            <button type="button" onClick={() => setDayIndex((i) => Math.min(days.length - 1, i + 1))} disabled={dayIndex === days.length - 1} className="rounded-full p-1.5 text-mist disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {days[dayIndex]?.slots.map((iso) => {
              const time = new Date(iso).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
              const active = selectedSlot === iso;
              return (
                <button key={iso} type="button" onClick={() => setSelectedSlot(iso)} className={cn("rounded-lg border px-2 py-2 text-xs font-medium transition-colors", active ? "text-white" : isLight ? "border-ink/15 text-ink/70" : "border-white/15 text-white/70")} style={active ? { background: accent, borderColor: accent } : undefined}>
                  {time}
                </button>
              );
            })}
          </div>

          {selectedSlot && (
            <form onSubmit={handleConfirm} className="relative mt-4 space-y-2.5 border-t pt-4" style={{ borderColor: isLight ? "rgba(10,10,18,0.1)" : "rgba(255,255,255,0.1)" }}>
              <div className="absolute -left-[9999px] opacity-0" aria-hidden="true"><input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></div>
              <div className={cn("flex items-center gap-1.5 text-xs", isLight ? "text-ink/60" : "text-white/60")}><Clock className="h-3 w-3" />{new Date(selectedSlot).toLocaleString("en", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</div>
              <input type="text" required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className={cn("w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none", isLight ? "border-ink/15 bg-white text-ink placeholder:text-ink/40" : "border-white/15 bg-white/[0.06] text-white placeholder:text-white/40")} />
              <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={cn("w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none", isLight ? "border-ink/15 bg-white text-ink placeholder:text-ink/40" : "border-white/15 bg-white/[0.06] text-white placeholder:text-white/40")} />
              <textarea placeholder="Anything I should know? (optional)" value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 500))} rows={2} className={cn("w-full resize-none rounded-lg border px-3.5 py-2.5 text-sm outline-none", isLight ? "border-ink/15 bg-white text-ink placeholder:text-ink/40" : "border-white/15 bg-white/[0.06] text-white placeholder:text-white/40")} />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button type="submit" disabled={status === "loading"} className={cn(buttonShapeClass, "flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold")} style={{ background: accent, color: "#0A0A12" }}>
                {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm booking"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

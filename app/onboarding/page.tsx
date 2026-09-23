"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { isValidUsername, normalizeUsername, DEFAULT_THEME } from "@/lib/utils";

type Availability = "idle" | "checking" | "available" | "taken" | "invalid";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [username, setUsername] = useState("");
  const [availability, setAvailability] = useState<Availability>("idle");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const { data: existing } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
      if (existing) router.replace("/dashboard");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const clean = normalizeUsername(username);
    if (clean.length < 3) { setAvailability(clean.length === 0 ? "idle" : "invalid"); return; }
    if (!isValidUsername(clean)) { setAvailability("invalid"); return; }
    setAvailability("checking");
    const timeout = setTimeout(async () => {
      const { data } = await supabase.from("profiles").select("id").eq("username", clean).maybeSingle();
      setAvailability(data ? "taken" : "available");
    }, 400);
    return () => clearTimeout(timeout);
  }, [username]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (availability !== "available") return;
    setSaving(true); setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/login"); return; }
    const clean = normalizeUsername(username);
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id, username: clean, display_name: user.user_metadata?.full_name || clean, theme: DEFAULT_THEME,
    });
    setSaving(false);
    if (insertError) { setError(insertError.code === "23505" ? "That handle was just taken. Try another." : insertError.message); return; }
    router.push("/dashboard"); router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-grain-glow" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="glass-panel p-8">
          <h1 className="font-display text-2xl font-medium text-white">Claim your handle</h1>
          <p className="mt-1.5 text-sm text-mist">This is your permanent CRbio address. Choose carefully.</p>
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-mist">crbio.app/</span>
                <input autoFocus value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} className="input-field pl-[5.6rem] pr-10" placeholder="yourname" maxLength={30} />
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
                {availability === "idle" && "Lowercase letters, numbers, and underscores only."}
              </p>
            </div>
            {error && <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
            <button type="submit" disabled={availability !== "available" || saving} className="btn-primary w-full">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue to dashboard"}</button>
          </form>
        </div>
      </div>
    </main>
  );
}

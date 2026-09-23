"use client";
import { useEffect, useState } from "react";
import { use as usePromise } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2, Users } from "lucide-react";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = usePromise(params);
  const router = useRouter();
  const supabase = createClient();

  const [status, setStatus] = useState<"checking" | "needs-login" | "accepting" | "done" | "error">("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStatus("needs-login"); return; }
      await acceptInvite();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function acceptInvite() {
    setStatus("accepting");
    try {
      const res = await fetch("/api/team/accept", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Couldn't accept this invite."); setStatus("error"); return; }
      setStatus("done");
      setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1500);
    } catch {
      setError("Something went wrong."); setStatus("error");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-grain-glow" />
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="glass-panel p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet/15 text-violet-soft"><Users className="h-5 w-5" /></div>
          <h1 className="font-display text-2xl font-medium text-white">Team invite</h1>

          {status === "checking" && <Loader2 className="mx-auto mt-6 h-5 w-5 animate-spin text-mist" />}

          {status === "needs-login" && (
            <>
              <p className="mt-2 text-sm text-mist">Log in or create an account to accept this invite.</p>
              <div className="mt-6 flex flex-col gap-3">
                <Link href={`/login?next=/team/accept/${token}`} className="btn-primary w-full">Log in</Link>
                <Link href={`/signup?next=/team/accept/${token}`} className="btn-secondary w-full">Create an account</Link>
              </div>
            </>
          )}

          {status === "accepting" && (
            <div className="mt-6 flex flex-col items-center gap-3"><Loader2 className="h-5 w-5 animate-spin text-mist" /><p className="text-sm text-mist">Accepting invite…</p></div>
          )}

          {status === "done" && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"><Check className="h-5 w-5" /></div>
              <p className="text-sm text-white">You're in — redirecting to the dashboard.</p>
            </div>
          )}

          {status === "error" && (
            <div className="mt-6">
              <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>
              <Link href="/dashboard" className="btn-secondary mt-4 w-full">Go to dashboard</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

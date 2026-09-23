"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Mail, MailCheck } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { GoogleButton } from "@/components/GoogleButton";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    setLoading(false);
    if (signUpError) { setError(signUpError.message); return; }
    if (data.session) { router.push("/dashboard"); router.refresh(); return; }
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <AuthShell title="Check your inbox" subtitle="One more step before your CRbio page goes live."
        footer={<span>Wrong email? <button onClick={() => setSentTo(null)} className="font-medium text-violet-soft hover:underline">Try again</button></span>}>
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet/15 text-violet-soft"><MailCheck className="h-6 w-6" /></div>
          <p className="text-sm leading-relaxed text-mist">We sent a confirmation link to <span className="text-white">{sentTo}</span>. Click it to activate your account and claim your handle.</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create your CRbio" subtitle="Free forever. No card required."
      footer={<span>Already have an account? <Link href="/login" className="font-medium text-violet-soft hover:underline">Log in</Link></span>}>
      <GoogleButton next="/dashboard" />
      <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-white/10" /><span className="text-xs uppercase tracking-wider text-mist/70">or</span><div className="h-px flex-1 bg-white/10" /></div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-mist">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-11" placeholder="you@example.com" />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-mist">Password</label>
          <input id="password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="At least 8 characters" />
        </div>
        {error && <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}</button>
      </form>
      <p className="mt-6 text-center text-xs leading-relaxed text-mist/70">By continuing you agree to CRbio's Terms of Service and Privacy Policy.</p>
    </AuthShell>
  );
}

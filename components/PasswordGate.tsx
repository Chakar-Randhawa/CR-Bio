"use client";

import { useState } from "react";
import { AlertCircle, Lock, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

/**
 * Rendered server-side in place of the real page content when a
 * profile is password-protected and the visitor hasn't unlocked it
 * yet — the actual links/bio data is never fetched for this render,
 * so there's nothing sensitive in the page source to inspect.
 */
export function PasswordGate({ profileId, displayName }: { profileId: string; displayName: string }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/pages/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Incorrect password.");
        setLoading(false);
        return;
      }

      window.location.reload();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-grain-glow" />
      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="glass-panel p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet/15 text-violet-soft">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="font-display text-xl text-white">{displayName} is private</h1>
          <p className="mt-1.5 text-sm text-mist">Enter the password to view this page.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <input
              type="password"
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field text-center"
              placeholder="Password"
            />
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-left text-sm text-red-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unlock"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

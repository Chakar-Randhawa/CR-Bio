"use client";

import { useState } from "react";
import { Check, Loader2, Lock, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function PagePasswordSection({ profileId, initialProtected }: { profileId: string; initialProtected: boolean }) {
  const supabase = createClient();
  const [protectedNow, setProtectedNow] = useState(initialProtected);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.trim().length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    setSaving(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("set_page_password", { p_password: password.trim() });
    setSaving(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setProtectedNow(true);
    setPassword("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleRemove() {
    setSaving(true);
    await supabase.rpc("set_page_password", { p_password: null });
    setSaving(false);
    setProtectedNow(false);
  }

  return (
    <section className="glass-panel p-6">
      <h2 className="label-eyebrow mb-1 flex items-center gap-2">
        <Lock className="h-3.5 w-3.5" />
        Password protect your page
      </h2>
      <p className="mb-4 text-sm text-mist">Visitors need the password to see anything — nothing about your page is sent to their browser until they enter it correctly.</p>

      {protectedNow ? (
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-emerald-300">
            <Check className="h-4 w-4" />
            Password protection is on
          </span>
          <button onClick={handleRemove} disabled={saving} className="btn-secondary !px-3.5 !py-1.5 text-xs">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
            Remove
          </button>
        </div>
      ) : (
        <form onSubmit={handleSetPassword} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field flex-1"
            placeholder="Choose a password"
            minLength={4}
          />
          <button type="submit" disabled={saving} className="btn-primary shrink-0 !px-5 !py-3 text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : "Protect page"}
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </section>
  );
}

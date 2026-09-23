"use client";
import { useState } from "react";
import { Check, Copy, Loader2, Mail, Plus, Trash2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TeamManager({ profileId, initialMembers }: { profileId: string; initialMembers: TeamMember[] }) {
  const supabase = createClient();
  const [members, setMembers] = useState(initialMembers);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInviting(true);
    try {
      const res = await fetch("/api/team/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim() || null }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Couldn't create invite."); setInviting(false); return; }

      const { data: fresh } = await supabase.from("team_members").select("*").eq("profile_id", profileId).order("created_at", { ascending: false });
      setMembers(fresh || []);
      setEmail("");
    } catch {
      setError("Something went wrong.");
    }
    setInviting(false);
  }

  async function handleRevoke(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    await supabase.from("team_members").delete().eq("id", id);
  }

  function copyInviteLink(member: TeamMember) {
    const url = `${siteUrl}/team/accept/${member.invite_token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(member.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <section className="glass-panel p-6">
      <h2 className="label-eyebrow mb-1 flex items-center gap-2"><Users className="h-3.5 w-3.5" />Team</h2>
      <p className="mb-4 text-sm text-mist">Invite editors to manage this page's links, appearance, leads, and settings alongside you.</p>

      <form onSubmit={handleInvite} className="flex flex-col gap-2 sm:flex-row">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field flex-1" placeholder="teammate@email.com (optional label)" />
        <button type="submit" disabled={inviting} className="btn-secondary shrink-0 !px-4 !py-3 text-sm">{inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Create invite link</button>
      </form>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}

      <div className="mt-5 space-y-2.5">
        {members.length === 0 ? (
          <p className="text-sm text-mist">No team members yet.</p>
        ) : members.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet/15 text-violet-soft"><Mail className="h-3.5 w-3.5" /></div>
              <div>
                <p className="text-sm text-white/90">{m.invited_email || "Unlabeled invite"}</p>
                <span className={cn("text-[11px] font-medium", m.status === "accepted" ? "text-emerald-400" : "text-gold")}>{m.status === "accepted" ? "Active" : "Pending — share the invite link"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {m.status === "pending" && (
                <button onClick={() => copyInviteLink(m)} className="rounded-lg p-2 text-mist hover:bg-white/[0.06] hover:text-white" aria-label="Copy invite link" title="Copy invite link">
                  {copiedId === m.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
              <button onClick={() => handleRevoke(m.id)} className="rounded-lg p-2 text-mist hover:bg-red-500/15 hover:text-red-300" aria-label="Remove"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-mist/60">Editors can manage links, appearance, leads, bookings, products, and the chatbot. They can't delete the account or manage the team.</p>
    </section>
  );
}

"use client";
import { useMemo, useState } from "react";
import { Download, Loader2, Mail, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, formatCompactNumber } from "@/lib/utils";

interface LeadRow { id: string; link_id: string; email: string; name: string | null; captured_at: string; }
interface CaptureBlock { id: string; title: string; }

export function LeadsView({ initialLeads, captureBlocks }: { initialLeads: LeadRow[]; captureBlocks: CaptureBlock[] }) {
  const supabase = createClient();
  const [leads, setLeads] = useState(initialLeads);
  const [filter, setFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => (filter === "all" ? leads : leads.filter((l) => l.link_id === filter)), [leads, filter]);
  const blockTitleFor = useMemo(() => { const map = new Map(captureBlocks.map((b) => [b.id, b.title])); return (linkId: string) => map.get(linkId) || "Deleted block"; }, [captureBlocks]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await supabase.from("leads").delete().eq("id", id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setDeletingId(null);
  }

  function exportCsv() {
    const header = ["Email", "Name", "Capture block", "Captured at"];
    const rows = filtered.map((l) => [l.email, l.name || "", blockTitleFor(l.link_id), new Date(l.captured_at).toISOString()]);
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `crbio-leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="font-display text-2xl text-white">Leads</h1><p className="mt-1 text-sm text-mist">{formatCompactNumber(leads.length)} email{leads.length === 1 ? "" : "s"} captured from your bio page.</p></div>
        <button onClick={exportCsv} disabled={filtered.length === 0} className="btn-secondary !px-4 !py-2 text-xs disabled:opacity-40"><Download className="h-3.5 w-3.5" />Export CSV</button>
      </div>

      {captureBlocks.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter("all")} className={cn("rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors", filter === "all" ? "border-violet-soft bg-violet/15 text-white" : "border-white/10 text-mist hover:border-white/25")}>All blocks</button>
          {captureBlocks.map((b) => (<button key={b.id} onClick={() => setFilter(b.id)} className={cn("rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors", filter === b.id ? "border-violet-soft bg-violet/15 text-white" : "border-white/10 text-mist hover:border-white/25")}>{b.title}</button>))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="glass-panel flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet/15 text-violet-soft"><Mail className="h-5 w-5" /></div>
          <p className="font-display text-lg text-white">No leads yet</p>
          <p className="max-w-xs text-sm text-mist">Add an email capture block from the Links tab, and submissions will show up here.</p>
        </div>
      ) : (
        <div className="glass-panel divide-y divide-white/[0.06] overflow-hidden">
          {filtered.map((lead) => (
            <div key={lead.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet/15 text-violet-soft"><Mail className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{lead.email}</p>
                <p className="truncate text-xs text-mist">{lead.name ? `${lead.name} · ` : ""}{blockTitleFor(lead.link_id)} · {new Date(lead.captured_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
              <button onClick={() => handleDelete(lead.id)} disabled={deletingId === lead.id} className="rounded-lg p-2 text-mist hover:bg-red-500/15 hover:text-red-300" aria-label="Delete lead">
                {deletingId === lead.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

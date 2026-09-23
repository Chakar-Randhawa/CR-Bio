"use client";
import { AlertCircle, ExternalLink } from "lucide-react";
import { cn, formatCompactNumber } from "@/lib/utils";

interface CreatorRow {
  id: string;
  username: string;
  display_name: string | null;
  is_published: boolean;
  created_at: string;
  link_count: number;
  total_clicks: number;
}

export function AdminCreatorsTable({ creators, error }: { creators: CreatorRow[]; error: string | null }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white">Creators</h1>
        <p className="mt-1 text-sm text-mist">Most recently joined, newest first.</p>
      </div>

      <div className="glass-panel overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-mist">
              <th className="px-5 py-3 font-medium">Creator</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Blocks</th>
              <th className="px-5 py-3 text-right font-medium">Clicks</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {creators.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                <td className="px-5 py-3 text-white/90">
                  <p className="font-medium">{c.display_name || c.username}</p>
                  <p className="font-mono text-xs text-mist">@{c.username}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", c.is_published ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-mist")}>
                    {c.is_published ? "Published" : "Hidden"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-mono text-xs text-mist">{formatCompactNumber(c.link_count)}</td>
                <td className="px-5 py-3 text-right font-mono text-xs text-mist">{formatCompactNumber(c.total_clicks)}</td>
                <td className="px-5 py-3 text-xs text-mist">{new Date(c.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</td>
                <td className="px-5 py-3">
                  <a href={`${siteUrl}/${c.username}`} target="_blank" rel="noreferrer" className="text-mist hover:text-white" aria-label="View page">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

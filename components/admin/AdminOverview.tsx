"use client";
import { AlertCircle, Bot, Calendar, Globe2, Link2, Mail, Package, TrendingUp, Users } from "lucide-react";
import { formatCompactNumber } from "@/lib/utils";

interface Stats {
  total_profiles: number;
  published_profiles: number;
  total_links: number;
  total_clicks_all_time: number;
  total_views_30d: number;
  total_clicks_30d: number;
  total_leads: number;
  total_bookings: number;
  total_product_orders: number;
  new_profiles_7d: number;
  chatbot_enabled_count: number;
  custom_domain_count: number;
}

export function AdminOverview({ stats, error }: { stats: Stats | null; error: string | null }) {
  if (error || !stats) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error || "Couldn't load platform stats."}</span>
        </div>
      </div>
    );
  }

  const cards = [
    { icon: Users, label: "Total creators", value: stats.total_profiles, sublabel: `${stats.published_profiles} published` },
    { icon: TrendingUp, label: "New this week", value: stats.new_profiles_7d },
    { icon: Link2, label: "Total links/blocks", value: stats.total_links },
    { icon: TrendingUp, label: "Clicks (all time)", value: stats.total_clicks_all_time },
    { icon: TrendingUp, label: "Views (30 days)", value: stats.total_views_30d },
    { icon: TrendingUp, label: "Clicks (30 days)", value: stats.total_clicks_30d },
    { icon: Mail, label: "Leads captured", value: stats.total_leads },
    { icon: Calendar, label: "Bookings confirmed", value: stats.total_bookings },
    { icon: Package, label: "Product orders", value: stats.total_product_orders },
    { icon: Bot, label: "Chatbot enabled", value: stats.chatbot_enabled_count },
    { icon: Globe2, label: "Custom domains", value: stats.custom_domain_count },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-2xl text-white">Platform overview</h1>
        <p className="mt-1 text-sm text-mist">Aggregate stats across every CRbio creator.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="glass-panel p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet/15 text-violet-soft"><c.icon className="h-4 w-4" /></div>
            <p className="mt-4 font-mono text-2xl text-white">{formatCompactNumber(c.value)}</p>
            <p className="mt-1 text-xs text-mist">{c.label}</p>
            {c.sublabel && <p className="mt-0.5 text-xs text-mist/60">{c.sublabel}</p>}
          </div>
        ))}
      </div>

      <p className="text-[11px] text-mist/50">
        These figures come from a security-definer database function scoped to admin accounts only — it never exposes individual creators' private leads, bookings, or chatbot content, only aggregate counts.
      </p>
    </div>
  );
}

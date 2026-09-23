"use client";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Download, FileText, Globe2, Laptop, MousePointerClick, Radio, Smartphone, Tablet, TrendingUp } from "lucide-react";
import { cn, formatCompactNumber } from "@/lib/utils";

interface DayBucket { date: string; label: string; clicks: number; views: number; }
interface TopLink { id: string; title: string; click_count: number; }
interface CountEntry { label: string; count: number; }

const RANGE_OPTIONS = [{ days: 7, label: "7 days" }, { days: 14, label: "14 days" }, { days: 30, label: "30 days" }, { days: 90, label: "90 days" }];
const DEVICE_ICON: Record<string, typeof Smartphone> = { Mobile: Smartphone, Tablet: Tablet, Desktop: Laptop };

function exportCsv({ series, topLinks, topCountries, topDevices, topReferrers }: {
  series: DayBucket[]; topLinks: TopLink[]; topCountries: CountEntry[]; topDevices: CountEntry[]; topReferrers: CountEntry[];
}) {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines: string[] = [];

  lines.push("Daily clicks & views");
  lines.push(["Date", "Clicks", "Views"].map(escape).join(","));
  series.forEach((d) => lines.push([d.date, d.clicks, d.views].map(escape).join(",")));
  lines.push("");

  lines.push("Clicks by link");
  lines.push(["Link", "Clicks"].map(escape).join(","));
  topLinks.forEach((l) => lines.push([l.title, l.click_count].map(escape).join(",")));
  lines.push("");

  lines.push("Visitors by country");
  lines.push(["Country", "Visits"].map(escape).join(","));
  topCountries.forEach((c) => lines.push([c.label, c.count].map(escape).join(",")));
  lines.push("");

  lines.push("Devices");
  lines.push(["Device", "Visits"].map(escape).join(","));
  topDevices.forEach((d) => lines.push([d.label, d.count].map(escape).join(",")));
  lines.push("");

  lines.push("Top referrers");
  lines.push(["Referrer", "Visits"].map(escape).join(","));
  topReferrers.forEach((r) => lines.push([r.label, r.count].map(escape).join(",")));

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `crbio-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AnalyticsView({ rangeDays, series, totalClicks, totalViews, topLinks, topCountries, topDevices, topReferrers }: {
  rangeDays: number; series: DayBucket[]; totalClicks: number; totalViews: number; topLinks: TopLink[]; topCountries: CountEntry[]; topDevices: CountEntry[]; topReferrers: CountEntry[];
}) {
  const maxClicks = Math.max(...topLinks.map((l) => l.click_count), 1);
  const maxCountry = Math.max(...topCountries.map((c) => c.count), 1);
  const maxReferrer = Math.max(...topReferrers.map((r) => r.count), 1);
  const totalDeviceEvents = topDevices.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="font-display text-2xl text-white">Analytics</h1><p className="mt-1 text-sm text-mist">How your page is performing.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
            {RANGE_OPTIONS.map((opt) => (
              <Link key={opt.days} href={`/dashboard/analytics?range=${opt.days}`} className={cn("rounded-full px-3 py-1.5 text-xs font-medium transition-colors", rangeDays === opt.days ? "bg-violet/20 text-white" : "text-mist hover:text-white")}>{opt.label}</Link>
            ))}
          </div>
          <button onClick={() => exportCsv({ series, topLinks, topCountries, topDevices, topReferrers })} className="btn-secondary !px-3.5 !py-2 text-xs">
            <Download className="h-3.5 w-3.5" />CSV
          </button>
          <button onClick={() => window.print()} className="btn-secondary !px-3.5 !py-2 text-xs">
            <FileText className="h-3.5 w-3.5" />PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={MousePointerClick} label="Total clicks (all time)" value={totalClicks} />
        <StatCard icon={TrendingUp} label={`Page views (last ${rangeDays} days)`} value={totalViews} />
        <StatCard icon={BarChart3} label="Best performing link" value={topLinks[0]?.click_count ?? 0} sublabel={topLinks[0]?.title} />
      </div>

      <section className="glass-panel p-6">
        <h2 className="label-eyebrow mb-6">Clicks &amp; views — last {rangeDays} days</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C6CF6" stopOpacity={0.5} /><stop offset="100%" stopColor="#7C6CF6" stopOpacity={0} /></linearGradient>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F0B429" stopOpacity={0.4} /><stop offset="100%" stopColor="#F0B429" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#A6A6BF", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} interval={rangeDays > 30 ? 6 : rangeDays > 14 ? 2 : 1} />
              <YAxis tick={{ fill: "#A6A6BF", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
              <Tooltip contentStyle={{ background: "#14101F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} labelStyle={{ color: "#F7F7FB" }} />
              <Area type="monotone" dataKey="views" stroke="#F0B429" strokeWidth={2} fill="url(#viewsGrad)" name="Views" />
              <Area type="monotone" dataKey="clicks" stroke="#7C6CF6" strokeWidth={2} fill="url(#clicksGrad)" name="Clicks" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center gap-5 text-xs text-mist">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet" /> Clicks</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gold" /> Views</span>
        </div>
      </section>

      <section className="glass-panel p-6">
        <h2 className="label-eyebrow mb-5">Clicks by link</h2>
        {topLinks.length === 0 ? <p className="text-sm text-mist">No clicks yet — share your page to start seeing data.</p> : (
          <div className="space-y-3">
            {topLinks.map((link) => (
              <div key={link.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm"><span className="truncate text-white/90">{link.title}</span><span className="font-mono text-xs text-mist">{formatCompactNumber(link.click_count)}</span></div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-violet to-violet-soft" style={{ width: `${(link.click_count / maxClicks) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <section className="glass-panel p-6">
          <h2 className="label-eyebrow mb-5 flex items-center gap-2"><Globe2 className="h-3.5 w-3.5" />Visitors by country</h2>
          {topCountries.length === 0 ? <p className="text-sm text-mist">Not enough data yet.</p> : (
            <div className="space-y-3">
              {topCountries.map((c) => (
                <div key={c.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm"><span className="truncate text-white/90">{c.label}</span><span className="font-mono text-xs text-mist">{formatCompactNumber(c.count)}</span></div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-soft" style={{ width: `${(c.count / maxCountry) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-[11px] text-mist/50">Country detection uses your hosting provider's edge geolocation headers (available automatically on Vercel). Local development shows "Unknown".</p>
        </section>

        <section className="glass-panel p-6">
          <h2 className="label-eyebrow mb-5 flex items-center gap-2"><Radio className="h-3.5 w-3.5" />Devices</h2>
          {topDevices.length === 0 ? <p className="text-sm text-mist">Not enough data yet.</p> : (
            <div className="space-y-4">
              {topDevices.map((d) => {
                const DeviceIcon = DEVICE_ICON[d.label] || Laptop;
                const pct = Math.round((d.count / totalDeviceEvents) * 100);
                return (
                  <div key={d.label} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet/15 text-violet-soft"><DeviceIcon className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between text-sm"><span className="text-white/90">{d.label}</span><span className="font-mono text-xs text-mist">{pct}%</span></div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} /></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="glass-panel p-6">
        <h2 className="label-eyebrow mb-5">Top referrers</h2>
        {topReferrers.length === 0 ? <p className="text-sm text-mist">Not enough data yet.</p> : (
          <div className="space-y-3">
            {topReferrers.map((r) => (
              <div key={r.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm"><span className="truncate font-mono text-xs text-white/90">{r.label}</span><span className="font-mono text-xs text-mist">{formatCompactNumber(r.count)}</span></div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full" style={{ width: `${(r.count / maxReferrer) * 100}%`, background: "#38BDF8" }} /></div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sublabel }: { icon: React.ElementType; label: string; value: number; sublabel?: string }) {
  return (
    <div className="glass-panel p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet/15 text-violet-soft"><Icon className="h-4 w-4" /></div>
      <p className="mt-4 font-mono text-2xl text-white">{formatCompactNumber(value)}</p>
      <p className="mt-1 text-xs text-mist">{label}</p>
      {sublabel && <p className="mt-0.5 truncate text-xs text-mist/60">{sublabel}</p>}
    </div>
  );
}

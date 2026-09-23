import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsView } from "@/components/dashboard/AnalyticsView";
import { countryCodeToName } from "@/lib/device";

const VALID_RANGES = [7, 14, 30, 90] as const;
type RangeDays = (typeof VALID_RANGES)[number];

function parseRange(value: string | undefined): RangeDays {
  const n = Number(value);
  return (VALID_RANGES as readonly number[]).includes(n) ? (n as RangeDays) : 14;
}

function referrerHost(referrer: string | null): string {
  if (!referrer) return "Direct / unknown";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host || "Direct / unknown";
  } catch { return "Direct / unknown"; }
}

function topEntries(counts: Map<string, number>, limit: number) {
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label, count]) => ({ label, count }));
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range: rangeParam } = await searchParams;
  const rangeDays = parseRange(rangeParam);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - (rangeDays - 1));
  rangeStart.setHours(0, 0, 0, 0);

  const [{ data: links }, { data: clicks }, { data: views }] = await Promise.all([
    supabase.from("links").select("id, title, click_count").eq("profile_id", user.id),
    supabase.from("link_clicks").select("clicked_at, link_id, country, device, referrer").eq("profile_id", user.id).gte("clicked_at", rangeStart.toISOString()),
    supabase.from("profile_views").select("viewed_at, country, device, referrer").eq("profile_id", user.id).gte("viewed_at", rangeStart.toISOString()),
  ]);

  const dayBuckets: { date: string; label: string; clicks: number; views: number }[] = [];
  for (let i = 0; i < rangeDays; i++) {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dayBuckets.push({ date: key, label: d.toLocaleDateString("en", { month: "short", day: "numeric" }), clicks: 0, views: 0 });
  }
  const bucketIndex = new Map(dayBuckets.map((b, i) => [b.date, i]));

  const countryCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();

  (clicks || []).forEach((c) => {
    const idx = bucketIndex.get(c.clicked_at.slice(0, 10));
    if (idx !== undefined) dayBuckets[idx].clicks += 1;
  });

  (views || []).forEach((v) => {
    const idx = bucketIndex.get(v.viewed_at.slice(0, 10));
    if (idx !== undefined) dayBuckets[idx].views += 1;
    const countryName = countryCodeToName(v.country);
    countryCounts.set(countryName, (countryCounts.get(countryName) || 0) + 1);
    const device = v.device ? v.device[0].toUpperCase() + v.device.slice(1) : "Unknown";
    deviceCounts.set(device, (deviceCounts.get(device) || 0) + 1);
    const host = referrerHost(v.referrer);
    referrerCounts.set(host, (referrerCounts.get(host) || 0) + 1);
  });

  const totalClicks = (links || []).reduce((sum, l) => sum + (l.click_count || 0), 0);
  const totalViews = views?.length ?? 0;
  const topLinks = [...(links || [])].sort((a, b) => b.click_count - a.click_count).slice(0, 8);

  return (
    <AnalyticsView rangeDays={rangeDays} series={dayBuckets} totalClicks={totalClicks} totalViews={totalViews} topLinks={topLinks}
      topCountries={topEntries(countryCounts, 6)} topDevices={topEntries(deviceCounts, 4)} topReferrers={topEntries(referrerCounts, 6)} />
  );
}

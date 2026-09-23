import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://crbio.app";
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("username, updated_at")
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .limit(5000);

  const profileEntries: MetadataRoute.Sitemap = (profiles || []).map((p) => ({
    url: `${siteUrl}/${p.username}`,
    lastModified: p.updated_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ...profileEntries,
  ];
}

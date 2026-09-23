import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://crbio.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api", "/admin", "/onboarding", "/auth", "/team"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

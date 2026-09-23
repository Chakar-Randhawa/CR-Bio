import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

async function tryCustomDomainRewrite(request: NextRequest): Promise<NextResponse | null> {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0].toLowerCase();

  const siteHost = (() => {
    try { return new URL(process.env.NEXT_PUBLIC_SITE_URL || "").hostname.toLowerCase(); } catch { return ""; }
  })();

  const isOwnHost = hostname === siteHost || hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".vercel.app") || hostname.endsWith(".crbio.app");

  if (isOwnHost || request.nextUrl.pathname !== "/") return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;

  try {
    const lookup = await fetch(
      `${supabaseUrl}/rest/v1/profiles?select=username&custom_domain=eq.${encodeURIComponent(hostname)}&custom_domain_verified=eq.true&is_published=eq.true&limit=1`,
      { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }, next: { revalidate: 60 } }
    );
    if (!lookup.ok) return null;
    const rows: { username: string }[] = await lookup.json();
    const username = rows[0]?.username;
    if (!username) return null;

    const url = request.nextUrl.clone();
    url.pathname = `/${username}`;
    return NextResponse.rewrite(url);
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const domainRewrite = await tryCustomDomainRewrite(request);
  if (domainRewrite) return domainRewrite;
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

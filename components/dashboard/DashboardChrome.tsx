"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Bot, Calendar, ExternalLink, Globe2, Link2, LogOut, Mail, Package, Palette, Settings } from "lucide-react";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { cn, initialsFromName } from "@/lib/utils";
import { ProductTour } from "@/components/dashboard/ProductTour";

const NAV = [
  { href: "/dashboard", label: "Links", icon: Link2, tour: "nav-links" },
  { href: "/dashboard/appearance", label: "Appearance", icon: Palette, tour: "nav-appearance" },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, tour: "nav-analytics" },
  { href: "/dashboard/leads", label: "Leads", icon: Mail, tour: "nav-leads" },
  { href: "/dashboard/products", label: "Products", icon: Package, tour: "nav-products" },
  { href: "/dashboard/booking", label: "Booking", icon: Calendar, tour: "nav-booking" },
  { href: "/dashboard/chatbot", label: "Chatbot", icon: Bot, tour: "nav-chatbot" },
  { href: "/dashboard/languages", label: "Languages", icon: Globe2, tour: "nav-languages" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, tour: "nav-settings" },
];

export function DashboardChrome({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 bg-grain-glow" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 px-5 py-6 md:flex print:hidden">
          <Link href="/" className="mb-8 px-2"><Logo /></Link>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} data-tour={item.tour} className={cn("flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors", active ? "bg-violet/15 text-white" : "text-mist hover:bg-white/[0.05] hover:text-white")}>
                  <item.icon className="h-4 w-4" />{item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
            <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-mist transition-colors hover:bg-white/[0.05] hover:text-white">
              <LogOut className="h-4 w-4" />Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4 print:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-violet/20 font-display text-xs text-white">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : initialsFromName(profile.display_name || profile.username)}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium text-white">{profile.display_name || profile.username}</p>
                <p className="font-mono text-xs text-mist">crbio.app/{profile.username}</p>
              </div>
            </div>
            <a href={`${siteUrl}/${profile.username}`} target="_blank" rel="noreferrer" data-tour="view-live" className="btn-secondary !px-4 !py-2 text-xs">
              View live page<ExternalLink className="h-3.5 w-3.5" />
            </a>
          </header>

          <main className="flex-1 px-6 py-8">{children}</main>

          <ProductTour profileId={profile.id} hasSeenTour={profile.has_seen_tour} />

          <nav className="sticky bottom-0 flex items-center justify-around overflow-x-auto border-t border-white/10 bg-ink/95 py-2 backdrop-blur-xl md:hidden print:hidden">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={cn("flex shrink-0 flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-medium", active ? "text-white" : "text-mist")}>
                  <item.icon className="h-4 w-4" />{item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

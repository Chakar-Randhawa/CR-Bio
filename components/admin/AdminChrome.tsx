"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ChevronLeft, ShieldCheck, Users } from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/creators", label: "Creators", icon: Users },
];

export function AdminChrome({ username, children }: { username: string; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 bg-grain-glow" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 px-5 py-6 md:flex print:hidden">
          <Link href="/" className="mb-2 px-2"><Logo /></Link>
          <div className="mb-6 flex items-center gap-1.5 px-2 text-[11px] font-medium text-gold">
            <ShieldCheck className="h-3 w-3" />Platform admin
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors", active ? "bg-violet/15 text-white" : "text-mist hover:bg-white/[0.05] hover:text-white")}>
                  <item.icon className="h-4 w-4" />{item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-white/10 pt-4">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-mist transition-colors hover:bg-white/[0.05] hover:text-white">
              <ChevronLeft className="h-4 w-4" />Back to my page
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4 md:hidden print:hidden">
            <Logo size={22} />
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-gold"><ShieldCheck className="h-3 w-3" />Admin</span>
          </header>
          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

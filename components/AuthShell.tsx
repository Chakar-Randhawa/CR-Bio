import Link from "next/link";
import { Logo } from "@/components/Logo";
export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-grain-glow" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center"><Link href="/"><Logo /></Link></div>
        <div className="glass-panel p-8">
          <h1 className="font-display text-2xl font-medium text-white">{title}</h1>
          <p className="mt-1.5 text-sm text-mist">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
        <div className="mt-6 text-center text-sm text-mist">{footer}</div>
      </div>
    </main>
  );
}

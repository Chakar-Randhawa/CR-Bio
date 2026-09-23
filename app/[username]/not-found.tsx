import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-grain-glow" />
      <div className="relative z-10">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <p className="font-display text-6xl text-white/20">404</p>
        <h1 className="mt-4 font-display text-2xl text-white">This page doesn't exist</h1>
        <p className="mt-2 text-sm text-mist">The handle you're looking for isn't claimed, or the page has been unpublished.</p>
        <Link href="/" className="btn-primary mt-8 inline-flex">Go to CRbio</Link>
      </div>
    </main>
  );
}

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how" },
      { label: "Compare", href: "/#compare" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Create a page", href: "/signup" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Reveal className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist">
              A free link-in-bio platform built by CR Digital Enterprises — unlimited links, real
              analytics, and the features other tools charge for.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="label-eyebrow mb-4">{col.heading}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-mist transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-mist/70 sm:flex-row">
          <span>© {new Date().getFullYear()} CRbio, by CR Digital Enterprises. All rights reserved.</span>
          <span>Unbeatable Prices. Elite Quality. Pay Only If You Are 101% Satisfied.</span>
        </div>
      </div>
    </footer>
  );
}

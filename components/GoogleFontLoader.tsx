"use client";
import { useEffect } from "react";
const LOADED_URLS = new Set<string>();
export function GoogleFontLoader({ href }: { href: string }) {
  useEffect(() => {
    if (!href || LOADED_URLS.has(href)) return;
    if (document.querySelector(`link[href="${href}"]`)) { LOADED_URLS.add(href); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = href;
    document.head.appendChild(link);
    LOADED_URLS.add(href);
  }, [href]);
  return null;
}

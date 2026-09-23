"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const APP_ROUTE_PREFIXES = ["/login", "/signup", "/reset-password", "/onboarding", "/dashboard", "/admin", "/team"];

/**
 * A brief, branded entrance sequence — shown once per browser
 * session, and only on CRbio's own product surfaces (marketing site,
 * auth, dashboard, admin). Creators' public bio pages are excluded
 * on purpose: visitors clicking a shared link need the page instantly,
 * not a splash screen on every click.
 */
export function AppEntranceLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAppSurface = pathname === "/" || APP_ROUTE_PREFIXES.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    setMounted(true);
    if (!isAppSurface) return;

    const alreadySeen = typeof window !== "undefined" && sessionStorage.getItem("crbio-entrance-seen");
    if (alreadySeen) return;

    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("crbio-entrance-seen", "1");
    }, 1100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted || !isAppSurface) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <svg width="44" height="44" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="32" height="32" rx="9" fill="url(#entrance-logo-grad)" />
              <path
                d="M10 21.5V10.5C10 10.2239 10.2239 10 10.5 10H16.7C19.5719 10 21.5 11.8998 21.5 14.5C21.5 16.4127 20.4408 17.8371 18.7818 18.4184L21.8 21.5H18.9L16.2 18.7857H12.6V21.5C12.6 21.7761 12.3761 22 12.1 22H10.5C10.2239 22 10 21.7761 10 21.5Z"
                fill="white"
              />
              <circle cx="16.7" cy="14.35" r="2.15" fill="url(#entrance-logo-grad)" />
              <defs>
                <linearGradient id="entrance-logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#9C8FF9" />
                  <stop offset="1" stopColor="#7C6CF6" />
                </linearGradient>
              </defs>
            </svg>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="h-px w-16 origin-left bg-white/20"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

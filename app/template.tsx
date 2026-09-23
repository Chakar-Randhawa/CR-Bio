"use client";

import { motion } from "framer-motion";

/**
 * Next.js re-mounts template.tsx on every route change, which gives
 * a clean hook for a consistent, subtle fade-and-rise transition
 * between pages — the "fluid" feel across navigation without
 * touching each page's own code.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

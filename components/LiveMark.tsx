"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * A large, slow-rotating brand mark with a soft aurora glow behind
 * it — the signature "live" hero element. Deliberately slow (90s per
 * rotation) and low-contrast so it reads as ambient depth, not a
 * spinner or a loading indicator. Fully decorative — aria-hidden.
 */
export function LiveMark({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={className} aria-hidden="true">
      <div className="relative flex items-center justify-center">
        {/* Aurora glow — three soft blurred blobs drifting slowly */}
        <motion.div
          className="absolute h-[560px] w-[560px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, #7C6CF6 0%, transparent 65%)" }}
          animate={reduceMotion ? undefined : { x: [0, 30, -20, 0], y: [0, -20, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute h-[460px] w-[460px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #F0B429 0%, transparent 65%)" }}
          animate={reduceMotion ? undefined : { x: [0, -25, 25, 0], y: [0, 25, -15, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute h-[380px] w-[380px] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #38BDF8 0%, transparent 65%)" }}
          animate={reduceMotion ? undefined : { x: [0, 18, -30, 0], y: [0, -15, 10, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />

        {/* The rotating mark itself */}
        <motion.div
          className="relative flex h-72 w-72 items-center justify-center rounded-full border border-white/10 sm:h-96 sm:w-96"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute inset-0 rounded-full opacity-70"
            style={{
              background: "conic-gradient(from 0deg, #7C6CF6, #F0B429, #38BDF8, #7C6CF6)",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
            }}
          />
        </motion.div>

        {/* Static, upright center content — counter-rotates so the
            wordmark itself never spins, only the ring around it. */}
        <div className="absolute flex flex-col items-center">
          <span className="font-display text-[64px] font-semibold italic leading-none text-white/[0.07] sm:text-[88px]">CR</span>
          <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.5em] text-white/[0.09]">Bio</span>
        </div>
      </div>
    </div>
  );
}

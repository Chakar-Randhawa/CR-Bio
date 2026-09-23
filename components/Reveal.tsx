"use client";

import { motion, type Variants } from "framer-motion";

const VARIANTS: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Restrained scroll-reveal — a single fade-and-rise on first entry
 * into view, no bounce, no loop, no glow. This is the "enterprise"
 * register: motion that confirms content arrived, not motion that
 * performs for its own sake.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const MotionTag = motion[Tag];
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={VARIANTS}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

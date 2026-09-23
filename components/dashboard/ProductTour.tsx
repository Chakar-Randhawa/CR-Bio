"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TourStep {
  target: string; // matches a [data-tour="..."] attribute
  title: string;
  body: string;
}

const STEPS: TourStep[] = [
  { target: "nav-links", title: "Start here — your links", body: "Add, reorder, and manage every block on your page: links, embeds, products, bookings, and more." },
  { target: "nav-appearance", title: "Make it yours", body: "Pick a theme, fonts, and button style. A live device preview shows exactly what visitors will see." },
  { target: "nav-analytics", title: "See what's working", body: "Clicks, visits, countries, devices, and referrers — real numbers, not vanity stats." },
  { target: "nav-chatbot", title: "Your AI assistant", body: "Turn on a self-contained chat widget that answers visitor questions from Q&A pairs you write." },
  { target: "view-live", title: "Your live page", body: "This always opens your public page in a new tab, exactly as visitors see it." },
  { target: "nav-settings", title: "You're set", body: "Custom domain, QR code, and team access all live in Settings. Explore at your own pace." },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function ProductTour({ profileId, hasSeenTour }: { profileId: string; hasSeenTour: boolean }) {
  const supabase = createClient();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (hasSeenTour) return;
    // Give the dashboard chrome a beat to mount before spotlighting it.
    const t = setTimeout(() => setActive(true), 500);
    return () => clearTimeout(t);
  }, [hasSeenTour]);

  const step = STEPS[stepIndex];

  useEffect(() => {
    if (!active) return;

    function measure() {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active, step]);

  async function finish() {
    setActive(false);
    await supabase.from("profiles").update({ has_seen_tour: true }).eq("id", profileId);
  }

  function next() {
    if (stepIndex === STEPS.length - 1) { finish(); return; }
    setStepIndex((i) => i + 1);
  }

  function back() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  const tooltipStyle = useMemo(() => {
    if (!rect) return null;
    const spaceBelow = window.innerHeight - (rect.top + rect.height);
    const placeBelow = spaceBelow > 220 || rect.top < 220;
    return {
      top: placeBelow ? rect.top + rect.height + 14 : undefined,
      bottom: placeBelow ? undefined : window.innerHeight - rect.top + 14,
      left: Math.min(Math.max(rect.left, 16), window.innerWidth - 320),
    };
  }, [rect]);

  if (!active || hasSeenTour) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[90]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
        {rect ? (
          <motion.div
            key={step.target}
            className="fixed rounded-xl ring-2 ring-violet-soft"
            initial={false}
            animate={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ boxShadow: "0 0 0 9999px rgba(10,10,18,0.78)" }}
          />
        ) : (
          <div className="fixed inset-0" style={{ background: "rgba(10,10,18,0.78)" }} />
        )}

        {tooltipStyle && (
          <motion.div
            key={`tooltip-${step.target}`}
            className="fixed z-[91] w-[300px] rounded-2xl border border-white/10 bg-[#14101F] p-5 shadow-2xl"
            style={tooltipStyle}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-medium text-mist">{stepIndex + 1} of {STEPS.length}</span>
              <button onClick={finish} className="rounded-lg p-1 text-mist hover:bg-white/10 hover:text-white" aria-label="Skip tour">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="font-display text-base text-white">{step.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-mist">{step.body}</p>
            <div className="mt-4 flex items-center justify-between">
              <button onClick={back} disabled={stepIndex === 0} className="text-xs font-medium text-mist hover:text-white disabled:opacity-30">Back</button>
              <button onClick={next} className="flex items-center gap-1.5 rounded-full bg-violet px-4 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-px">
                {stepIndex === STEPS.length - 1 ? "Done" : "Next"}
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

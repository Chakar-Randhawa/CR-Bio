"use client";
import { Check } from "lucide-react";
import { FONT_PAIRS, type FontPairKey, cn } from "@/lib/utils";
import { GoogleFontLoader } from "@/components/GoogleFontLoader";

export function FontPairPicker({ value, onChange }: { value: FontPairKey; onChange: (key: FontPairKey) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {(Object.keys(FONT_PAIRS) as FontPairKey[]).map((key) => {
        const pair = FONT_PAIRS[key];
        const active = value === key;
        return (
          <button key={key} type="button" onClick={() => onChange(key)} className={cn("flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-colors", active ? "border-violet-soft bg-violet/10" : "border-white/10 hover:border-white/25")}>
            <GoogleFontLoader href={pair.googleFontsUrl} />
            <div>
              <p className="text-lg text-white" style={{ fontFamily: pair.display, fontStyle: pair.displayStyle }}>Aa — {pair.label}</p>
              <p className="mt-0.5 text-xs text-mist" style={{ fontFamily: pair.body }}>{pair.sample}</p>
            </div>
            {active && <Check className="h-4 w-4 shrink-0 text-violet-soft" />}
          </button>
        );
      })}
    </div>
  );
}

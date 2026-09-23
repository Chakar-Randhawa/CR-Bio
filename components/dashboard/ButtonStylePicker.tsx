"use client";
import { Link2 } from "lucide-react";
import { BUTTON_ANIMATIONS, type ButtonAnimationKey, type ProfileTheme, cn } from "@/lib/utils";

export function ButtonStylePicker({ theme, onChange }: { theme: ProfileTheme; onChange: (patch: Partial<ProfileTheme>) => void }) {
  const shapeClass = theme.buttonShape === "pill" ? "rounded-full" : theme.buttonShape === "square" ? "rounded-md" : "rounded-xl";
  const animClass = theme.buttonAnimation === "lift" ? "btn-anim-lift" : theme.buttonAnimation === "grow" ? "btn-anim-grow" : theme.buttonAnimation === "pulse" ? "btn-anim-pulse" : theme.buttonAnimation === "shine" ? "btn-anim-shine" : "";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="mb-2.5 text-xs font-medium text-mist">Button style</p>
          <div className="flex gap-2">
            {(["fill", "outline", "glass"] as const).map((s) => (
              <button key={s} type="button" onClick={() => onChange({ buttonStyle: s })} className={cn("flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors", theme.buttonStyle === s ? "border-violet-soft bg-violet/15 text-white" : "border-white/10 text-mist hover:border-white/25")}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2.5 text-xs font-medium text-mist">Button shape</p>
          <div className="flex gap-2">
            {(["pill", "rounded", "square"] as const).map((s) => (
              <button key={s} type="button" onClick={() => onChange({ buttonShape: s })} className={cn("flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors", theme.buttonShape === s ? "border-violet-soft bg-violet/15 text-white" : "border-white/10 text-mist hover:border-white/25")}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-xs font-medium text-mist">Button animation</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {(Object.keys(BUTTON_ANIMATIONS) as ButtonAnimationKey[]).map((key) => (
            <button key={key} type="button" onClick={() => onChange({ buttonAnimation: key })} className={cn("rounded-lg border px-3 py-2 text-xs font-medium transition-colors", theme.buttonAnimation === key ? "border-violet-soft bg-violet/15 text-white" : "border-white/10 text-mist hover:border-white/25")}>{BUTTON_ANIMATIONS[key].label}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-xs font-medium text-mist">Preview — hover to test</p>
        <div className={cn(shapeClass, animClass, "flex w-full max-w-xs items-center gap-3 border-0 px-5 py-3.5 text-sm font-medium")} style={{ background: theme.accent, color: "#0A0A12" }}>
          <Link2 className="h-4 w-4 shrink-0" /><span>Your link title</span>
        </div>
      </div>
    </div>
  );
}

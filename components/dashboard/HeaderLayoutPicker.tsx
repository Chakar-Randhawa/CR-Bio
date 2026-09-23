"use client";

import { Layers, Square, Circle, Hexagon, PanelTop } from "lucide-react";
import { cn, type HeaderLayout } from "@/lib/utils";

const LAYOUTS: { key: HeaderLayout; label: string; icon: typeof Circle }[] = [
  { key: "classic", label: "Classic", icon: Circle },
  { key: "hero", label: "Hero", icon: Layers },
  { key: "banner", label: "Banner", icon: PanelTop },
  { key: "cutout", label: "Cutout", icon: Hexagon },
  { key: "shape", label: "Shape", icon: Square },
];

export function HeaderLayoutPicker({ value, onChange }: { value: HeaderLayout; onChange: (layout: HeaderLayout) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
      {LAYOUTS.map((l) => {
        const active = value === l.key;
        return (
          <button
            key={l.key}
            type="button"
            onClick={() => onChange(l.key)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-colors",
              active ? "border-violet-soft bg-violet/10" : "border-white/10 hover:border-white/25"
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-violet-soft">
              <l.icon className="h-4.5 w-4.5" />
            </div>
            <span className="text-[11px] font-medium text-white/85">{l.label}</span>
          </button>
        );
      })}
    </div>
  );
}

"use client";
import { useState } from "react";
import { Globe } from "lucide-react";
import { languageLabel } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ availableLangs, currentLang, onChange, isLight }: { availableLangs: string[]; currentLang: string; onChange: (lang: string) => void; isLight: boolean; }) {
  const [open, setOpen] = useState(false);
  if (availableLangs.length <= 1) return null;

  return (
    <div className="relative mb-4">
      <button type="button" onClick={() => setOpen((o) => !o)} className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium", isLight ? "border-ink/15 text-ink/70" : "border-white/15 text-white/70")}>
        <Globe className="h-3 w-3" />{languageLabel(currentLang)}
      </button>
      {open && (
        <div className={cn("absolute left-0 top-full z-10 mt-1.5 min-w-[140px] overflow-hidden rounded-xl border py-1 shadow-xl", isLight ? "border-ink/10 bg-white" : "border-white/10 bg-[#14101F]")}>
          {availableLangs.map((lang) => (
            <button key={lang} type="button" onClick={() => { onChange(lang); setOpen(false); }} className={cn("block w-full px-3.5 py-2 text-left text-xs font-medium", lang === currentLang ? "opacity-100" : "opacity-70 hover:opacity-100", isLight ? "text-ink" : "text-white")}>
              {languageLabel(lang)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

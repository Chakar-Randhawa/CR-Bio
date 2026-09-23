"use client";

import { useState } from "react";
import { ChevronDown, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

export function CollectionBlock({
  title, children, isLight, accent,
}: {
  title: string;
  children: React.ReactNode;
  isLight: boolean;
  accent: string;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className={cn("w-full overflow-hidden rounded-xl border", isLight ? "border-ink/10 bg-ink/[0.02]" : "border-white/10 bg-white/[0.03]")}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn("flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium", isLight ? "text-ink" : "text-white")}
      >
        <Folder className="h-4 w-4 shrink-0" style={{ color: accent }} />
        <span className="flex-1 truncate">{title}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-3 px-4 pb-4">{children}</div>}
    </div>
  );
}

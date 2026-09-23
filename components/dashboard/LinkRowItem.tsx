"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BarChart3, Calendar, Clock, Copy, Folder, GripVertical, Loader2, Mail, Package, Pencil, PlaySquare, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Link as LinkRow, LinkCollection } from "@/lib/types";
import { detectPlatformIcon } from "@/lib/platform-icons";
import { cn, formatCompactNumber } from "@/lib/utils";

function scheduleStatus(link: LinkRow): { label: string; tone: "upcoming" | "expired" } | null {
  const now = Date.now();
  if (link.starts_at && new Date(link.starts_at).getTime() > now) return { label: "Scheduled", tone: "upcoming" };
  if (link.ends_at && new Date(link.ends_at).getTime() < now) return { label: "Expired", tone: "expired" };
  return null;
}

const BLOCK_META: Record<string, { icon: typeof Mail; subtitle: (l: LinkRow) => string }> = {
  lead_capture: { icon: Mail, subtitle: () => "Email capture block" },
  embed: { icon: PlaySquare, subtitle: (l) => l.url },
  product: { icon: Package, subtitle: (l) => (l.price_cents ? `$${(l.price_cents / 100).toFixed(2)}` : "Free product") },
  booking: { icon: Calendar, subtitle: () => "Booking block" },
};

export function LinkRowItem({ link, collections = [], onToggleActive, onDelete, onEdit }: {
  link: LinkRow; collections?: LinkCollection[]; onToggleActive: (id: string, next: boolean) => void; onDelete: (id: string) => void; onEdit: (link: LinkRow) => void;
}) {
  const collectionTitle = link.collection_id ? collections.find((c) => c.id === link.collection_id)?.title : null;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const meta = BLOCK_META[link.block_type];
  const Icon = meta ? meta.icon : detectPlatformIcon(link.url);
  const subtitle = meta ? meta.subtitle(link) : link.url;
  const schedule = scheduleStatus(link);
  const style = { transform: CSS.Transform.toString(transform), transition };

  async function handleDelete() { setDeleting(true); await onDelete(link.id); }
  async function handleCopy() { await navigator.clipboard.writeText(link.url); setCopied(true); setTimeout(() => setCopied(false), 1500); }

  return (
    <div ref={setNodeRef} style={style} className={cn("glass-panel flex items-center gap-3 p-3.5 transition-opacity", isDragging && "opacity-50", !link.is_active && "opacity-60")}>
      <button {...attributes} {...listeners} className="cursor-grab touch-none rounded-lg p-1.5 text-mist/60 hover:bg-white/[0.06] hover:text-white active:cursor-grabbing" aria-label="Drag to reorder">
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet/15 text-violet-soft"><Icon className="h-4 w-4" /></div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-white">{link.title}</p>
          {link.display_style === "icon" && <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-mist">icon</span>}
          {collectionTitle && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-mist">
              <Folder className="h-2.5 w-2.5" />{collectionTitle}
            </span>
          )}
          {schedule && (
            <span className={cn("flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", schedule.tone === "upcoming" ? "bg-violet/20 text-violet-soft" : "bg-red-500/15 text-red-300")}>
              <Clock className="h-2.5 w-2.5" />{schedule.label}
            </span>
          )}
        </div>
        <p className="truncate font-mono text-xs text-mist">{subtitle}</p>
      </div>

      {link.block_type === "link" && (
        <div className="hidden items-center gap-1.5 text-xs text-mist sm:flex"><BarChart3 className="h-3.5 w-3.5" />{formatCompactNumber(link.click_count)}</div>
      )}

      {link.block_type === "link" && (
        <button onClick={handleCopy} className="hidden rounded-lg p-2 text-mist hover:bg-white/[0.06] hover:text-white sm:block" aria-label="Copy link URL" title={copied ? "Copied" : "Copy URL"}>
          <Copy className="h-4 w-4" />
        </button>
      )}

      <button onClick={() => onEdit(link)} className="rounded-lg p-2 text-mist hover:bg-white/[0.06] hover:text-white" aria-label="Edit block"><Pencil className="h-4 w-4" /></button>
      <button onClick={handleDelete} disabled={deleting} className="rounded-lg p-2 text-mist hover:bg-red-500/15 hover:text-red-300" aria-label="Delete block">
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>

      <label className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" checked={link.is_active} onChange={(e) => onToggleActive(link.id, e.target.checked)} className="peer sr-only" />
        <div className="h-6 w-11 rounded-full bg-white/10 transition-colors peer-checked:bg-violet after:absolute after:left-[3px] after:top-[3px] after:h-[18px] after:w-[18px] after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:after:translate-x-5" />
      </label>
    </div>
  );
}

"use client";

import { Trash2 } from "lucide-react";
import { STICKER_OPTIONS, type PlacedSticker, type StickerKey } from "@/lib/utils";

export function StickerPicker({ stickers, onChange }: { stickers: PlacedSticker[]; onChange: (next: PlacedSticker[]) => void }) {
  function addSticker(emoji: StickerKey) {
    if (stickers.length >= 6) return;
    const placed: PlacedSticker = {
      emoji,
      x: 20 + Math.random() * 60,
      y: 10 + Math.random() * 20,
      rotation: Math.round(Math.random() * 40 - 20),
      scale: 1,
    };
    onChange([...stickers, placed]);
  }

  function removeSticker(index: number) {
    onChange(stickers.filter((_, i) => i !== index));
  }

  function updateSticker(index: number, patch: Partial<PlacedSticker>) {
    onChange(stickers.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  return (
    <div>
      <p className="mb-2.5 text-xs font-medium text-mist">Tap to scatter a sticker across your page (up to 6)</p>
      <div className="flex flex-wrap gap-2">
        {STICKER_OPTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => addSticker(emoji)}
            disabled={stickers.length >= 6}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-lg hover:border-white/25 disabled:opacity-30"
          >
            {emoji}
          </button>
        ))}
      </div>

      {stickers.length > 0 && (
        <div className="mt-4 space-y-2">
          {stickers.map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
              <span className="text-lg">{s.emoji}</span>
              <input
                type="range"
                min={0.6}
                max={1.8}
                step={0.1}
                value={s.scale}
                onChange={(e) => updateSticker(i, { scale: Number(e.target.value) })}
                className="flex-1 accent-violet"
                aria-label="Sticker size"
              />
              <button type="button" onClick={() => removeSticker(i)} className="shrink-0 rounded-lg p-1.5 text-mist hover:bg-red-500/15 hover:text-red-300">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

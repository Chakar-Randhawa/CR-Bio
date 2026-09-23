"use client";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, Calendar, Link2, Loader2, Mail, Package, PlaySquare, Upload, X } from "lucide-react";
import type { BlockType, DisplayStyle, Link as LinkRow, LinkCollection } from "@/lib/types";
import { isValidUrl, normalizeUrl, cn } from "@/lib/utils";
import { parseEmbedUrl, EMBED_PROVIDER_LABEL } from "@/lib/embed";
import { createClient } from "@/lib/supabase/client";

export interface BlockFormValues {
  block_type: BlockType;
  title: string;
  url: string;
  description: string | null;
  display_style: DisplayStyle;
  embed_provider: "youtube" | "spotify" | "tiktok" | null;
  starts_at: string | null;
  ends_at: string | null;
  price_cents: number | null;
  currency: string;
  delivery_type: "file" | "external" | null;
  file_url: string | null;
  external_checkout_url: string | null;
  collection_id: string | null;
}

const TYPE_OPTIONS: { key: BlockType; label: string; icon: typeof Link2 }[] = [
  { key: "link", label: "Link", icon: Link2 },
  { key: "lead_capture", label: "Email", icon: Mail },
  { key: "embed", label: "Embed", icon: PlaySquare },
  { key: "product", label: "Product", icon: Package },
  { key: "booking", label: "Booking", icon: Calendar },
];

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInputValue(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export function LinkFormModal({ editing, profileId, collections = [], prefillTitle, prefillUrl, onClose, onSubmit }: {
  editing: LinkRow | null; profileId: string; collections?: LinkCollection[]; prefillTitle?: string; prefillUrl?: string;
  onClose: () => void; onSubmit: (data: BlockFormValues) => Promise<string | void>;
}) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [blockType, setBlockType] = useState<BlockType>(editing?.block_type || "link");
  const [title, setTitle] = useState(editing?.title || prefillTitle || "");
  const [url, setUrl] = useState(editing?.url || prefillUrl || "");
  const [collectionId, setCollectionId] = useState<string>(editing?.collection_id || "");
  const [description, setDescription] = useState(editing?.description || "");
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>(editing?.display_style || "button");
  const [showSchedule, setShowSchedule] = useState(Boolean(editing?.starts_at || editing?.ends_at));
  const [startsAt, setStartsAt] = useState(toLocalInputValue(editing?.starts_at || null));
  const [endsAt, setEndsAt] = useState(toLocalInputValue(editing?.ends_at || null));
  const [priceDollars, setPriceDollars] = useState(editing?.price_cents ? (editing.price_cents / 100).toFixed(2) : "");
  const [deliveryType, setDeliveryType] = useState<"file" | "external">(editing?.delivery_type || "file");
  const [fileUrl, setFileUrl] = useState(editing?.file_url || "");
  const [checkoutUrl, setCheckoutUrl] = useState(editing?.external_checkout_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBlockType(editing?.block_type || "link");
    setTitle(editing?.title || "");
    setUrl(editing?.url || "");
    setDescription(editing?.description || "");
    setDisplayStyle(editing?.display_style || "button");
    setShowSchedule(Boolean(editing?.starts_at || editing?.ends_at));
    setStartsAt(toLocalInputValue(editing?.starts_at || null));
    setEndsAt(toLocalInputValue(editing?.ends_at || null));
    setPriceDollars(editing?.price_cents ? (editing.price_cents / 100).toFixed(2) : "");
    setDeliveryType(editing?.delivery_type || "file");
    setFileUrl(editing?.file_url || "");
    setCheckoutUrl(editing?.external_checkout_url || "");
    setCollectionId(editing?.collection_id || "");
  }, [editing]);

  const embedPreview = blockType === "embed" && url ? parseEmbedUrl(normalizeUrl(url)) : null;

  async function handleFileUpload(file: File) {
    if (file.size > 50 * 1024 * 1024) { setError("File must be under 50MB."); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${profileId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("products").upload(path, file, { upsert: true });
    setUploading(false);
    if (uploadError) { setError(uploadError.message); return; }
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    setFileUrl(data.publicUrl);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      setError(blockType === "lead_capture" ? "Give this block a heading." : "Give this a title.");
      return;
    }

    let finalUrl = "";
    if (blockType === "link" || blockType === "embed") {
      const normalized = normalizeUrl(url.trim());
      if (!isValidUrl(normalized)) { setError("Enter a valid URL, like instagram.com/yourname"); return; }
      if (blockType === "embed" && !parseEmbedUrl(normalized)) { setError("That link doesn't look like a YouTube, Spotify, or TikTok URL."); return; }
      finalUrl = normalized;
    }

    let priceCents: number | null = null;
    if (blockType === "product") {
      const parsed = parseFloat(priceDollars);
      priceCents = isNaN(parsed) || parsed <= 0 ? 0 : Math.round(parsed * 100);
      if (deliveryType === "file" && !fileUrl) { setError("Upload a file for visitors to download."); return; }
      if (deliveryType === "external") {
        const normalized = normalizeUrl(checkoutUrl.trim());
        if (!isValidUrl(normalized)) { setError("Enter a valid checkout link (Stripe, Gumroad, etc.)"); return; }
        setCheckoutUrl(normalized);
      }
    }

    if (startsAt && endsAt) {
      if (new Date(startsAt).getTime() >= new Date(endsAt).getTime()) { setError("The end time must be after the start time."); return; }
    }

    setSaving(true);
    const finalEmbedPreview = blockType === "embed" ? parseEmbedUrl(finalUrl) : null;
    const submitError = await onSubmit({
      block_type: blockType,
      title: trimmedTitle,
      url: finalUrl,
      description: blockType === "link" ? null : description.trim() || null,
      display_style: blockType === "link" ? displayStyle : "button",
      embed_provider: finalEmbedPreview?.provider || null,
      starts_at: showSchedule ? fromLocalInputValue(startsAt) : null,
      ends_at: showSchedule ? fromLocalInputValue(endsAt) : null,
      price_cents: blockType === "product" ? priceCents : null,
      currency: "USD",
      delivery_type: blockType === "product" ? deliveryType : null,
      file_url: blockType === "product" && deliveryType === "file" ? fileUrl : null,
      external_checkout_url: blockType === "product" && deliveryType === "external" ? normalizeUrl(checkoutUrl.trim()) : null,
      collection_id: blockType === "link" && collectionId ? collectionId : null,
    });
    setSaving(false);

    if (submitError) { setError(submitError); return; }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="glass-panel max-h-[90vh] w-full max-w-md overflow-y-auto rounded-b-none p-6 sm:m-4 sm:rounded-b-xl2">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-white">{editing ? "Edit block" : "Add a block"}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-mist hover:bg-white/[0.06] hover:text-white" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        {!editing && (
          <div className="mb-5 grid grid-cols-5 gap-1.5">
            {TYPE_OPTIONS.map((opt) => (
              <button key={opt.key} type="button" onClick={() => setBlockType(opt.key)} className={cn("flex flex-col items-center gap-1.5 rounded-xl border px-1 py-3 text-[11px] font-medium transition-colors", blockType === opt.key ? "border-violet-soft bg-violet/15 text-white" : "border-white/10 text-mist hover:border-white/25")}>
                <opt.icon className="h-4 w-4" />{opt.label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="mb-1.5 block text-xs font-medium text-mist">
              {blockType === "lead_capture" ? "Heading" : blockType === "embed" ? "Caption (optional)" : blockType === "booking" ? "Heading" : "Title"}
            </label>
            <input id="title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder={blockType === "lead_capture" ? "Join the list" : blockType === "embed" ? "Latest video" : blockType === "booking" ? "Book a call" : blockType === "product" ? "My eBook" : "My Instagram"} maxLength={100} />
          </div>

          {(blockType === "link" || blockType === "embed") && (
            <div>
              <label htmlFor="url" className="mb-1.5 block text-xs font-medium text-mist">{blockType === "embed" ? "YouTube, Spotify, or TikTok link" : "URL"}</label>
              <input id="url" value={url} onChange={(e) => setUrl(e.target.value)} className="input-field" placeholder={blockType === "embed" ? "youtube.com/watch?v=..." : "instagram.com/yourname"} />
              {embedPreview && <p className="mt-1.5 text-xs text-emerald-400">Recognized as a {EMBED_PROVIDER_LABEL[embedPreview.provider]} embed.</p>}
            </div>
          )}

          {(blockType === "lead_capture" || blockType === "booking") && (
            <div>
              <label htmlFor="description" className="mb-1.5 block text-xs font-medium text-mist">Description (optional)</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value.slice(0, 280))} rows={2} className="input-field resize-none" placeholder={blockType === "booking" ? "30-minute intro call" : "Get updates when I post something new."} />
              {blockType === "lead_capture" && <p className="mt-1.5 text-xs text-mist/60">Emails are collected in Dashboard → Leads.</p>}
              {blockType === "booking" && <p className="mt-1.5 text-xs text-mist/60">Set your available hours in Dashboard → Booking.</p>}
            </div>
          )}

          {blockType === "product" && (
            <>
              <div>
                <label htmlFor="description" className="mb-1.5 block text-xs font-medium text-mist">Description (optional)</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value.slice(0, 280))} rows={2} className="input-field resize-none" placeholder="What's included, format, etc." />
              </div>
              <div>
                <label htmlFor="price" className="mb-1.5 block text-xs font-medium text-mist">Price (USD, 0 for free)</label>
                <input id="price" type="number" min="0" step="0.01" value={priceDollars} onChange={(e) => setPriceDollars(e.target.value)} className="input-field" placeholder="0.00" />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-mist">Delivery</p>
                <div className="flex gap-2">
                  {(["file", "external"] as const).map((d) => (
                    <button key={d} type="button" onClick={() => setDeliveryType(d)} className={cn("flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors", deliveryType === d ? "border-violet-soft bg-violet/15 text-white" : "border-white/10 text-mist hover:border-white/25")}>
                      {d === "file" ? "Free download" : "External checkout"}
                    </button>
                  ))}
                </div>
              </div>
              {deliveryType === "file" ? (
                <div>
                  {fileUrl ? (
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white/80">
                      <span className="truncate">File uploaded</span>
                      <button type="button" onClick={() => setFileUrl("")} className="text-red-300 hover:underline">Remove</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/15 px-3.5 py-3 text-xs font-medium text-mist hover:border-white/30 hover:text-white">
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Upload className="h-3.5 w-3.5" />Upload file (up to 50MB)</>)}
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
                  <p className="mt-1.5 text-xs text-mist/60">Visitors enter their email to unlock the download.</p>
                </div>
              ) : (
                <div>
                  <label htmlFor="checkoutUrl" className="mb-1.5 block text-xs font-medium text-mist">Checkout link</label>
                  <input id="checkoutUrl" value={checkoutUrl} onChange={(e) => setCheckoutUrl(e.target.value)} className="input-field" placeholder="buy.stripe.com/... or gumroad.com/l/..." />
                  <p className="mt-1.5 text-xs text-mist/60">Paste a Stripe Payment Link, Gumroad, or Lemon Squeezy checkout URL.</p>
                </div>
              )}
            </>
          )}

          {blockType === "link" && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-mist">Show as</p>
              <div className="flex gap-2">
                {(["button", "icon"] as const).map((s) => (
                  <button key={s} type="button" onClick={() => setDisplayStyle(s)} className={cn("flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors", displayStyle === s ? "border-violet-soft bg-violet/15 text-white" : "border-white/10 text-mist hover:border-white/25")}>
                    {s === "button" ? "Full button" : "Icon only"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {blockType === "link" && collections.length > 0 && (
            <div>
              <label htmlFor="collection" className="mb-1.5 block text-xs font-medium text-mist">Collection (optional)</label>
              <select id="collection" value={collectionId} onChange={(e) => setCollectionId(e.target.value)} className="input-field !py-2.5 text-sm">
                <option value="">No collection</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}

          {(blockType === "link" || blockType === "embed" || blockType === "product") && (
            <div>
              <button type="button" onClick={() => setShowSchedule((s) => !s)} className="flex items-center gap-1.5 text-xs font-medium text-violet-soft hover:underline">
                <Calendar className="h-3.5 w-3.5" />{showSchedule ? "Remove schedule" : "Schedule this block"}
              </button>
              {showSchedule && (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div><label htmlFor="startsAt" className="mb-1.5 block text-xs font-medium text-mist">Starts</label><input id="startsAt" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="input-field !py-2.5 text-sm" /></div>
                  <div><label htmlFor="endsAt" className="mb-1.5 block text-xs font-medium text-mist">Ends</label><input id="endsAt" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="input-field !py-2.5 text-sm" /></div>
                  <p className="col-span-full text-xs text-mist/60">Leave either field empty for an open start or open end.</p>
                </div>
              )}
            </div>
          )}

          {error && <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save changes" : "Add block"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

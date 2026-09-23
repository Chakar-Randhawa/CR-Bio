"use client";
import { useState } from "react";
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Infinity as InfinityIcon, Instagram, Link2, Mail, Music4, Plus, FolderPlus, Trash2, Youtube } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { triggerRevalidate } from "@/lib/revalidate";
import type { Link as LinkRow, LinkCollection } from "@/lib/types";
import { LinkRowItem } from "@/components/dashboard/LinkRowItem";
import { LinkFormModal, type BlockFormValues } from "@/components/dashboard/LinkFormModal";
import { cn } from "@/lib/utils";

const QUICK_ADD = [
  { key: "instagram", label: "Instagram", icon: Instagram, urlPrefix: "instagram.com/" },
  { key: "tiktok", label: "TikTok", icon: Music4, urlPrefix: "tiktok.com/@" },
  { key: "youtube", label: "YouTube", icon: Youtube, urlPrefix: "youtube.com/@" },
  { key: "email", label: "Email", icon: Mail, urlPrefix: "mailto:" },
];

export function LinkManager({ initialLinks, initialCollections, profileId, username }: {
  initialLinks: LinkRow[]; initialCollections: LinkCollection[]; profileId: string; username: string;
}) {
  const supabase = createClient();
  const [links, setLinks] = useState<LinkRow[]>(initialLinks);
  const [collections, setCollections] = useState<LinkCollection[]>(initialCollections);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LinkRow | null>(null);
  const [quickPrefill, setQuickPrefill] = useState<{ title: string; url: string } | null>(null);
  const [newCollectionTitle, setNewCollectionTitle] = useState("");
  const [showCollections, setShowCollections] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex);
    setLinks(reordered);
    const updates = reordered.map((link, index) => supabase.from("links").update({ position: index }).eq("id", link.id));
    await Promise.all(updates);
    triggerRevalidate(username);
  }

  async function handleToggleActive(id: string, next: boolean) {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, is_active: next } : l)));
    await supabase.from("links").update({ is_active: next }).eq("id", id);
    triggerRevalidate(username);
  }

  async function handleDelete(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    await supabase.from("links").delete().eq("id", id);
    triggerRevalidate(username);
  }

  function openAddModal() { setEditing(null); setQuickPrefill(null); setModalOpen(true); }
  function openEditModal(link: LinkRow) { setEditing(link); setQuickPrefill(null); setModalOpen(true); }
  function openQuickAdd(label: string, urlPrefix: string) {
    setEditing(null);
    setQuickPrefill({ title: label, url: urlPrefix });
    setModalOpen(true);
  }

  async function handleFormSubmit(values: BlockFormValues) {
    if (editing) {
      const { error } = await supabase.from("links").update(values).eq("id", editing.id);
      if (error) return error.message;
      setLinks((prev) => prev.map((l) => (l.id === editing.id ? { ...l, ...values } : l)));
      triggerRevalidate(username);
      return;
    }
    const position = links.length;
    const { data, error } = await supabase.from("links").insert({ profile_id: profileId, ...values, position }).select().single();
    if (error) return error.message;
    setLinks((prev) => [...prev, data as LinkRow]);
    triggerRevalidate(username);
  }

  async function handleAddCollection() {
    const title = newCollectionTitle.trim();
    if (!title) return;
    const { data, error } = await supabase.from("link_collections").insert({ profile_id: profileId, title, position: collections.length }).select().single();
    if (!error && data) {
      setCollections((prev) => [...prev, data as LinkCollection]);
      setNewCollectionTitle("");
      triggerRevalidate(username);
    }
  }

  async function handleDeleteCollection(id: string) {
    setCollections((prev) => prev.filter((c) => c.id !== id));
    setLinks((prev) => prev.map((l) => (l.collection_id === id ? { ...l, collection_id: null } : l)));
    await supabase.from("link_collections").delete().eq("id", id);
    triggerRevalidate(username);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white">Your links</h1>
          <p className="mt-1 text-sm text-mist">Drag to reorder. Toggle to hide without deleting.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary !px-4 !py-2.5 text-sm"><Plus className="h-4 w-4" />Add block</button>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-mist">
        <InfinityIcon className="h-3.5 w-3.5 text-gold" />Unlimited blocks — no cap, ever. You have {links.length} right now.
      </div>

      {/* Quick-add socials */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {QUICK_ADD.map((q) => (
          <button key={q.key} onClick={() => openQuickAdd(q.label, q.urlPrefix)} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-mist hover:border-white/25 hover:text-white">
            <q.icon className="h-3.5 w-3.5" />{q.label}
          </button>
        ))}
        <button onClick={() => setShowCollections((s) => !s)} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-mist hover:border-white/25 hover:text-white">
          <FolderPlus className="h-3.5 w-3.5" />Collections
        </button>
      </div>

      {showCollections && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="mb-2.5 text-xs font-medium text-mist">Group links into a folder your visitors can expand.</p>
          <div className="flex gap-2">
            <input value={newCollectionTitle} onChange={(e) => setNewCollectionTitle(e.target.value)} placeholder="Collection name, e.g. My music" className="input-field !py-2 text-sm" maxLength={80} />
            <button onClick={handleAddCollection} className="btn-secondary shrink-0 !px-3.5 !py-2 text-xs">Add</button>
          </div>
          {collections.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {collections.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-white/85">
                  {c.title}
                  <button onClick={() => handleDeleteCollection(c.id)} className="text-mist hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        {links.length === 0 ? (
          <div className="glass-panel flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet/15 text-violet-soft"><Link2 className="h-5 w-5" /></div>
            <p className="font-display text-lg text-white">No blocks yet</p>
            <p className="max-w-xs text-sm text-mist">Add a link, an email capture form, a product, a booking form, or an embedded video — anything you want visitors to find.</p>
            <button onClick={openAddModal} className="btn-primary mt-2 !px-5 !py-2.5 text-sm"><Plus className="h-4 w-4" />Add your first block</button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2.5">
                {links.map((link) => (
                  <LinkRowItem key={link.id} link={link} collections={collections} onToggleActive={handleToggleActive} onDelete={handleDelete} onEdit={openEditModal} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {modalOpen && (
        <LinkFormModal
          editing={editing}
          profileId={profileId}
          collections={collections}
          prefillTitle={quickPrefill?.title}
          prefillUrl={quickPrefill?.url}
          onClose={() => setModalOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}

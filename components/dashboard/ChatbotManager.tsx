"use client";
import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertCircle, Bot, Check, GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { triggerRevalidate } from "@/lib/revalidate";
import type { ChatbotQA, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

function QaRow({ qa, onDelete }: { qa: ChatbotQA; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: qa.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={cn("flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5", isDragging && "opacity-50")}>
      <button {...attributes} {...listeners} className="mt-0.5 cursor-grab touch-none rounded-lg p-1 text-mist/50 hover:bg-white/[0.06] hover:text-white active:cursor-grabbing" aria-label="Drag to reorder">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">{qa.question}</p>
        <p className="mt-0.5 text-xs text-mist">{qa.answer}</p>
      </div>
      <button onClick={() => onDelete(qa.id)} className="shrink-0 rounded-lg p-1.5 text-mist hover:bg-red-500/15 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
    </div>
  );
}

export function ChatbotManager({ initialProfile, initialQaList }: { initialProfile: Profile; initialQaList: ChatbotQA[] }) {
  const supabase = createClient();
  const [enabled, setEnabled] = useState(initialProfile.chatbot_enabled);
  const [botName, setBotName] = useState(initialProfile.chatbot_name);
  const [welcome, setWelcome] = useState(initialProfile.chatbot_welcome_message);
  const [fallback, setFallback] = useState(initialProfile.chatbot_fallback_message);
  const [qaList, setQaList] = useState(initialQaList);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } })
  );

  async function handleSaveSettings() {
    setSaving(true); setSaved(false);
    await supabase.from("profiles").update({
      chatbot_enabled: enabled, chatbot_name: botName.trim() || "Assistant",
      chatbot_welcome_message: welcome.trim() || "Hi! Ask me anything about this page.",
      chatbot_fallback_message: fallback.trim() || "I don't have an answer for that yet.",
    }).eq("id", initialProfile.id);
    triggerRevalidate(initialProfile.username);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function handleAddQa(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!newQ.trim() || !newA.trim()) { setError("Fill in both the question and the answer."); return; }
    setAdding(true);
    const { data, error: insertError } = await supabase.from("chatbot_qa").insert({
      profile_id: initialProfile.id, question: newQ.trim(), answer: newA.trim(), position: qaList.length,
    }).select().single();
    setAdding(false);
    if (insertError) { setError(insertError.message); return; }
    setQaList((prev) => [...prev, data as ChatbotQA]);
    setNewQ(""); setNewA("");
  }

  async function handleDeleteQa(id: string) {
    setQaList((prev) => prev.filter((q) => q.id !== id));
    await supabase.from("chatbot_qa").delete().eq("id", id);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = qaList.findIndex((q) => q.id === active.id);
    const newIndex = qaList.findIndex((q) => q.id === over.id);
    const reordered = arrayMove(qaList, oldIndex, newIndex);
    setQaList(reordered);
    const updates = reordered.map((qa, index) => supabase.from("chatbot_qa").update({ position: index }).eq("id", qa.id));
    await Promise.all(updates);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl text-white">AI Chatbot</h1>
        <p className="mt-1 text-sm text-mist">A self-contained chat widget on your page — no external API, no per-message cost.</p>
      </div>

      <section className="glass-panel p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Bot className="h-4 w-4 text-violet-soft" /><h2 className="label-eyebrow">Enable chatbot</h2></div>
          <label className="relative inline-flex shrink-0 cursor-pointer items-center">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="peer sr-only" />
            <div className="h-6 w-11 rounded-full bg-white/10 transition-colors peer-checked:bg-violet after:absolute after:left-[3px] after:top-[3px] after:h-[18px] after:w-[18px] after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:after:translate-x-5" />
          </label>
        </div>

        <div className="mt-5 space-y-4">
          <div><label className="mb-1.5 block text-xs font-medium text-mist">Bot name</label><input value={botName} onChange={(e) => setBotName(e.target.value)} className="input-field" maxLength={40} /></div>
          <div><label className="mb-1.5 block text-xs font-medium text-mist">Welcome message</label><input value={welcome} onChange={(e) => setWelcome(e.target.value)} className="input-field" maxLength={200} /></div>
          <div><label className="mb-1.5 block text-xs font-medium text-mist">Fallback message (when nothing matches)</label><input value={fallback} onChange={(e) => setFallback(e.target.value)} className="input-field" maxLength={300} /></div>
        </div>

        <button onClick={handleSaveSettings} disabled={saving} className="btn-primary mt-5 !px-5 !py-2.5 text-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? (<><Check className="h-4 w-4" /> Saved</>) : "Save settings"}
        </button>
      </section>

      <section className="glass-panel p-6">
        <h2 className="label-eyebrow mb-1">Questions &amp; answers</h2>
        <p className="mb-5 text-sm text-mist">Drag to reorder. The widget matches a visitor's message against these and replies with the closest answer.</p>

        <form onSubmit={handleAddQa} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <input value={newQ} onChange={(e) => setNewQ(e.target.value)} placeholder="Question, e.g. What are your hours?" className="input-field" maxLength={200} />
          <textarea value={newA} onChange={(e) => setNewA(e.target.value)} placeholder="Answer" rows={2} className="input-field resize-none" maxLength={1000} />
          {error && <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
          <button type="submit" disabled={adding} className="btn-secondary !px-4 !py-2 text-xs">{adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}Add Q&amp;A</button>
        </form>

        <div className="mt-4">
          {qaList.length === 0 ? (
            <p className="text-sm text-mist">No questions yet — add a few above to get started.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={qaList.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2.5">
                  {qaList.map((qa) => (
                    <QaRow key={qa.id} qa={qa} onDelete={handleDeleteQa} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </section>
    </div>
  );
}

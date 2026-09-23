"use client";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { findBestAnswer } from "@/lib/chatbot";
import type { ChatbotQA } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatMessage { role: "bot" | "visitor"; text: string; }

export function ChatbotWidget({ profileId, botName, welcomeMessage, fallbackMessage, accent }: {
  profileId: string; botName: string; welcomeMessage: string; fallbackMessage: string; accent: string;
}) {
  const [open, setOpen] = useState(false);
  const [qaList, setQaList] = useState<ChatbotQA[] | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || qaList !== null) return;
    const supabase = createClient();
    supabase.from("chatbot_qa").select("*").eq("profile_id", profileId).order("position", { ascending: true }).then(({ data }) => {
      setQaList(data || []);
      setMessages([{ role: "bot", text: welcomeMessage }]);
    });
  }, [open, qaList, profileId, welcomeMessage]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !qaList) return;
    const match = findBestAnswer(text, qaList);
    const reply = match ? match.qa.answer : fallbackMessage;
    setMessages((prev) => [...prev, { role: "visitor", text }, { role: "bot", text: reply }]);
    setInput("");
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 flex h-[420px] w-[320px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#14101F] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3" style={{ background: `${accent}22` }}>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: accent }}><MessageCircle className="h-3.5 w-3.5 text-white" /></div>
              <p className="text-sm font-semibold text-white">{botName}</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Close chat"><X className="h-4 w-4" /></button>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {qaList === null ? <p className="text-center text-xs text-white/40">Loading…</p> : messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "visitor" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed", m.role === "visitor" ? "text-white" : "bg-white/[0.08] text-white/90")} style={m.role === "visitor" ? { background: accent } : undefined}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-white/10 p-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" className="flex-1 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-sm text-white outline-none placeholder:text-white/40" />
            <button type="submit" disabled={!input.trim() || !qaList} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-40" style={{ background: accent }} aria-label="Send"><Send className="h-3.5 w-3.5" /></button>
          </form>
        </div>
      )}
      <button onClick={() => setOpen((o) => !o)} className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-transform hover:scale-105" style={{ background: accent }} aria-label={open ? "Close chat" : "Open chat"}>
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </div>
  );
}

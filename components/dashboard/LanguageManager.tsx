"use client";
import { useState } from "react";
import { Check, Globe2, Loader2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { triggerRevalidate } from "@/lib/revalidate";
import type { Link as LinkRow, Profile, Translation } from "@/lib/types";
import { SUPPORTED_LANGUAGES, languageLabel } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageManager({ initialProfile, links }: { initialProfile: Profile; links: LinkRow[] }) {
  const supabase = createClient();
  const [translations, setTranslations] = useState<Record<string, Translation>>(initialProfile.translations || {});
  const [linkTranslations, setLinkTranslations] = useState<Record<string, Record<string, { title?: string }>>>(
    Object.fromEntries(links.map((l) => [l.id, l.translations || {}]))
  );
  const [activeLang, setActiveLang] = useState<string | null>(Object.keys(initialProfile.translations || {})[0] || null);
  const [addingLang, setAddingLang] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const availableToAdd = SUPPORTED_LANGUAGES.filter((l) => l.code !== "en" && !(l.code in translations));

  function addLanguage() {
    if (!addingLang) return;
    setTranslations((prev) => ({ ...prev, [addingLang]: {} }));
    setActiveLang(addingLang);
    setAddingLang("");
  }

  function removeLanguage(code: string) {
    setTranslations((prev) => { const next = { ...prev }; delete next[code]; return next; });
    setLinkTranslations((prev) => {
      const next: typeof prev = {};
      for (const [id, byLang] of Object.entries(prev)) { const copy = { ...byLang }; delete copy[code]; next[id] = copy; }
      return next;
    });
    if (activeLang === code) setActiveLang(null);
  }

  async function handleSave() {
    if (!activeLang) return;
    setSaving(true); setSaved(false);

    await supabase.from("profiles").update({ translations }).eq("id", initialProfile.id);

    const updates = links.map((link) => {
      const byLang = linkTranslations[link.id] || {};
      return supabase.from("links").update({ translations: byLang }).eq("id", link.id);
    });
    await Promise.all(updates);
    triggerRevalidate(initialProfile.username);

    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  const langCodes = Object.keys(translations);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div><h1 className="font-display text-2xl text-white">Languages</h1><p className="mt-1 text-sm text-mist">Add translations — visitors see the version that matches their browser language automatically, with a switcher to pick another.</p></div>

      <section className="glass-panel p-6">
        <h2 className="label-eyebrow mb-4 flex items-center gap-2"><Globe2 className="h-3.5 w-3.5" />Your languages</h2>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-mist">English (default)</span>
          {langCodes.map((code) => (
            <button key={code} onClick={() => setActiveLang(code)} className={cn("flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors", activeLang === code ? "border-violet-soft bg-violet/15 text-white" : "border-white/10 text-mist hover:border-white/25")}>
              {languageLabel(code)}
              <span onClick={(e) => { e.stopPropagation(); removeLanguage(code); }} className="ml-1 rounded-full p-0.5 hover:bg-red-500/20 hover:text-red-300"><Trash2 className="h-3 w-3" /></span>
            </button>
          ))}
        </div>

        {availableToAdd.length > 0 && (
          <div className="mt-4 flex gap-2">
            <select value={addingLang} onChange={(e) => setAddingLang(e.target.value)} className="input-field !py-2.5 text-sm">
              <option value="">Add a language…</option>
              {availableToAdd.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            <button onClick={addLanguage} disabled={!addingLang} className="btn-secondary shrink-0 !px-4 !py-2.5 text-xs"><Plus className="h-3.5 w-3.5" />Add</button>
          </div>
        )}
      </section>

      {activeLang && (
        <>
          <section className="glass-panel p-6">
            <h2 className="label-eyebrow mb-4">Profile — {languageLabel(activeLang)}</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-mist">Display name</label>
                <input
                  value={translations[activeLang]?.display_name || ""}
                  onChange={(e) => setTranslations((prev) => ({ ...prev, [activeLang]: { ...prev[activeLang], display_name: e.target.value } }))}
                  className="input-field" placeholder={initialProfile.display_name || initialProfile.username}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-mist">Bio</label>
                <textarea
                  value={translations[activeLang]?.bio || ""}
                  onChange={(e) => setTranslations((prev) => ({ ...prev, [activeLang]: { ...prev[activeLang], bio: e.target.value } }))}
                  rows={3} className="input-field resize-none" placeholder={initialProfile.bio || ""}
                />
              </div>
            </div>
          </section>

          <section className="glass-panel p-6">
            <h2 className="label-eyebrow mb-4">Link titles — {languageLabel(activeLang)}</h2>
            {links.filter((l) => l.block_type === "link").length === 0 ? (
              <p className="text-sm text-mist">No link blocks to translate yet.</p>
            ) : (
              <div className="space-y-3">
                {links.filter((l) => l.block_type === "link").map((link) => (
                  <div key={link.id}>
                    <p className="mb-1 text-xs text-mist/70">{link.title}</p>
                    <input
                      value={linkTranslations[link.id]?.[activeLang]?.title || ""}
                      onChange={(e) => setLinkTranslations((prev) => ({ ...prev, [link.id]: { ...prev[link.id], [activeLang]: { title: e.target.value } } }))}
                      className="input-field" placeholder={link.title}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          <button onClick={handleSave} disabled={saving} className="btn-primary !px-5 !py-2.5 text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? (<><Check className="h-4 w-4" /> Saved</>) : "Save translations"}
          </button>
        </>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { Calendar, Check, Clock, Loader2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Booking, BookingAvailability, Profile } from "@/lib/types";
import { WEEKDAY_LABELS } from "@/lib/booking";
import { cn } from "@/lib/utils";

const TIMEZONES = ["UTC", "Asia/Karachi", "Asia/Kolkata", "Asia/Dubai", "Europe/London", "America/New_York", "America/Los_Angeles", "Asia/Singapore", "Australia/Sydney"];

export function BookingManager({ initialProfile, initialAvailability, initialBookings }: {
  initialProfile: Profile; initialAvailability: BookingAvailability[]; initialBookings: Booking[];
}) {
  const supabase = createClient();
  const [timezone, setTimezone] = useState(initialProfile.booking_timezone);
  const [duration, setDuration] = useState(initialProfile.booking_duration_minutes);
  const [availability, setAvailability] = useState(initialAvailability);
  const [bookings] = useState(initialBookings);
  const [newDay, setNewDay] = useState(1);
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("17:00");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [adding, setAdding] = useState(false);

  async function handleSaveSettings() {
    setSaving(true); setSaved(false);
    await supabase.from("profiles").update({ booking_timezone: timezone, booking_duration_minutes: duration }).eq("id", initialProfile.id);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function handleAddAvailability() {
    setAdding(true);
    const { data, error } = await supabase.from("booking_availability").insert({
      profile_id: initialProfile.id, day_of_week: newDay, start_time: `${newStart}:00`, end_time: `${newEnd}:00`,
    }).select().single();
    setAdding(false);
    if (!error && data) setAvailability((prev) => [...prev, data as BookingAvailability]);
  }

  async function handleDeleteAvailability(id: string) {
    setAvailability((prev) => prev.filter((a) => a.id !== id));
    await supabase.from("booking_availability").delete().eq("id", id);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div><h1 className="font-display text-2xl text-white">Booking</h1><p className="mt-1 text-sm text-mist">Set your available hours — visitors book real, conflict-free slots.</p></div>

      <section className="glass-panel p-6">
        <h2 className="label-eyebrow mb-5">General</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-mist">Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input-field">
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-mist">Appointment length (minutes)</label>
            <input type="number" min={5} max={480} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="input-field" />
          </div>
        </div>
        <button onClick={handleSaveSettings} disabled={saving} className="btn-primary mt-4 !px-5 !py-2.5 text-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? (<><Check className="h-4 w-4" /> Saved</>) : "Save settings"}
        </button>
      </section>

      <section className="glass-panel p-6">
        <h2 className="label-eyebrow mb-5">Weekly availability</h2>
        <div className="space-y-2.5">
          {availability.length === 0 ? <p className="text-sm text-mist">No hours set yet — add your first window below.</p> : availability.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5">
              <span className="text-sm text-white/90">{WEEKDAY_LABELS[a.day_of_week]} · {a.start_time.slice(0, 5)}–{a.end_time.slice(0, 5)}</span>
              <button onClick={() => handleDeleteAvailability(a.id)} className="rounded-lg p-1.5 text-mist hover:bg-red-500/15 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-mist">Day</label>
            <select value={newDay} onChange={(e) => setNewDay(Number(e.target.value))} className="input-field !py-2.5 text-sm">
              {WEEKDAY_LABELS.map((label, i) => <option key={label} value={i}>{label}</option>)}
            </select>
          </div>
          <div><label className="mb-1.5 block text-xs font-medium text-mist">Start</label><input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="input-field !py-2.5 text-sm" /></div>
          <div><label className="mb-1.5 block text-xs font-medium text-mist">End</label><input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="input-field !py-2.5 text-sm" /></div>
          <button onClick={handleAddAvailability} disabled={adding} className="btn-secondary !px-4 !py-2.5 text-xs">{adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}Add</button>
        </div>
      </section>

      <section className="glass-panel p-6">
        <h2 className="label-eyebrow mb-5 flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />Upcoming bookings</h2>
        {bookings.length === 0 ? <p className="text-sm text-mist">No bookings yet.</p> : (
          <div className="space-y-2.5">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-violet-soft" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{b.name} <span className="text-mist font-normal">· {b.email}</span></p>
                  <p className="mt-0.5 text-xs text-mist">{new Date(b.starts_at).toLocaleString("en", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · {b.duration_minutes} min</p>
                  {b.notes && <p className="mt-1 text-xs text-mist/80">{b.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

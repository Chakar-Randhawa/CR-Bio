import type { BookingAvailability } from "@/lib/types";

function getOffsetMinutes(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", { timeZone, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const parts = dtf.formatToParts(instant);
  const map: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;
  const hour = map.hour === "24" ? "0" : map.hour;
  const asUTC = Date.UTC(Number(map.year), Number(map.month) - 1, Number(map.day), Number(hour), Number(map.minute), Number(map.second));
  return (asUTC - instant.getTime()) / 60000;
}

export function zonedTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, timeZone: string): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset = getOffsetMinutes(guess, timeZone);
  return new Date(guess.getTime() - offset * 60000);
}

export function getZonedDateParts(instant: Date, timeZone: string): { year: number; month: number; day: number; weekday: number } {
  const dtf = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  const parts = dtf.formatToParts(instant);
  const map: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;
  const year = Number(map.year), month = Number(map.month), day = Number(map.day);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return { year, month, day, weekday };
}

function parseTimeString(t: string): { hour: number; minute: number } {
  const [h, m] = t.split(":");
  return { hour: Number(h), minute: Number(m) };
}

export interface OpenSlot { startsAt: Date; durationMinutes: number; }

export function generateAvailableSlots({ availability, durationMinutes, timezone, bookedInstants, daysAhead = 14, now = new Date() }: {
  availability: BookingAvailability[]; durationMinutes: number; timezone: string; bookedInstants: Set<number>; daysAhead?: number; now?: Date;
}): OpenSlot[] {
  const slots: OpenSlot[] = [];
  const todayParts = getZonedDateParts(now, timezone);
  const todayUtcMidnight = Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day);

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const dayDate = new Date(todayUtcMidnight + dayOffset * 86400000);
    const y = dayDate.getUTCFullYear(), m = dayDate.getUTCMonth() + 1, d = dayDate.getUTCDate(), weekday = dayDate.getUTCDay();
    const rulesForDay = availability.filter((a) => a.day_of_week === weekday);

    for (const rule of rulesForDay) {
      const start = parseTimeString(rule.start_time), end = parseTimeString(rule.end_time);
      let cursorMinutes = start.hour * 60 + start.minute;
      const endMinutes = end.hour * 60 + end.minute;

      while (cursorMinutes + durationMinutes <= endMinutes) {
        const hh = Math.floor(cursorMinutes / 60), mm = cursorMinutes % 60;
        const instant = zonedTimeToUtc(y, m, d, hh, mm, timezone);
        if (instant.getTime() > now.getTime() && !bookedInstants.has(instant.getTime())) {
          slots.push({ startsAt: instant, durationMinutes });
        }
        cursorMinutes += durationMinutes;
      }
    }
  }
  return slots.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

export const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function groupSlotsByDay(slots: OpenSlot[], timezone: string): { dateKey: string; label: string; slots: OpenSlot[] }[] {
  const groups = new Map<string, OpenSlot[]>();
  for (const slot of slots) {
    const parts = getZonedDateParts(slot.startsAt, timezone);
    const key = `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(slot);
  }
  return [...groups.entries()].map(([dateKey, daySlots]) => {
    const [y, m, d] = dateKey.split("-").map(Number);
    const label = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
    return { dateKey, label, slots: daySlots };
  });
}

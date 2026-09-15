import { DAYS } from "@/lib/db/data";
import { ZONE } from "./wall";

/*
 * Which day the schedule opens on.
 *
 * During the fest that's the day it actually is at the deli. Before it, the
 * first day, so someone reading this in August lands on Friday rather than
 * the middle of the weekend. After it, the last day, so the fest closes on
 * the page the way it closed in life.
 */

/* "YYYY-MM-DD" as read off a clock in Chicago at that instant. en-CA is the
   locale that formats dates in that order, which is why it's used here. */
export function chicagoDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function defaultDayIndex(now: Date = new Date()): number {
  const today = chicagoDate(now);
  const i = DAYS.findIndex((d) => d.iso === today);
  if (i !== -1) return i;
  /* Not a fest day. Ahead of it, Friday is the one to open on — that's where
     the weekend starts. Behind it, the closing day is: it's the last thing
     that happened, and it's what the sign-off above the grid is about. */
  const last = DAYS.length - 1;
  return today > DAYS[last].iso ? last : 0;
}

/* Minutes since midnight, read off a clock in Chicago at that instant —
   the same "what time does it actually feel like at the deli" question
   chicagoDate answers, but for the clock rather than the calendar. */
export function chicagoMinutes(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(now);
  const at = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");
  return (at("hour") % 24) * 60 + at("minute");
}

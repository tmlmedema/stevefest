import { DAYS } from "./data";
import { ZONE } from "./wall";

/*
 * Which day the schedule opens on.
 *
 * During the fest that's the day it actually is at the deli; any other time
 * it's the first day, so someone reading this in August lands on Friday
 * rather than the middle of the weekend.
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
  /* Not a fest day — before it, or after it until we decide what after
     should look like. Either way, open on Friday. */
  return i === -1 ? 0 : i;
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

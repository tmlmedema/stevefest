import { WALL_OPENS, WALL_CLOSES } from "./data";

/*
 * Who may add to the photo wall, and when.
 *
 * Signed-in admins can always upload. Everyone else only during the window in
 * data.ts. Both the page and the upload route ask this same question, so the
 * button and the server can't disagree about the answer.
 */

export const ZONE = "America/Chicago";

/* How far the zone is from UTC at a given instant, in milliseconds. Asks Intl
   what the clock in Chicago reads at that moment and measures the gap, so
   daylight saving is whatever the zone database says it is rather than
   something we hardcode and have to remember to change. */
function offsetAt(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);

  const at = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");

  const asIfUTC = Date.UTC(
    at("year"),
    at("month") - 1,
    at("day"),
    /* Some engines render midnight as hour 24 rather than 0. */
    at("hour") % 24,
    at("minute"),
    at("second")
  );

  return asIfUTC - instant.getTime();
}

/* "2026-09-11T00:00:00" as read off a clock in Chicago -> the actual instant.
   Deliberately not `new Date(str)`, which would use whatever zone the machine
   happens to be in — Chicago on a laptop here, UTC on Vercel. */
export function chicagoTime(local: string): Date {
  const naive = new Date(`${local}Z`);
  if (Number.isNaN(naive.getTime())) {
    throw new Error(`Bad date in data.ts: "${local}" (want YYYY-MM-DDTHH:MM:SS)`);
  }

  /* Subtract the offset, then check it again from where we landed: near a
     daylight-saving jump the first guess can sit on the wrong side of the
     change and be an hour out. */
  const guess = new Date(naive.getTime() - offsetAt(naive));
  return new Date(naive.getTime() - offsetAt(guess));
}

export type WallState = {
  open: boolean;
  /* Why it's shut, for the page to explain. */
  reason: "open" | "too-early" | "too-late" | "admins-only";
  opensAt: Date | null;
};

const WHEN = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: ZONE,
});

export function publicWallState(now: Date = new Date()): WallState {
  const opens = WALL_OPENS ? chicagoTime(WALL_OPENS) : null;
  const closes = WALL_CLOSES ? chicagoTime(WALL_CLOSES) : null;

  if (!opens && !closes) {
    return { open: false, reason: "admins-only", opensAt: null };
  }
  if (opens && now < opens) {
    return { open: false, reason: "too-early", opensAt: opens };
  }
  if (closes && now > closes) {
    return { open: false, reason: "too-late", opensAt: null };
  }
  return { open: true, reason: "open", opensAt: null };
}

/* The one call both the page and the route make. `isAdmin` is passed in
   rather than looked up here, so this file stays free of auth imports and can
   be reasoned about — and tested — on its own. */
export function canUpload(isAdmin: boolean, now: Date = new Date()): boolean {
  return isAdmin || publicWallState(now).open;
}

/* What the page tells a visitor who can't upload right now. */
export function closedNotice(state: WallState): string {
  switch (state.reason) {
    case "too-early":
      return state.opensAt
        ? `The wall opens ${WHEN.format(state.opensAt)}. Check back then.`
        : "The wall isn't open yet. Check back soon.";
    case "too-late":
      return "The wall is closed for uploads. Thanks to everyone who posted.";
    default:
      return "The wall isn't taking uploads right now.";
  }
}

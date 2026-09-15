import { Band, DAYS, DEFAULT_LEN, Day, STAGES, byName } from "./data";
import { chicagoDate, chicagoMinutes } from "./schedule";

/* =======================================================================
   MERCH STATUS — edit here during the fest.

   Everyone starts out tier 3 (nothing confirmed) or tier 1 (has a real
   online store, per the "Buy" links already curated in data.ts) — worked
   out automatically below. Add an entry here the moment a table goes
   live so the /merch board can say something more useful than that, e.g.:

     "Low Range": {
       tier: 2,
       note: "Selling now — merch bin by the deli counter, ask Marco",
       venmo: ["@lowrange"],
       updated: "8:40p",
     },

   Leave `updated` off and it just won't show a timestamp. Overwrite an
   entry's `note`/`updated` as the situation changes; there's no history
   kept, so whatever's here is read as "true right now."
   ======================================================================= */

export type MerchOverride = {
  tier?: 1 | 2 | 3;
  /** the status line, e.g. "Selling now — shirts + tapes, cash/Venmo" */
  note?: string;
  /** e.g. "front window table" */
  location?: string;
  /** free text, set by hand whenever the note changes, e.g. "9:12p" */
  updated?: string;
  venmo?: string[];
  /** overrides the band's own link for a tier-1 Shop button */
  shopUrl?: string;
};

export const MERCH: Record<string, MerchOverride> = {};

export type ResolvedMerch = {
  tier: 1 | 2 | 3;
  note: string;
  location?: string;
  updated?: string;
  venmo?: string[];
  shopUrl?: string;
  contactUrl?: string;
  contactLabel?: string;
};

/** What the merch board shows for a band, blending the live overrides
    above with what data.ts already knows about their links. */
export function merchFor(b: Band): ResolvedMerch {
  const o = MERCH[b.n];

  if (o?.tier === 2) {
    return {
      tier: 2,
      note: o.note ?? "Selling now.",
      location: o.location,
      updated: o.updated,
      venmo: o.venmo,
    };
  }

  /* A band's main link defaults to a "Buy" label when data.ts doesn't set
     one — see the Band type and BandShelf's `{b.l1 || "Buy"}`. Real merch
     is the *unlabeled* case, so that default has to be applied here too,
     or every band that never got an explicit "Music"/"Site" label reads
     as tier 3 even when they have a working store. */
  const l1 = b.u ? b.l1 || "Buy" : undefined;
  const l2 = b.u2 ? b.l2 || "More" : undefined;
  const l3 = b.u3 ? b.l3 || "More" : undefined;

  const hasStore = l1 === "Buy";
  if (o?.tier === 1 || (!o?.tier && hasStore)) {
    return {
      tier: 1,
      note: o?.note ?? "Online store's open.",
      location: o?.location,
      updated: o?.updated,
      venmo: o?.venmo,
      shopUrl: o?.shopUrl ?? b.u,
    };
  }

  const link = o?.shopUrl ?? b.u ?? b.u2 ?? b.u3;
  const label = link === b.u ? l1 : link === b.u2 ? l2 : link === b.u3 ? l3 : undefined;

  return {
    tier: 3,
    note: o?.note ?? "Nothing for sale yet.",
    contactUrl: link,
    contactLabel: label,
  };
}

/* =======================================================================
   WHAT A BAND OFFERS — how to reach them, and whether they sell anywhere.
   ======================================================================= */

export type MerchContact = {
  label: string;
  href: string;
  /** true for a link that leaves the site, so it opens in its own tab */
  external: boolean;
};

/* sms: wants digits, not the "954-793-8431" shape data.ts stores. Ten
   digits is a US number missing its country code; eleven starting with a
   1 already has it. Anything else is passed through untouched rather than
   mangled into a number that doesn't dial. */
function smsNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits || raw;
}

/** Every way a band said they could be reached, in the order the board
    shows them: text, then email, then whatever alternate they handed over
    under its own label. A band who gave none of the three comes back empty,
    which is what hides "Reach out to buy" on their card entirely. */
export function contactsFor(b: Band): MerchContact[] {
  const out: MerchContact[] = [];
  if (b.t) out.push({ label: "Text", href: `sms:${smsNumber(b.t)}`, external: false });
  if (b.e) out.push({ label: "Email", href: `mailto:${b.e}`, external: false });
  if (b.ac) {
    out.push({
      label: b.lac || "Alt Contact",
      href: b.ac,
      external: /^https?:/i.test(b.ac),
    });
  }
  return out;
}

/** The band's own store, and only that: whichever of their three links
    data.ts labelled "Merch". A Bandcamp or Spotify page filed under
    "Music" isn't somewhere you can buy a shirt, so it gets no Shop Online
    button rather than a button that quietly goes somewhere else. */
export function shopUrlFor(b: Band): string | undefined {
  const links: [string | undefined, string | undefined][] = [
    [b.l1, b.u],
    [b.l2, b.u2],
    [b.l3, b.u3],
  ];
  return links.find(([label, url]) => url && label?.toLowerCase() === "merch")?.[1];
}

/** The merch-table line every card carries — a plain reading of the band's
    own `isMerching` flag. Tier 1 paints the dot green, tier 3 purple. */
export function merchTableStatus(b: Band): { tier: 1 | 3; note: string } {
  return b.isMerching
    ? { tier: 1, note: "Selling now at the merch table" }
    : { tier: 3, note: "Not selling at the merch table" };
}

/* =======================================================================
   TICKER — "just played" and "up next", worked out from the schedule.
   ======================================================================= */

const toMin = (t: string) => +t.split(":")[0] * 60 + +t.split(":")[1];

export const fmtClock = (m: number) => {
  let h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 === 0 ? 12 : h % 12;
  return `${h}:${mm} ${ap}`;
};

const slotLen = (stage: string, len: number | undefined) =>
  stage === "Rooftop Stage" ? 60 : len ?? DEFAULT_LEN;

export type TickerEntry = { stage: string; band: string; start: number; end: number };

/** For the given day: the most recently finished set on each stage (or
    null where that stage hasn't wrapped one yet), and the next set on
    each stage (or null where that stage is done for the day).

    A day that isn't actually "now" reads as either entirely in the future
    (nothing's played, `now` treated as before doors) or entirely in the
    past (everything's played, `now` treated as after the last set) —
    so browsing Sunday's board on a Friday still shows something sane. */
export function dayTicker(day: Day, now: Date = new Date()) {
  const today = chicagoDate(now);
  const nowMin =
    day.iso === today
      ? chicagoMinutes(now)
      : day.iso < today
        ? Infinity
        : -Infinity;

  const justPlayed: (TickerEntry | null)[] = [];
  const upNext: (TickerEntry | null)[] = [];

  STAGES.forEach((stage, si) => {
    const lane = day.lanes[si] ?? [];
    let stageJustPlayed: TickerEntry | null = null;
    let stageUpNext: TickerEntry | null = null;

    for (const slot of lane) {
      const start = toMin(slot.t);
      const end = start + slotLen(stage, slot.len);
      const entry: TickerEntry = { stage, band: slot.n, start, end };

      if (end <= nowMin) {
        if (!stageJustPlayed || end > stageJustPlayed.end) stageJustPlayed = entry;
      } else if (!stageUpNext) {
        stageUpNext = entry;
      }
    }
    justPlayed.push(stageJustPlayed);
    upNext.push(stageUpNext);
  });

  return { justPlayed, upNext };
}

/* =======================================================================
   DAYS — where a day sits against the visitor's clock, and what the board
   opens on because of it.
   ======================================================================= */

/** Every set on a day, flattened across all three stages. The board's
    "just played" and "up next" both work off this rather than per-stage
    lanes: a fan wants the last three bands to finish, wherever they were. */
export function daySets(day: Day): TickerEntry[] {
  return STAGES.flatMap((stage, si) =>
    (day.lanes[si] ?? []).map((slot) => {
      const start = toMin(slot.t);
      return { stage, band: slot.n, start, end: start + slotLen(stage, slot.len) };
    }),
  );
}

export type DayState = "past" | "today" | "future";

/** Which side of now a day falls on, by the calendar at the deli. */
export function dayState(day: Day, now: Date = new Date()): DayState {
  const today = chicagoDate(now);
  if (day.iso === today) return "today";
  return day.iso < today ? "past" : "future";
}

/** Has this day's closing set finished? Distinct from `dayState` on purpose:
    at 11:30pm on Friday the calendar still says Friday, but the music has
    stopped, and the tab worth opening is Saturday's. */
export function dayHasEnded(day: Day, now: Date = new Date()): boolean {
  const state = dayState(day, now);
  if (state !== "today") return state === "past";
  const sets = daySets(day);
  if (sets.length === 0) return true;
  return chicagoMinutes(now) >= Math.max(...sets.map((s) => s.end));
}

/** Which day tab the board opens on: Friday before the fest starts, today
    while it's running, and the next day once today's closer is over. After
    the whole thing has wrapped it's the last day — see `festHasConcluded`
    for what the board puts above it. */
export function openingDayIndex(now: Date = new Date()): number {
  const i = DAYS.findIndex((d) => !dayHasEnded(d, now));
  return i === -1 ? DAYS.length - 1 : i;
}

/** True once the very last set of the very last day has finished. */
export function festHasConcluded(now: Date = new Date()): boolean {
  return DAYS.every((d) => dayHasEnded(d, now));
}

/* A day that isn't actually today reads as wholly finished or wholly ahead,
   which is what lets Friday's board still say "played" when it's Sunday. */
function nowMinutesFor(day: Day, now: Date): number {
  const state = dayState(day, now);
  return state === "today" ? chicagoMinutes(now) : state === "past" ? Infinity : -Infinity;
}

/** The last few sets to finish anywhere on site, most recent first. All
    three stages are weighed together, so three sets that happened to end
    back to back on one stage is a legitimate answer. */
export function recentlyPlayed(day: Day, now: Date = new Date(), limit = 3): TickerEntry[] {
  const nowMin = nowMinutesFor(day, now);
  return daySets(day)
    .filter((s) => s.end <= nowMin)
    .sort((a, b) => b.end - a.end)
    .slice(0, limit);
}

/** The next few sets due anywhere on site, soonest first. A band mid-set
    counts as up next rather than dropping off the board between the two
    sections. */
export function comingUp(day: Day, now: Date = new Date(), limit = 3): TickerEntry[] {
  const nowMin = nowMinutesFor(day, now);
  return daySets(day)
    .filter((s) => s.end > nowMin)
    .sort((a, b) => a.start - b.start)
    .slice(0, limit);
}

export function bandFor(name: string): Band {
  return (
    byName[name] ?? {
      n: name,
      active: true,
      isMerching: false,
      s: "unknown",
      base: "—",
      kind: "",
    }
  );
}

import { Band, DEFAULT_LEN, Day, STAGES, byName } from "./data";
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

export function bandFor(name: string): Band {
  return byName[name] ?? { n: name, s: "unknown", base: "—", kind: "" };
}

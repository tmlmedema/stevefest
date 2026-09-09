"use client";

import { useEffect, useState } from "react";
import { DAYS, DEFAULT_LEN, STAGES, nameStyle } from "../lib/data";
import { defaultDayIndex } from "../lib/schedule";
import { ResolvedMerch, TickerEntry, bandFor, dayTicker, fmtClock, merchFor } from "../lib/merch";
import GiveCta from "./GiveCta";

/* The band's real merch link, if data.ts actually has one on file — never
   a fabricated shop URL. Falls back to the roster page for these example
   cards, since none of the three has a real store to point to yet. */
function realShopUrl(band: string): string {
  return merchFor(bandFor(band)).shopUrl ?? "/bands";
}

/* The real, computed status for a band — used for every "full day" example
   below except the two hand-authored "reach out to buy" demos. Whatever
   data.ts already knows about a band (a confirmed store, a Bandcamp page,
   or nothing at all) is what shows up here, unfabricated. */
function realStatus(band: string): ResolvedMerch {
  return merchFor(bandFor(band));
}

const EMPTY_TICKER = {
  upNext: STAGES.map(() => null) as (TickerEntry | null)[],
};

/* Nobody's played yet — the fest doesn't start until Sept 11 — so the real
   per-stage ticker (see dayTicker in lib/merch) has nothing to show. These
   three stand in for it until then, one per tier, so this page demonstrates
   what it looks like instead of just saying "nothing's wrapped yet" three
   times. Swap this block back for `dayTicker(day, now).justPlayed` once
   there's something real to show. */
/* A real build only shows whichever contact method a band actually handed
   over — `textHref`/`instagramHref` are real `sms:`/`https:` links, so
   tapping either opens the phone's own messaging or Instagram app rather
   than this site. */
type HereToday = {
  textHref: string;
  instagramHref: string;
  instagramHandle: string;
};

/* Three real coverage scenarios, worst-to-best case for a fan standing
   there wanting to buy something:
     Horrids    — at the table right now, AND reachable directly, AND a store
     Low Range  — not at the table, but reachable directly and has a store
     Cherry Phox — not at the table, no contact, no store: a dead end */
type ExampleCard = {
  entry: TickerEntry;
  status: ResolvedMerch;
  hereToday?: HereToday;
};

/* Fabricated on purpose, and reused everywhere Horrids/Low Range show up
   below — a real build never invents a phone number or handle a band
   didn't hand over. */
const HORRIDS_HERE_TODAY: HereToday = {
  textHref: "sms:+15550178342",
  instagramHref: "https://www.instagram.com/thehorridsband/",
  instagramHandle: "@thehorridsband",
};
const LOW_RANGE_HERE_TODAY: HereToday = {
  textHref: "sms:+15550134921",
  instagramHref: "https://www.instagram.com/lowrangeband/",
  instagramHandle: "@lowrangeband",
};

const EXAMPLE_JUST_PLAYED: ExampleCard[] = [
  {
    entry: { stage: "Main Stage", band: "The Horrids", start: 21 * 60, end: 21 * 60 + 45 },
    status: {
      tier: 1,
      note: "Selling now at the merch table",
      shopUrl: realShopUrl("The Horrids"),
    },
    hereToday: HORRIDS_HERE_TODAY,
  },
  {
    entry: { stage: "Side Stage", band: "Low Range", start: 21 * 60, end: 21 * 60 + 30 },
    status: {
      tier: 3,
      note: "Not selling at the merch table",
      shopUrl: realShopUrl("Low Range"),
    },
    hereToday: LOW_RANGE_HERE_TODAY,
  },
  {
    entry: { stage: "Rooftop Stage", band: "Cherry Phox", start: 21 * 60, end: 22 * 60 },
    status: {
      tier: 3,
      note: "Not selling at the merch table.",
    },
  },
];

const toMin = (t: string) => +t.split(":")[0] * 60 + +t.split(":")[1];
const slotLenFor = (stage: string, len?: number) =>
  stage === "Rooftop Stage" ? 60 : len ?? DEFAULT_LEN;

/* The Horrids and Low Range keep their hand-authored "reach out to buy"
   scenario wherever they show up in the real schedule below — every other
   band gets its status computed for real (realStatus), unfabricated. */
const STATUS_OVERRIDES: Record<string, { status: ResolvedMerch; hereToday: HereToday }> = {
  "The Horrids": {
    status: {
      tier: 1,
      note: "Selling now at the merch table",
      shopUrl: realShopUrl("The Horrids"),
    },
    hereToday: HORRIDS_HERE_TODAY,
  },
  "Low Range": {
    status: {
      tier: 3,
      note: "Not selling at the merch table",
      shopUrl: realShopUrl("Low Range"),
    },
    hereToday: LOW_RANGE_HERE_TODAY,
  },
};

/* How often the board re-checks the clock — no need for anything tighter,
   the shortest set on the schedule is still many minutes long. */
const TICK_MS = 30_000;

type Product = {
  name: string;
  price?: string;
  image?: string;
  href: string;
};

/* Official Steve Fest merch — not a band's own stuff, so every field here
   is pulled from the real store listing rather than guessed. */
const PRODUCTS: Product[] = [
  {
    name: "I ♥ DTL T-Shirt",
    price: "$20.00",
    image:
      "https://images-api.printify.com/mockup/6a20d87df75ca55a1a0090b3/12100/92570/i-dtl-tshirt.jpg?camera_label=front&revision=1787950716723",
    href: "https://iheartdtl.com/product/29071268",
  },
];

export default function MerchBoard() {
  /* Same SSR-safe pattern as ScheduleGrid: open on day 0 for the first
     paint, then correct to today once we're in the browser. */
  const [dayIx, setDayIx] = useState(0);
  const [now, setNow] = useState<Date | null>(null);
  const [view, setView] = useState<"board" | "store">("board");

  useEffect(() => {
    setDayIx(defaultDayIndex());
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const day = DAYS[dayIx];
  /* Nothing to compute yet on the server — the ticker depends on the
     visitor's clock, so it's blank until useEffect sets `now`. */
  const { upNext } = now ? dayTicker(day, now) : EMPTY_TICKER;

  /* Every band playing this day, one column per stage — recomputed
     whenever the day tab changes, straight from the real schedule. */
  const lineupByStage = STAGES.map((stage, si) => {
    const lane = day.lanes[si] ?? [];
    const cards: ExampleCard[] = lane.map((slot) => {
      const start = toMin(slot.t);
      const end = start + slotLenFor(stage, slot.len);
      const override = STATUS_OVERRIDES[slot.n];
      return {
        entry: { stage, band: slot.n, start, end },
        status: override?.status ?? realStatus(slot.n),
        hereToday: override?.hereToday,
      };
    });
    return { stage, cards };
  });

  return (
    <>
      <div className="merch-head">
        <h2 className="head">Support the Bands, Buy Their Stuff</h2>
        <div className="days" id="days">
          {DAYS.map((d, i) => (
            <button
              key={d.label}
              className="day-btn"
              aria-pressed={view === "board" && i === dayIx}
              onClick={() => {
                setView("board");
                setDayIx(i);
              }}
            >
              {d.label}
              <small>{d.date}</small>
            </button>
          ))}
          <button
            className="day-btn merch-tab"
            aria-pressed={view === "store"}
            onClick={() => setView("store")}
          >
            Other Stuff
          </button>
        </div>
      </div>

      {view === "store" ? (
        <div className="merch-store">
          <div className="product-grid">
            {PRODUCTS.map((p) => (
              <article className="product-card" key={p.name}>
                {p.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.name} />
                )}
                <div className="product-body">
                  <h4 className="product-name">{p.name}</h4>
                  {p.price && <span className="product-price">{p.price}</span>}
                  <a className="product-buy" href={p.href} target="_blank" rel="noopener">
                    Buy &rarr;
                  </a>
                </div>
              </article>
            ))}
          </div>

          <GiveCta />
        </div>
      ) : (
        <>
          <h3 className="lineup-head">Just played</h3>
          <div className="merch-stage-grid">
            {EXAMPLE_JUST_PLAYED.map(({ entry, status, hereToday }) => (
              <JustPlayedCard
                key={entry.stage}
                entry={entry}
                status={status}
                hereToday={hereToday}
              />
            ))}
          </div>

          <h3 className="lineup-head">Up next</h3>
          <div className="sheet alt-upnext merch-upnext-board">
            <div className="alt-upnext-row">
              {upNext.map((entry, i) => (
                <div className="alt-upnext-item" key={STAGES[i]}>
                  <span className="n" style={entry ? nameStyle(entry.band) : undefined}>
                    {entry ? entry.band : `${STAGES[i]} wrapped`}
                  </span>
                  <span className="s">{entry ? entry.stage : ""}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="merch-played">
            <h3 className="lineup-head">Shop today&apos;s lineup</h3>
            <div className="played-columns">
              {lineupByStage.map(({ stage, cards }) => (
                <div className="played-col" key={stage}>
                  <span className="g-head">{stage}</span>
                  {[...cards]
                    .sort((a, b) => b.entry.end - a.entry.end)
                    .map(({ entry, status, hereToday }) => (
                      <article className="played-card" key={entry.band}>
                        <div className="played-body">
                          <h4 style={nameStyle(entry.band)}>
                            <TagIcon />
                            {entry.band}
                          </h4>
                          <span className="played-time">
                            {fmtClock(entry.start)}&ndash;{fmtClock(entry.end)}
                          </span>

                          {hereToday && (
                            <div className="reach-out">
                              <span className="played-label featured">Reach out to buy</span>
                              <span className="played-sub">
                                They&apos;re around here somewhere with merch in tow.
                                Flag them down:
                              </span>
                              <div className="played-chips">
                                <a className="played-chip" href={hereToday.textHref}>
                                  Text
                                </a>
                                <a
                                  className="played-chip"
                                  href={hereToday.instagramHref}
                                  target="_blank"
                                  rel="noopener"
                                >
                                  {hereToday.instagramHandle}
                                </a>
                              </div>
                            </div>
                          )}

                          {status.shopUrl && (
                            <div className="played-chips">
                              <a className="played-chip ghost" href={status.shopUrl}>
                                Shop online
                              </a>
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function JustPlayedCard({
  entry,
  status,
  hereToday,
}: {
  entry: TickerEntry;
  status: ResolvedMerch;
  hereToday?: HereToday;
}) {
  return (
    <div className="sheet merch-card">
      <span className="eyebrow">{entry.stage}</span>
      <h3 className="merch-band" style={nameStyle(entry.band)}>
        {entry.band}
      </h3>

      <MerchStatusLine status={status} />

      {hereToday && (
        <div className="reach-out">
          <span className="played-label featured">Reach out to buy</span>
          <span className="played-sub">
            They&apos;re around here somewhere with merch in tow. Flag them
            down:
          </span>
          <div className="merch-actions">
            <a className="merch-btn" href={hereToday.textHref}>
              Text
            </a>
            <a
              className="merch-btn"
              href={hereToday.instagramHref}
              target="_blank"
              rel="noopener"
            >
              {hereToday.instagramHandle}
            </a>
          </div>
        </div>
      )}

      {status.shopUrl && (
        <div className="merch-actions">
          <a className="merch-btn" href={status.shopUrl}>
            Shop online &rarr;
          </a>
        </div>
      )}
    </div>
  );
}

function MerchStatusLine({ status }: { status: ResolvedMerch }) {
  return (
    <p className={`merch-status tier-${status.tier}`}>
      <i />
      {status.note}
      {(status.location || status.updated) && (
        <span className="merch-meta">
          {[status.location, status.updated && `updated ${status.updated}`]
            .filter(Boolean)
            .join(" · ")}
        </span>
      )}
      {status.venmo && status.venmo.length > 0 && (
        <span className="merch-venmo">Venmo {status.venmo.join(" · ")}</span>
      )}
      {status.tier === 3 && status.contactUrl && (
        <a className="merch-tell" href={status.contactUrl}>
          Tell them you&apos;d buy one &rarr;
        </a>
      )}
    </p>
  );
}

/* A price tag, not an emoji — reads as "merch" at a glance without
   depending on how any given OS renders emoji fonts. */
function TagIcon() {
  return (
    <svg
      className="tag-icon"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DAYS, DEFAULT_LEN, STAGES, nameStyle } from "../lib/data";
import { defaultDayIndex } from "../lib/schedule";
import { ResolvedMerch, TickerEntry, bandFor, dayTicker, fmtClock, merchFor } from "../lib/merch";

/* Alternate layout for the merch board — same data and lib functions as
   MerchBoard.tsx, and the same visual language as the rest of the site
   (.sheet/.merch-card/.g-head/.day-btn/.merch-btn), not a separate style
   system. What's actually new here is the layout: "Up next" as one row
   with an inline schedule link, and a compact cart-icon list for "Shop
   today's lineup" — no photo/thumbnail slots at all, by design. */

function realShopUrl(band: string): string {
  return merchFor(bandFor(band)).shopUrl ?? "/bands";
}
function realStatus(band: string): ResolvedMerch {
  return merchFor(bandFor(band));
}

type HereToday = { textHref: string; instagramHref: string; instagramHandle: string };
type ExampleCard = { entry: TickerEntry; status: ResolvedMerch; hereToday?: HereToday };

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
    status: { tier: 1, note: "Selling now at the merch table", shopUrl: realShopUrl("The Horrids") },
    hereToday: HORRIDS_HERE_TODAY,
  },
  {
    entry: { stage: "Side Stage", band: "Low Range", start: 21 * 60, end: 21 * 60 + 30 },
    status: {
      tier: 3,
      note: "Not selling at the merch table right now",
      shopUrl: realShopUrl("Low Range"),
    },
    hereToday: LOW_RANGE_HERE_TODAY,
  },
  {
    entry: { stage: "Rooftop Stage", band: "Cherry Phox", start: 21 * 60, end: 22 * 60 },
    status: { tier: 3, note: "Not selling at the merch table." },
  },
];

const toMin = (t: string) => +t.split(":")[0] * 60 + +t.split(":")[1];
const slotLenFor = (stage: string, len?: number) =>
  stage === "Rooftop Stage" ? 60 : len ?? DEFAULT_LEN;

const STATUS_OVERRIDES: Record<string, { status: ResolvedMerch; hereToday: HereToday }> = {
  "The Horrids": {
    status: { tier: 1, note: "Selling now at the merch table", shopUrl: realShopUrl("The Horrids") },
    hereToday: HORRIDS_HERE_TODAY,
  },
  "Low Range": {
    status: {
      tier: 3,
      note: "Not selling at the merch table right now",
      shopUrl: realShopUrl("Low Range"),
    },
    hereToday: LOW_RANGE_HERE_TODAY,
  },
};

const TICK_MS = 30_000;

export default function MerchBoardAlt() {
  const [dayIx, setDayIx] = useState(0);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setDayIx(defaultDayIndex());
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const day = DAYS[dayIx];
  const { upNext } = now
    ? dayTicker(day, now)
    : { upNext: STAGES.map(() => null) as (TickerEntry | null)[] };

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
        <h2 className="head">Support the bands, buy their stuff</h2>
        <div className="days" id="days">
          {DAYS.map((d, i) => (
            <button
              key={d.label}
              className="day-btn"
              aria-pressed={i === dayIx}
              onClick={() => setDayIx(i)}
            >
              {d.label}
              <small>{d.date}</small>
            </button>
          ))}
        </div>
      </div>
      <p className="lede">
        Merch is sold directly by the artists &mdash; we&apos;ll take you to their
        official stores.
      </p>

      <h3 className="lineup-head alt-section-head">Just played</h3>
      <div className="merch-stage-grid">
        {EXAMPLE_JUST_PLAYED.map(({ entry, status, hereToday }) => (
          <div className="sheet merch-card" key={entry.stage}>
            <span className="eyebrow">{entry.stage}</span>
            <h3 className="merch-band" style={nameStyle(entry.band)}>
              {entry.band}
            </h3>
            <p className={`merch-status tier-${status.tier}`}>
              <i />
              {status.note}
            </p>

            {hereToday && (
              <>
                <span className="played-label featured">Reach out to buy</span>
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
              </>
            )}

            {status.shopUrl && (
              <div className="merch-actions">
                <a className="merch-btn" href={status.shopUrl}>
                  Shop online &rarr;
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      <h3 className="lineup-head alt-section-head">Up next</h3>
      <div className="sheet alt-upnext">
        <div className="alt-upnext-row">
          {upNext.map((entry, i) => (
            <div className="alt-upnext-item" key={STAGES[i]}>
              <span className="t">{entry ? fmtClock(entry.start) : "—"}</span>
              <span className="n" style={entry ? nameStyle(entry.band) : undefined}>
                {entry ? entry.band : `${STAGES[i]} wrapped`}
              </span>
              <span className="s">{entry ? entry.stage : ""}</span>
            </div>
          ))}
        </div>
        <Link className="merch-find" href="/schedule">
          View full schedule &rarr;
        </Link>
      </div>

      <h3 className="lineup-head alt-section-head">Shop today&apos;s lineup</h3>
      <div className="alt-lineup">
        {lineupByStage.map(({ stage, cards }) => (
          <div className="alt-lineup-col" key={stage}>
            <div className="g-head">
              <span className="stage-glyph">
                <StageIcon stage={stage} />
              </span>
              {stage}
            </div>
            <div className="alt-lineup-list">
              {[...cards]
                .sort((a, b) => b.entry.end - a.entry.end)
                .map(({ entry, status, hereToday }) => (
                  <div className="alt-lineup-row" key={entry.band}>
                    <div className="alt-lineup-info">
                      <strong style={nameStyle(entry.band)}>{entry.band}</strong>
                      <span>
                        {fmtClock(entry.start)} &ndash; {fmtClock(entry.end)}
                      </span>

                      {hereToday && (
                        <>
                          <span className="played-label">Reach out to buy</span>
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
                        </>
                      )}

                      {status.shopUrl && (
                        <div className="played-chips">
                          <a className="played-chip ghost" href={status.shopUrl}>
                            Shop online
                          </a>
                        </div>
                      )}
                    </div>

                    {status.shopUrl && !hereToday && (
                      <a className="alt-cart" href={status.shopUrl} aria-label={`Shop ${entry.band}`}>
                        <CartIcon />
                      </a>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" fill="currentColor" stroke="none" />
      <circle cx="20" cy="21" r="1" fill="currentColor" stroke="none" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function StageIcon({ stage }: { stage: string }) {
  if (stage === "Main Stage") {
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    );
  }
  if (stage === "Side Stage") {
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

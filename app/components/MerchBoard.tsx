"use client";

import { useEffect, useState } from "react";
import { DAYS, STAGES, nameStyle } from "../lib/data";
import {
  MerchContact,
  TickerEntry,
  bandFor,
  comingUp,
  contactsFor,
  dayState,
  daySets,
  festHasConcluded,
  fmtClock,
  merchTableStatus,
  openingDayIndex,
  recentlyPlayed,
  shopUrlFor,
} from "../lib/merch";
import GiveCta from "./GiveCta";

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

/* Everything a card needs about one band, all of it read off the roster —
   no card ever invents a number, a handle or a store. */
type BandMerch = {
  contacts: MerchContact[];
  shopUrl?: string;
  table: { tier: 1 | 3; note: string };
};

function bandMerch(name: string): BandMerch {
  const b = bandFor(name);
  return {
    contacts: contactsFor(b),
    shopUrl: shopUrlFor(b),
    table: merchTableStatus(b),
  };
}

export default function MerchBoard() {
  /* Same SSR-safe pattern as ScheduleGrid: open on day 0 for the first
     paint, then correct to the day that actually matters once we're in the
     browser and can read the visitor's clock. */
  const [dayIx, setDayIx] = useState(0);
  const [now, setNow] = useState<Date | null>(null);
  const [view, setView] = useState<"board" | "store">("board");

  useEffect(() => {
    setDayIx(openingDayIndex());
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const day = DAYS[dayIx];

  /* Nothing to work out on the server — all of this depends on the
     visitor's clock, so until useEffect sets `now` the board renders as
     if the whole fest were still ahead. */
  const state = now ? dayState(day, now) : "future";
  const concluded = now ? festHasConcluded(now) : false;

  /* "Just played" is only ever about the day you're actually standing in.
     On any other tab — a day already gone, or one still to come — those
     three cards would be answering a question nobody asked. */
  const justPlayed =
    now && !concluded && state === "today" ? recentlyPlayed(day, now) : [];

  /* "Up next" survives onto future tabs (Sunday's first three bands, read
     on Saturday) but not onto days that have already happened. */
  const upNext = now && !concluded && state !== "past" ? comingUp(day, now) : [];

  /* The day's whole bill, newest set first within each stage — the one
     section that's on every tab, whatever the clock says. */
  const lineupByStage = STAGES.map((stage) => ({
    stage,
    sets: daySets(day)
      .filter((s) => s.stage === stage)
      .sort((a, b) => b.end - a.end),
  }));

  const lineupHead =
    state === "today" ? "Shop today's lineup" : `Shop ${day.label} lineup`;

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
        <section className="merch-section merch-store">
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
        </section>
      ) : (
        <>
          {concluded && <ConcludedPanel />}

          {justPlayed.length > 0 && (
            <section className="merch-section">
              <h3 className="lineup-head">Just played</h3>
              <div className="merch-stage-grid">
                {justPlayed.map((entry) => (
                  <JustPlayedCard key={`${entry.stage}-${entry.band}`} entry={entry} />
                ))}
              </div>
            </section>
          )}

          {upNext.length > 0 && (
            <section className="merch-section">
              <h3 className="lineup-head">Up next</h3>
              <div className="sheet alt-upnext merch-upnext-board">
                <div className="alt-upnext-row">
                  {upNext.map((entry) => (
                    <div className="alt-upnext-item" key={`${entry.stage}-${entry.band}`}>
                      <span className="n" style={nameStyle(entry.band)}>
                        {entry.band}
                      </span>
                      <span className="s">{entry.stage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="merch-section">
            <h3 className="lineup-head">{lineupHead}</h3>
            <div className="played-columns">
              {lineupByStage.map(({ stage, sets }) => (
                <div className="played-col" key={stage}>
                  <span className="g-head">{stage}</span>
                  {sets.map((entry) => (
                    <LineupCard key={`${entry.band}-${entry.start}`} entry={entry} />
                  ))}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <GiveCta />
    </>
  );
}

/* The sign-off, once the closing set of the last day is over. Everything
   above it — who just played, who's up next — is about a fest that's still
   running, so it comes down and this goes up in its place. The day tabs
   stay, because a band's shop links are still worth something on Monday. */
function ConcludedPanel() {
  return (
    <section className="merch-section">
      <div className="sheet merch-concluded">
        <p className="merch-concluded-copy">
          Steve Fest has concluded. Thank you for participating in this
          extraordinary event. We look forward to seeing you all next year
          for&hellip;
        </p>
        <p className="merch-concluded-next">
          Steve Fest 3: Next time it&apos;s personal!
        </p>
      </div>
    </section>
  );
}

/* One of the three big "just played" cards. */
function JustPlayedCard({ entry }: { entry: TickerEntry }) {
  const { contacts, shopUrl, table } = bandMerch(entry.band);

  return (
    <div className="sheet merch-card">
      <span className="eyebrow">{entry.stage}</span>
      <h3 className="merch-band" style={nameStyle(entry.band)}>
        {entry.band}
      </h3>

      {/* <p className={`merch-status tier-${table.tier}`}>
        <i />
        {table.note}
      </p> */}

      {contacts.length > 0 && (
        <div className="reach-out">
          <span className="played-label featured">Reach out to buy</span>
          <span className="played-sub">
            They&apos;re around here somewhere with merch in tow. Flag them
            down:
          </span>
          <div className="merch-actions">
            {contacts.map((c) => (
              <ContactLink key={c.href} className="merch-btn" contact={c} />
            ))}
          </div>
        </div>
      )}

      {shopUrl && (
        <div className="merch-actions">
          <a className="merch-btn" href={shopUrl} target="_blank" rel="noopener">
            Shop online &rarr;
          </a>
        </div>
      )}
    </div>
  );
}

/* The compact version of the same card, one per set in "Shop … lineup".
   No merch-table line here: this section is the whole day's bill at once,
   most of it hours away from the table either way, so "not selling at the
   merch table" on twenty cards is noise. That status belongs on the three
   "just played" cards, where it answers a question someone is standing
   there asking. */
function LineupCard({ entry }: { entry: TickerEntry }) {
  const { contacts, shopUrl } = bandMerch(entry.band);

  return (
    <article className="played-card">
      <div className="played-body">
        <h4 style={nameStyle(entry.band)}>
          <TagIcon />
          {entry.band}
        </h4>
        <span className="played-time">
          {fmtClock(entry.start)}&ndash;{fmtClock(entry.end)}
        </span>

        {contacts.length > 0 && (
          <div className="reach-out">
            <span className="played-label featured">Reach out to buy</span>
            <span className="played-sub">
              They&apos;re around here somewhere with merch in tow. Flag them
              down:
            </span>
            <div className="played-chips">
              {contacts.map((c) => (
                <ContactLink key={c.href} className="played-chip" contact={c} />
              ))}
            </div>
          </div>
        )}

        {shopUrl && (
          <div className="played-chips">
            <a
              className="played-chip ghost"
              href={shopUrl}
              target="_blank"
              rel="noopener"
            >
              Shop online
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

/* An sms:/mailto: link stays in place and hands off to the phone's own app;
   only a real http link wants a new tab. */
function ContactLink({
  contact,
  className,
}: {
  contact: MerchContact;
  className: string;
}) {
  return (
    <a
      className={className}
      href={contact.href}
      target={contact.external ? "_blank" : undefined}
      rel={contact.external ? "noopener" : undefined}
    >
      {contact.label}
    </a>
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

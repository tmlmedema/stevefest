import type { Metadata } from "next";
import { DAYS, DEFAULT_LEN, STAGES, UNIT, nameStyle } from "../../lib/data";
import PrintButton from "./PrintButton";
import "./print.css";

export const metadata: Metadata = {
  title: "Schedule (print) — Steve Fest II",
  description: "The Steve Fest II schedule, one 11×17 sheet per day.",
  robots: { index: false, follow: false },
};

const toMin = (t: string) => +t.split(":")[0] * 60 + +t.split(":")[1];

const fmt = (m: number) => {
  let h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 === 0 ? 12 : h % 12;
  return `${h}:${mm} ${ap}`;
};

/* One 11x17 sheet per day, portrait. The grid rows are fr units and the grid
   stretches to the sheet, so each day sets its own scale off its own running
   time — a short day just breathes more than a long one. */
export default function SchedulePrint() {
  return (
    <div className="p-page">
      <div className="p-bar">
        <PrintButton />
        <span>11 &times; 17 portrait, one sheet per day. Turn on background graphics.</span>
      </div>

      {DAYS.map((d) => {
        const s0 = toMin(d.start);
        const end =
          Math.max(
            ...d.lanes
              .flat()
              .map((slot) => toMin(slot.t) + (slot.len ?? DEFAULT_LEN))
          ) + 15;
        const rows = Math.ceil((end - s0) / UNIT);

        return (
          <div className="p-sheet" data-day={d.iso} key={d.label}>
            <header className="p-head">
              <div className="p-title">
                <b>Steve Fest II</b>
                <span>Downtown Lombard Edition</span>
              </div>
              <div className="p-dayline">
                <b>{d.label}</b>
                <span>{d.date}, 2026</span>
              </div>
            </header>

            <div className="p-sub">
              <span>
                Shannon&apos;s Deli &middot; 11 S Park Ave, Lombard IL &middot; Free
                &middot; All ages
              </span>
              <span className="p-legend">
                <span>
                  <i className="k-set" />
                  Set
                </span>
                <span>
                  <i className="k-close" />
                  Closing set
                </span>
              </span>
            </div>

            <div
              className="p-grid"
              style={{
                gridTemplateColumns: `var(--p-rail) repeat(${STAGES.length},1fr)`,
                gridTemplateRows: `auto repeat(${rows},minmax(0,1fr))`,
              }}
            >
              <div className="p-gh p-rail" />
              {STAGES.map((s) => (
                <div className="p-gh" key={s}>
                  {s}
                </div>
              ))}

              {Array.from({ length: rows }, (_, r) => {
                const m = s0 + r * UNIT;
                return (
                  <div className="p-time" style={{ gridRow: r + 2 }} key={r}>
                    {m % 60 === 0 ? fmt(m) : ""}
                  </div>
                );
              })}

              {STAGES.map((s, si) => (
                <div
                  className="p-lane"
                  key={`lane-${s}`}
                  style={{ gridColumn: si + 2, gridRow: `2 / span ${rows}` }}
                />
              ))}

              {d.lanes.flatMap((lane, si) => {
                if (!lane.length) {
                  return [
                    <div
                      className="p-dark"
                      key={`dark-${si}`}
                      style={{ gridColumn: si + 2, gridRow: `2 / span ${rows}` }}
                    >
                      Stage dark
                    </div>,
                  ];
                }

                const isRooftop = STAGES[si] === "Rooftop Stage";
                const leadRows = isRooftop
                  ? Math.round((toMin(lane[0].t) - s0) / UNIT)
                  : 0;

                const note =
                  leadRows > 0
                    ? [
                        <div
                          className="p-note"
                          key={`note-${si}`}
                          style={{
                            gridColumn: si + 2,
                            gridRow: `2 / span ${leadRows}`,
                          }}
                        >
                          The rooftop runs on Steve time. Acts go up around the
                          hour; sets run 20&ndash;60 minutes.
                        </div>,
                      ]
                    : [];

                return [
                  ...note,
                  ...lane.map((slot, k) => {
                    const st = toMin(slot.t);
                    const len = isRooftop ? 60 : slot.len ?? DEFAULT_LEN;
                    const closer = k === lane.length - 1 && lane.length > 1;

                    return (
                      <div
                        key={`${si}-${slot.n}-${slot.t}`}
                        className={closer ? "p-slot is-close" : "p-slot"}
                        style={{
                          gridColumn: si + 2,
                          gridRow: `${(st - s0) / UNIT + 2} / span ${Math.round(
                            len / UNIT
                          )}`,
                        }}
                      >
                        <span className="p-n" style={nameStyle(slot.n)}>
                          {slot.n}
                        </span>
                        <span className="p-t">
                          {isRooftop ? fmt(st) : `${fmt(st)} – ${fmt(st + len)}`}
                        </span>
                      </div>
                    );
                  }),
                ];
              })}
            </div>

            <footer className="p-foot">
              stevefest.com &middot; Sept 11&ndash;13, 2026 &middot; Sponsored by
              Shannon&apos;s Deli, Blind Corner Brewery, Punk Rock Saves Lives,
              Carpool, Dobies Printing, Eating Soup Daily, JL Vintage &amp; I
              Heart DTL
            </footer>
          </div>
        );
      })}
    </div>
  );
}

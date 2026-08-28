"use client";

import { useEffect, useState } from "react";
import { DAYS, DEFAULT_LEN, STAGES, UNIT, byName } from "../lib/data";
import { defaultDayIndex } from "../lib/schedule";

const toMin = (t: string) =>
  +t.split(":")[0] * 60 + +t.split(":")[1];

const fmt = (m: number) => {
  let h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 === 0 ? 12 : h % 12;
  return `${h}:${mm} ${ap}`;
};

const ROW_PX = 14;

const ROOFTOP_NOTE = (
  <p>
    <b>The rooftop runs on Steve time.</b> Acts go up around the hour;
    sets run 20–60 minutes.
  </p>
);

export default function ScheduleGrid() {
  /* Opens on the first day so the server and the browser agree on the first
     paint, then moves to today if today is one of the three. */
  const [dayIx, setDayIx] = useState(0);

  useEffect(() => {
    setDayIx(defaultDayIndex());
  }, []);

  const d = DAYS[dayIx];
  const s0 = toMin(d.start);
  const end =
    Math.max(
      ...d.lanes.flat().map((slot) => toMin(slot.t) + (slot.len ?? DEFAULT_LEN))
    ) + 30;
  const rows = Math.ceil((end - s0) / UNIT);

  return (
    <>
      <div className="days" id="days">
        {DAYS.map((day, i) => (
          <button
            key={day.label}
            className="day-btn"
            aria-pressed={i === dayIx}
            onClick={() => setDayIx(i)}
          >
            {day.label}
            <small>{day.date}</small>
          </button>
        ))}
      </div>

      <div className="grid-scroll">
        <div
          className="grid"
          id="grid"
          style={{
            gridTemplateColumns: `var(--rail-w) repeat(${STAGES.length},1fr)`,
            gridTemplateRows: `auto repeat(${rows},${ROW_PX}px)`,
          }}
        >
          <div className="g-head rail" />
          {STAGES.map((s) => (
            <div className="g-head" key={s}>
              {s}
            </div>
          ))}

          {Array.from({ length: rows }, (_, r) => {
            const m = s0 + r * UNIT;
            return (
              <div className="g-time" style={{ gridRow: r + 2 }} key={r}>
                {m % 60 === 0 ? fmt(m) : ""}
              </div>
            );
          })}

          {STAGES.map((s, si) => (
            <div
              className="g-lane"
              key={`lane-${s}`}
              style={{ gridColumn: si + 2, gridRow: `2 / span ${rows}` }}
            />
          ))}

          {d.lanes.map((lane, si) => {
            if (!lane.length) {
              return (
                <div
                  className="g-lane"
                  key={`dark-${si}`}
                  style={{
                    gridColumn: si + 2,
                    gridRow: `2 / span ${rows}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--mono)",
                    fontSize: ".7rem",
                    letterSpacing: ".2em",
                    color: "#9b86a4",
                  }}
                >
                  STAGE DARK
                </div>
              );
            }

            const isRooftop = STAGES[si] === "Rooftop Stage";
            const leadRows = isRooftop
              ? Math.round((toMin(lane[0].t) - s0) / UNIT)
              : 0;

            const noteEl =
              leadRows > 0 ? (
                <div
                  className="rooftop-note"
                  key={`note-${si}`}
                  style={{ gridColumn: si + 2, gridRow: `2 / span ${leadRows}` }}
                >
                  {ROOFTOP_NOTE}
                </div>
              ) : null;

            const slotEls = lane.map((slot, k) => {
              const st = toMin(slot.t);
              const len = isRooftop ? 60 : slot.len ?? DEFAULT_LEN;
              const b = byName[slot.n] ?? {};
              const closer = k === lane.length - 1 && lane.length > 1;
              const cls = closer ? "slot head-set" : "slot";
              const style = {
                gridColumn: si + 2,
                gridRow: `${(st - s0) / UNIT + 2} / span ${Math.round(len / UNIT)}`,
              };
              const inner = (
                <>
                  <span
                    className="n"
                    style={slot.n === "A FrumpyKnot" ? { textTransform: "none" } : undefined}
                  >
                    {slot.n}
                  </span>
                  <span className="t">
                    {isRooftop ? fmt(st) : `${fmt(st)} – ${fmt(st + len)}`}
                  </span>
                </>
              );

              return b.u ? (
                <a
                  key={`${si}-${slot.n}-${slot.t}`}
                  className={cls}
                  style={style}
                  href={b.u}
                  target="_blank"
                  rel="noopener"
                >
                  {inner}
                </a>
              ) : (
                <div key={`${si}-${slot.n}-${slot.t}`} className={cls} style={style}>
                  {inner}
                </div>
              );
            });

            return [noteEl, ...slotEls];
          })}
        </div>
      </div>
    </>
  );
}

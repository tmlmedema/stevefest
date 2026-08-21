"use client";

import { useState } from "react";
import { DAYS, GAP, SET, STAGES, UNIT, byName } from "../lib/data";

const toMin = (t: string) =>
  +t.split(":")[0] * 60 + +t.split(":")[1];

const fmt = (m: number) => {
  let h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 === 0 ? 12 : h % 12;
  return `${h}:${mm} ${ap}`;
};

export default function ScheduleGrid() {
  const [dayIx, setDayIx] = useState(1);

  const d = DAYS[dayIx];
  const s0 = toMin(d.start);
  const longest = Math.max(...d.lanes.map((l) => l.length));
  const end = s0 + longest * (SET + GAP) + 30;
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
            gridTemplateColumns: `62px repeat(${STAGES.length},1fr)`,
            gridTemplateRows: `auto repeat(${rows},22px)`,
          }}
        >
          <div className="g-head rail">2026</div>
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

            return lane.map((name, k) => {
              const st = s0 + k * (SET + GAP);
              const b = byName[name] ?? {};
              const closer = k === lane.length - 1 && lane.length > 1;
              const cls = closer ? "slot head-set" : "slot";
              const style = {
                gridColumn: si + 2,
                gridRow: `${(st - s0) / UNIT + 2} / span ${SET / UNIT}`,
              };
              const inner = (
                <>
                  <span className="n">{name}</span>
                  <span className="t">
                    {fmt(st)} – {fmt(st + SET)}
                  </span>
                </>
              );

              return b.u ? (
                <a
                  key={`${si}-${name}`}
                  className={cls}
                  style={style}
                  href={b.u}
                  target="_blank"
                  rel="noopener"
                >
                  {inner}
                </a>
              ) : (
                <div key={`${si}-${name}`} className={cls} style={style}>
                  {inner}
                </div>
              );
            });
          })}
        </div>
      </div>
    </>
  );
}

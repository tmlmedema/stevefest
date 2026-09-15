"use client";

import { useEffect, useState } from "react";
import { DOORS, OVER } from "../lib/data";

const LABELS = ["Days", "Hours", "Min", "Sec"];
const BARS = ["var(--yellow)", "var(--orange)", "var(--pink)", "var(--green)"];

type State = { ticks: string[]; note: string; live: boolean };

const WAITING: State = { ticks: ["--", "--", "--", "--"], note: "", live: false };

function read(): State {
  const left = new Date(DOORS).getTime() - Date.now();

  if (left <= 0) {
    const over = Date.now() > new Date(OVER).getTime();
    return {
      ticks: ["00", "00", "00", "00"],
      note: over
        ? "That's a wrap on Steve Fest II — see you next year"
        : "Steve Fest II is happening right now in Downtown Lombard",
      live: true,
    };
  }

  const s = Math.floor(left / 1000);
  const v = [
    Math.floor(s / 86400),
    Math.floor(s / 3600) % 24,
    Math.floor(s / 60) % 60,
    s % 60,
  ];
  return { ticks: v.map((n) => String(n).padStart(2, "0")), note: "", live: false };
}

export default function Countdown() {
  /* starts blank so the server and the browser agree on the first paint */
  const [state, setState] = useState<State>(WAITING);

  useEffect(() => {
    setState(read());
    const id = setInterval(() => setState(read()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="countdown" id="countdown">
        {state.ticks.map((t, i) => (
          <div className="tick" key={LABELS[i]}>
            <i style={{ background: BARS[i] }} />
            <b>{t}</b>
            <span>{LABELS[i]}</span>
          </div>
        ))}
      </div>
      <p className={state.live ? "count-note live" : "count-note"}>
        {state.note}
      </p>
    </>
  );
}

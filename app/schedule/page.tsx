import type { Metadata } from "next";
import ScheduleGrid from "../components/ScheduleGrid";

export const metadata: Metadata = {
  title: "Schedule — Steve Fest II",
  description:
    "Who plays when at Steve Fest II: three days, three stages, Sept 11–13 2026 in Downtown Lombard.",
};

export default function Schedule() {
  return (
    <section id="schedule" className="view">
      <div className="wrap page-top">
        <p className="eyebrow">Three days, three stages</p>
        <h2 className="head">
          Who plays
          <br />
          when
        </h2>
        <p className="draft">
          Draft — stage names and set times are placeholders
        </p>

        <ScheduleGrid />

        <p className="legend">
          <span>
            <i style={{ background: "var(--paper)" }} />
            Set
          </span>
          <span>
            <i style={{ background: "#FF6A15" }} />
            Closing set
          </span>
          <span>Doors 30 minutes before first band</span>
        </p>
      </div>
    </section>
  );
}

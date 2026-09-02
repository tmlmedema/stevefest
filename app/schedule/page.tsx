import type { Metadata } from "next";
import ScheduleGrid from "../components/ScheduleGrid";
import GiveCta from "../components/GiveCta";

export const metadata: Metadata = {
  title: "Schedule — Steve Fest II",
  description:
    "Who plays when at Steve Fest II: three days, three stages, Sept 11–13 2026 in Downtown Lombard.",
};

export default function Schedule() {
  return (
    <section id="schedule" className="view">
      <div className="wrap page-top">
        <h2 className="head">Who plays when</h2>

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
        </p>

        <GiveCta />
      </div>
    </section>
  );
}

// Saved copy of the full schedule page (app/schedule/page.tsx) as of the
// switch to the "coming soon" placeholder. This file lives in a folder
// prefixed with "_", which Next.js excludes from routing, so it's kept
// around but not served anywhere.
//
// To restore: copy the contents below back into app/schedule/page.tsx.

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
        <h2 className="head">Who plays when</h2>
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

import type { Metadata } from "next";
import Image from "next/image";
import ScheduleGrid from "../components/ScheduleGrid";
import GiveCta from "../components/GiveCta";
import "./print.css";

export const metadata: Metadata = {
  title: "Schedule — Steve Fest II",
  description:
    "Who plays when at Steve Fest II: three days, three stages, Sept 11–13 2026 in Downtown Lombard.",
};

export default function Schedule() {
  return (
    <section id="schedule" className="view">
      <div className="wrap page-top">
        {/* The mark only shows on the printed sheet, which needs to say what
            it's a schedule for once it's off the site. `priority` is what
            makes that work: the image is display:none on screen, and a lazy
            one that never entered a viewport doesn't reliably load in time
            for the print, so it comes out blank. */}
        <div className="sched-head">
          <h2 className="head">Who plays when</h2>
          <span className="sched-mark">
            <Image
              src="/assets/wordmark-nav.png"
              alt="Steve Fest II"
              width={760}
              height={187}
              priority
            />
          </span>
        </div>

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

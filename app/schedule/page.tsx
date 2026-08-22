import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule — Steve Fest II",
  description:
    "The Steve Fest II schedule is coming soon. Sept 11–13 2026 in Downtown Lombard.",
};

export default function Schedule() {
  return (
    <section id="schedule" className="view">
      <div className="wrap coming-soon">
        <div className="coming-box">
          Steve is still arguing with the calendar.
          <br />
          Check back soon.
        </div>
      </div>
    </section>
  );
}

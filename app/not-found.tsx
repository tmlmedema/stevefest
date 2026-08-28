import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found — Steve Fest II",
  description: "That page isn't part of Steve Fest II.",
};

export default function NotFound() {
  return (
    <section id="not-found" className="view">
      <div className="wrap coming-soon">
        <div className="coming-box">Steve can&apos;t be found.</div>
      </div>
    </section>
  );
}

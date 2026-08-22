import type { Metadata } from "next";
import BandShelf from "../components/BandShelf";

export const metadata: Metadata = {
  title: "Bands — Steve Fest II",
  description:
    "Every act on the Steve Fest II bill, with links to their music and merch.",
};

export default function Bands() {
  return (
    <section id="merch" className="view">
      <div className="wrap page-top">
        <h2 className="head">The bands</h2>
        <BandShelf />
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import BandShelf from "@/lib/components/BandShelf";
import GiveCta from "@/lib/components/GiveCta";

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
        <GiveCta />
      </div>
    </section>
  );
}

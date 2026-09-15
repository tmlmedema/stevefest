import type { Metadata } from "next";
import MerchBoardAlt from "../components/MerchBoardAlt";
import GiveCta from "../components/GiveCta";

/* An alternate visual direction for /merch, built from a layout mockup.
   Same rules as /merch: not in the nav, not indexed — direct link only. */
export const metadata: Metadata = {
  title: "Merch (alt) — Steve Fest II",
  description: "Alternate layout exploration for the merch board.",
  robots: { index: false, follow: false },
};

export default function MerchAlt() {
  return (
    <section id="merch-alt" className="view">
      <div className="wrap page-top">
        <MerchBoardAlt />
      </div>
      <GiveCta />
    </section>
  );
}

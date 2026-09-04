import type { Metadata } from "next";
import MerchBoard from "../components/MerchBoard";

/* Not in the nav — reachable only by direct link, like /photos used to be.
   robots.index is off on top of that so it doesn't turn up in search. */
export const metadata: Metadata = {
  title: "Merch — Steve Fest II",
  description: "Who just played, who's up next, and where to buy their merch.",
  robots: { index: false, follow: false },
};

export default function Merch() {
  return (
    <section id="merch" className="view">
      <div className="wrap page-top">
        <MerchBoard />
      </div>
    </section>
  );
}

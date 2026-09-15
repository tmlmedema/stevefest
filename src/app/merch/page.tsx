import type { Metadata } from "next";
import MerchBoard from "../components/MerchBoard";

export const metadata: Metadata = {
  title: "Merch — Steve Fest II",
  description: "Who just played, who's up next, and where to buy their merch.",
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

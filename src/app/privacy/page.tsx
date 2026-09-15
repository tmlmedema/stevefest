import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Steve Fest II",
  description: "The Steve Fest II privacy policy is coming soon.",
};

export default function Privacy() {
  return (
    <section id="privacy" className="view">
      <div className="wrap coming-soon">
        <div className="coming-box">
          Steve doesn&apos;t sell your data.
          <br />
          Steve barely understands data.
        </div>
      </div>
    </section>
  );
}

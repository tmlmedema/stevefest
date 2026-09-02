import { BANDS } from "../lib/data";

/*
 * The ask. The same panel closes the home, bands and schedule pages, so the
 * wording, the band count and the Givebutter link only have one place to
 * change when any of them move.
 */
export default function GiveCta() {
  return (
    <div className="sheet give">
      <span className="eyebrow">No cover, never has been</span>
      <h2 className="give-head">Keep Steve Fest free</h2>
      <p className="give-copy">
        Three days, three stages, {BANDS.length} bands, and not one dollar at the door.
        Donations are what keep it that way &mdash; chip in whatever you&apos;ve got.
      </p>
      <a
        className="give-btn"
        href="https://givebutter.com/stevefestii"
        target="_blank"
        rel="noopener noreferrer"
      >
        Feed a steve
      </a>
    </div>
  );
}

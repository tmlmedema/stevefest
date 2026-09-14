/* The sign-off, once the closing set of the last day is over. On the merch
   board everything it replaces — who just played, who's up next — is about a
   fest that's still running; on the schedule it sits under the day tabs, over
   a grid that's now a record of what happened rather than a plan. Same words
   in both places, so it only gets written once. */
export default function ConcludedPanel() {
  return (
    <section className="merch-section">
      <div className="sheet merch-concluded">
        <p className="merch-concluded-copy">
          Steve Fest has concluded. Thank you for participating in this
          extraordinary event. We look forward to seeing you all next year
          for&hellip;
        </p>
        <p className="merch-concluded-next">
          Steve Fest 3: Next time it&apos;s personal!
        </p>
      </div>
    </section>
  );
}

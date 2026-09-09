"use client";

import { DAYS } from "../../lib/data";

/* Printing one day sets a flag on <body> that the print rules read, so the
   other two sheets drop out of the run. It's cleared as soon as the dialog
   hands control back, whether it printed or got cancelled. */
function print(only: string | null) {
  if (only) document.body.dataset.printOnly = only;
  else delete document.body.dataset.printOnly;
  window.print();
  delete document.body.dataset.printOnly;
}

export default function PrintButton() {
  return (
    <div className="p-buttons">
      <button className="p-print" onClick={() => print(null)}>
        Print all three
      </button>
      {DAYS.map((d) => (
        <button
          key={d.label}
          className="p-print p-print-one"
          onClick={() => print(d.iso)}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}

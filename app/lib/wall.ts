import { WALL_OPENS, WALL_CLOSES } from "./data";

/*
 * Who may add to the photo wall, and when.
 *
 * Signed-in admins can always upload. Everyone else only during the window in
 * data.ts. Both the page and the upload route ask this same question, so the
 * button and the server can't disagree about the answer.
 */

export type WallState = {
  open: boolean;
  /* Why it's shut, for the page to explain. */
  reason: "open" | "too-early" | "too-late" | "admins-only";
  opensAt: Date | null;
};

const WHEN = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "America/Chicago",
});

export function publicWallState(now: Date = new Date()): WallState {
  const opens = WALL_OPENS ? new Date(WALL_OPENS) : null;
  const closes = WALL_CLOSES ? new Date(WALL_CLOSES) : null;

  if (!opens && !closes) {
    return { open: false, reason: "admins-only", opensAt: null };
  }
  if (opens && now < opens) {
    return { open: false, reason: "too-early", opensAt: opens };
  }
  if (closes && now > closes) {
    return { open: false, reason: "too-late", opensAt: null };
  }
  return { open: true, reason: "open", opensAt: null };
}

/* The one call both the page and the route make. `isAdmin` is passed in
   rather than looked up here, so this file stays free of auth imports and can
   be reasoned about — and tested — on its own. */
export function canUpload(isAdmin: boolean, now: Date = new Date()): boolean {
  return isAdmin || publicWallState(now).open;
}

/* What the page tells a visitor who can't upload right now. */
export function closedNotice(state: WallState): string {
  switch (state.reason) {
    case "too-early":
      return state.opensAt
        ? `The wall opens ${WHEN.format(state.opensAt)}. Check back then.`
        : "The wall isn't open yet. Check back soon.";
    case "too-late":
      return "The wall is closed for uploads. Thanks to everyone who posted.";
    default:
      return "The wall isn't taking uploads right now.";
  }
}

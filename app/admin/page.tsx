import { redirect } from "next/navigation";
import { list } from "@vercel/blob";
import { auth, isAdmin, signOut } from "@/auth";
import { allUploads, type Status } from "../lib/db";
import { review, reject } from "./actions";
import ConfirmButton from "./ConfirmButton";

export const dynamic = "force-dynamic";

type Item = {
  pathname: string;
  url: string;
  size: number;
  uploadedAt: Date;
  status: Status;
  reviewedBy: string | null;
};

/* Which half of the panel you're looking at. The two counters at the top are
   the switch, so the numbers and the tabs are the same thing rather than two
   controls that have to agree. */
type View = "waiting" | "wall";

/*
 * Blob storage says what exists; the ledger says what's allowed. Reconciling
 * the two means a photo that lost its row — the completion callback missed it,
 * say — still turns up here as pending rather than becoming invisible.
 */
async function getItems(): Promise<{ items: Item[]; failed: boolean }> {
  try {
    const [{ blobs }, ledger] = await Promise.all([
      list({ prefix: "wall/", token: process.env.BLOB_READ_WRITE_TOKEN }),
      allUploads(),
    ]);

    const verdicts = new Map(ledger.map((u) => [u.pathname, u]));

    const items = blobs
      .map((b) => {
        const row = verdicts.get(b.pathname);
        return {
          pathname: b.pathname,
          url: b.url,
          size: b.size,
          uploadedAt: new Date(b.uploadedAt),
          status: row?.status ?? ("pending" as Status),
          reviewedBy: row?.reviewedBy ?? null,
        };
      })
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

    return { items, failed: false };
  } catch (error) {
    console.error("Couldn't load the queue:", error);
    return { items: [], failed: true };
  }
}

function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const WHEN = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Chicago",
});

const REJECT_ASK =
  "Hey — are you sure you want to reject this photo?\n\n" +
  "It gets deleted for good: removed from the wall and erased from storage. " +
  "This cannot be undone.";

/* Deleting something already on the wall is the same button doing more damage,
   so say so. Taking it down first is the reversible way out. */
const DELETE_ASK =
  "Hey — this photo is on the wall right now.\n\n" +
  "Deleting erases it from storage for good and it cannot be undone. " +
  "To just get it off the wall, use Take down instead.";

function Verdict({ item }: { item: Item }) {
  /* Approving and unapproving are the same switch either way round. Deleting
     is a different thing entirely — it destroys the photo — so it gets its own
     action and the only confirmation on the page. */
  const live = item.status === "approved";

  const move: { to: Status; label: string; className: string } = live
    ? { to: "pending", label: "Take down", className: "btn-undo" }
    : { to: "approved", label: "Approve", className: "btn-approve" };

  return (
    <div className="verdict">
      <form action={review}>
        <input type="hidden" name="pathname" value={item.pathname} />
        <input type="hidden" name="url" value={item.url} />
        <input type="hidden" name="status" value={move.to} />
        <button type="submit" className={move.className}>
          {move.label}
        </button>
      </form>

      <form action={reject}>
        <input type="hidden" name="pathname" value={item.pathname} />
        <input type="hidden" name="url" value={item.url} />
        <ConfirmButton
          className="btn-reject"
          ask={live ? DELETE_ASK : REJECT_ASK}
        >
          {live ? "Delete" : "Reject"}
        </ConfirmButton>
      </form>
    </div>
  );
}

function Grid({ of }: { of: Item[] }) {
  return (
    <ul className="admin-list">
      {of.map((i) => (
        <li key={i.pathname}>
          <a href={i.url} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={i.url} alt="" loading="lazy" />
          </a>
          <div className="admin-meta">
            <b>{WHEN.format(i.uploadedAt)}</b>
            <span>{fileSize(i.size)}</span>
            {i.reviewedBy && <span className="admin-id">by {i.reviewedBy}</span>}
          </div>
          <Verdict item={i} />
        </li>
      ))}
    </ul>
  );
}

/* A counter you can press. Plain links, so the current tab is in the URL —
   a verdict posts back to the same address and lands you where you were,
   and an admin can bookmark or reload the half they were working on. */
function Tab({
  view,
  current,
  label,
  count,
}: {
  view: View;
  current: View;
  label: string;
  count: number;
}) {
  const on = view === current;

  return (
    <a
      href={view === "waiting" ? "/admin" : `/admin?view=${view}`}
      className={on ? "stat is-on" : "stat"}
      aria-current={on ? "page" : undefined}
    >
      <span className="stat-label">{label}</span>
      <span className="stat-count">{count}</span>
    </a>
  );
}

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const session = await auth();

  /* The proxy already turned everyone else away; this is the backstop for
     any request that somehow skips it. */
  if (!isAdmin(session?.user?.email)) redirect("/admin/signin");

  const { view: asked } = await searchParams;
  const view: View = asked === "wall" ? "wall" : "waiting";

  const { items, failed } = await getItems();

  const pending = items.filter((i) => i.status === "pending");
  const approved = items.filter((i) => i.status === "approved");
  const showing = view === "wall" ? approved : pending;

  return (
    <>
      <div className="admin-bar">
        <div>
          <p className="eyebrow">Admin</p>
          <h2 className="head">Photo Wall</h2>
        </div>
        <div className="admin-who">
          <span>{session?.user?.email}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/signin" });
            }}
          >
            <button type="submit" className="btn-signout">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Deliberately not a <nav>: the site's header nav styles every <nav a>
          on the page, and these are counters first. */}
      <div className="admin-stats">
        <Tab
          view="waiting"
          current={view}
          label="Waiting"
          count={pending.length}
        />
        <Tab
          view="wall"
          current={view}
          label="On the wall"
          count={approved.length}
        />
      </div>

      {failed && (
        <p className="admin-note">
          Couldn&apos;t load the queue. Check <code>BLOB_READ_WRITE_TOKEN</code>{" "}
          and <code>TURSO_DATABASE_URL</code>.
        </p>
      )}

      {!failed && items.length === 0 && (
        <p className="admin-note">
          Nothing uploaded yet. Whatever people post to{" "}
          <a href="/photos">the photo wall</a> arrives here for review before
          anyone else sees it.
        </p>
      )}

      {/* Nothing is ever out of reach: a photo is in one tab or the other, and
          both halves offer the way back out. An approval made by mistake is
          undone from the wall side, not hunted for. */}
      {!failed && items.length > 0 && showing.length > 0 && (
        <section className="queue">
          <h3>
            {view === "wall" ? (
              <>
                On the wall <span>Live at /photos</span>
              </>
            ) : (
              <>
                Waiting on you <span>Nobody can see these yet</span>
              </>
            )}
          </h3>
          <Grid of={showing} />
        </section>
      )}

      {!failed && items.length > 0 && showing.length === 0 && (
        <p className="admin-note admin-clear">
          {view === "wall"
            ? "Nothing on the wall yet — approve a photo and it shows up here."
            : "All caught up — nothing waiting on you."}
        </p>
      )}
    </>
  );
}

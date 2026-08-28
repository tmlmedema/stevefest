import { redirect } from "next/navigation";
import { list } from "@vercel/blob";
import { auth, isAdmin, signOut } from "@/auth";
import { allUploads, type Status } from "../lib/db";
import { review } from "./actions";

export const dynamic = "force-dynamic";

type Item = {
  pathname: string;
  url: string;
  size: number;
  uploadedAt: Date;
  status: Status;
  reviewedBy: string | null;
};

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

function Verdict({ item }: { item: Item }) {
  /* Whatever the photo isn't right now is what the buttons offer. */
  const all: { to: Status; label: string; className: string }[] = [
    { to: "approved", label: "Approve", className: "btn-approve" },
    { to: "rejected", label: "Reject", className: "btn-reject" },
    { to: "pending", label: "Undo", className: "btn-undo" },
  ];
  const options = all.filter((o) => o.to !== item.status);

  return (
    <div className="verdict">
      {options.map((o) => (
        <form action={review} key={o.to}>
          <input type="hidden" name="pathname" value={item.pathname} />
          <input type="hidden" name="url" value={item.url} />
          <input type="hidden" name="status" value={o.to} />
          <button type="submit" className={o.className}>
            {o.label}
          </button>
        </form>
      ))}
    </div>
  );
}

export default async function Admin() {
  const session = await auth();

  /* The proxy already turned everyone else away; this is the backstop for
     any request that somehow skips it. */
  if (!isAdmin(session?.user?.email)) redirect("/admin/signin");

  const { items, failed } = await getItems();

  const pending = items.filter((i) => i.status === "pending");
  const approved = items.filter((i) => i.status === "approved");
  const rejected = items.filter((i) => i.status === "rejected");

  const groups: { title: string; note: string; of: Item[] }[] = [
    {
      title: "Waiting on you",
      note: "Nobody can see these yet.",
      of: pending,
    },
    { title: "On the wall", note: "Live at /photos.", of: approved },
    { title: "Turned down", note: "Hidden. Still in storage.", of: rejected },
  ];

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

      <dl className="admin-stats">
        <div>
          <dt>Waiting</dt>
          <dd>{pending.length}</dd>
        </div>
        <div>
          <dt>On the wall</dt>
          <dd>{approved.length}</dd>
        </div>
        <div>
          <dt>Turned down</dt>
          <dd>{rejected.length}</dd>
        </div>
      </dl>

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

      {groups.map(
        (g) =>
          g.of.length > 0 && (
            <section className="queue" key={g.title}>
              <h3>
                {g.title} <span>{g.note}</span>
              </h3>
              <ul className="admin-list">
                {g.of.map((i) => (
                  <li key={i.pathname}>
                    <a href={i.url} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={i.url} alt="" loading="lazy" />
                    </a>
                    <div className="admin-meta">
                      <b>{WHEN.format(i.uploadedAt)}</b>
                      <span>{fileSize(i.size)}</span>
                      {i.reviewedBy && (
                        <span className="admin-id">by {i.reviewedBy}</span>
                      )}
                    </div>
                    <Verdict item={i} />
                  </li>
                ))}
              </ul>
            </section>
          )
      )}
    </>
  );
}

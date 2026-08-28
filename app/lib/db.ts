import { createClient, type Client, type Row } from "@libsql/client";

/*
 * The approval ledger.
 *
 * Blob storage holds the photos; this holds the verdict on each one. A photo
 * is on the public wall only if there's a row here saying "approved", so the
 * default for anything new is that nobody sees it but the admins.
 *
 * Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to point at Turso. With neither
 * set it falls back to a SQLite file in the project, which is the same engine
 * and the same client — handy for working offline, and not what production
 * should ever run on.
 */

export type Status = "pending" | "approved";

export type Upload = {
  pathname: string;
  url: string;
  status: Status;
  uploadedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

let client: Client | null = null;
let ready: Promise<void> | null = null;

function connect(): Client {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  client = url
    ? createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
    : createClient({ url: "file:wall.db" });

  return client;
}

/* Runs once per process, not once per query — the promise is what's cached,
   so concurrent callers all wait on the same CREATE rather than racing. */
function schema(): Promise<void> {
  if (ready) return ready;

  ready = connect()
    .execute(
      `CREATE TABLE IF NOT EXISTS uploads (
         pathname    TEXT PRIMARY KEY,
         url         TEXT NOT NULL,
         status      TEXT NOT NULL DEFAULT 'pending',
         uploaded_at TEXT NOT NULL,
         reviewed_at TEXT,
         reviewed_by TEXT
       )`
    )
    .then(() => undefined);

  return ready;
}

async function db(): Promise<Client> {
  await schema();
  return connect();
}

function toUpload(row: Row): Upload {
  return {
    pathname: String(row.pathname),
    url: String(row.url),
    status: String(row.status) as Status,
    uploadedAt: String(row.uploaded_at),
    reviewedAt: row.reviewed_at === null ? null : String(row.reviewed_at),
    reviewedBy: row.reviewed_by === null ? null : String(row.reviewed_by),
  };
}

/* Called when a photo lands. Both the upload route and Vercel's completion
   callback can reach here for the same file, so it has to be safe to repeat —
   and it must never quietly reset a verdict an admin already gave. */
export async function recordUpload(
  pathname: string,
  url: string,
  status: Status = "pending"
): Promise<void> {
  const c = await db();
  await c.execute({
    sql: `INSERT INTO uploads (pathname, url, status, uploaded_at)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(pathname) DO NOTHING`,
    args: [pathname, url, status, new Date().toISOString()],
  });
}

export async function setStatus(
  pathname: string,
  status: Status,
  reviewer: string
): Promise<void> {
  const c = await db();
  await c.execute({
    sql: `UPDATE uploads
          SET status = ?, reviewed_at = ?, reviewed_by = ?
          WHERE pathname = ?`,
    args: [status, new Date().toISOString(), reviewer, pathname],
  });
}

/* What the public wall shows. */
export async function approvedPathnames(): Promise<Set<string>> {
  const c = await db();
  const { rows } = await c.execute(
    `SELECT pathname FROM uploads WHERE status = 'approved'`
  );
  return new Set(rows.map((r) => String(r.pathname)));
}

/* What the admin reviews, newest first. */
export async function allUploads(): Promise<Upload[]> {
  const c = await db();
  const { rows } = await c.execute(
    `SELECT * FROM uploads ORDER BY uploaded_at DESC`
  );
  return rows.map(toUpload);
}

export async function counts(): Promise<Record<Status, number>> {
  const c = await db();
  const { rows } = await c.execute(
    `SELECT status, COUNT(*) AS n FROM uploads GROUP BY status`
  );

  const out: Record<Status, number> = { pending: 0, approved: 0 };
  for (const r of rows) {
    const s = String(r.status) as Status;
    if (s in out) out[s] = Number(r.n);
  }
  return out;
}

/* Rejecting is a deletion, not a state — the row goes, and the caller deletes
   the file from Blob storage too. Nothing is left to undo from. */
export async function removeUpload(pathname: string): Promise<void> {
  const c = await db();
  await c.execute({
    sql: `DELETE FROM uploads WHERE pathname = ?`,
    args: [pathname],
  });
}

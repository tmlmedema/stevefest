import { redirect } from "next/navigation";
import { list } from "@vercel/blob";
import { auth, isAdmin, signOut } from "@/auth";

export const dynamic = "force-dynamic";

type Upload = {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
};

async function getUploads(): Promise<{ uploads: Upload[]; failed: boolean }> {
  try {
    /* Same explicit token as the public wall: `vercel env pull` also drops a
       VERCEL_OIDC_TOKEN into .env.local, and the SDK prefers it over the
       read/write token — then fails, because OIDC is off for development. */
    const { blobs } = await list({
      prefix: "wall/",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const uploads = [...blobs]
      .map((b) => ({
        url: b.url,
        pathname: b.pathname,
        size: b.size,
        uploadedAt: new Date(b.uploadedAt),
      }))
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    return { uploads, failed: false };
  } catch (error) {
    console.error("Couldn't list uploads:", error);
    return { uploads: [], failed: true };
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

export default async function Admin() {
  const session = await auth();

  /* Middleware already turned away everyone else; this is the backstop for
     any request that somehow skips it. */
  if (!isAdmin(session?.user?.email)) redirect("/admin/signin");

  const { uploads, failed } = await getUploads();
  const totalSize = uploads.reduce((sum, u) => sum + u.size, 0);

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
          <dt>Uploads</dt>
          <dd>{uploads.length}</dd>
        </div>
        <div>
          <dt>Storage</dt>
          <dd>{fileSize(totalSize)}</dd>
        </div>
        <div>
          <dt>Newest</dt>
          <dd className="small">
            {uploads[0] ? WHEN.format(uploads[0].uploadedAt) : "—"}
          </dd>
        </div>
      </dl>

      {failed && (
        <p className="admin-note">
          Couldn&apos;t reach Blob storage. Check{" "}
          <code>BLOB_READ_WRITE_TOKEN</code>.
        </p>
      )}

      {!failed && uploads.length === 0 && (
        <p className="admin-note">
          Nothing uploaded yet. Whatever people post to{" "}
          <a href="/photos">the photo wall</a> shows up here.
        </p>
      )}

      {uploads.length > 0 && (
        <ul className="admin-list">
          {uploads.map((u) => (
            <li key={u.pathname}>
              <a href={u.url} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.url} alt="" loading="lazy" />
              </a>
              <div className="admin-meta">
                {/* PhotoGrid drops the uploader's filename on purpose, so
                    there's nothing to show but when it landed. */}
                <b>{WHEN.format(u.uploadedAt)}</b>
                <span>{fileSize(u.size)}</span>
                <span className="admin-id">{u.pathname.replace(/^wall\//, "")}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

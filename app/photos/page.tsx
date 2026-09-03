import type { Metadata } from "next";
import { list } from "@vercel/blob";
import PhotoGrid from "../components/PhotoGrid";
import { auth, isAdmin } from "@/auth";
import { canUpload, closedNotice, publicWallState } from "../lib/wall";
import { approvedPathnames } from "../lib/db";

export const metadata: Metadata = {
  title: "Steve Was There. Were You? — Steve Fest II",
  description: "Share your Steve Fest II photos.",
};

/* Seeded example so the wall isn't empty on day one. */
const EXAMPLE_PHOTO = { url: "/photo-example.jpg", pathname: "example" };

async function getPhotos() {
  try {
    /* Passed explicitly on purpose: `vercel env pull` also drops a
       VERCEL_OIDC_TOKEN into .env.local, and the SDK prefers it over the
       read/write token — then fails, because OIDC is off for development. */
    const [{ blobs }, approved] = await Promise.all([
      list({ prefix: "wall/", token: process.env.BLOB_READ_WRITE_TOKEN }),
      approvedPathnames(),
    ]);

    /* The wall shows what an admin has approved and nothing else. A photo
       with no verdict yet isn't public, so a file sitting in Blob storage
       is not on its own enough to get it onto this page. */
    const sorted = blobs
      .filter((b) => approved.has(b.pathname))
      .sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

    return [EXAMPLE_PHOTO, ...sorted];
  } catch (error) {
    /* Don't take the whole page down over this, but don't hide it either —
       an empty wall and a broken token look identical from the outside.
       Failing closed matters here: if the ledger is unreachable we show
       nothing rather than falling back to showing everything. */
    console.error("Couldn't list photos:", error);
    return [EXAMPLE_PHOTO];
  }
}

export default async function Photos() {
  const session = await auth();
  const admin = isAdmin(session?.user?.email);

  /* Worked out here rather than in the browser: the window is checked against
     the server's clock, so a visitor can't open the wall early by changing
     their own. The route checks it again anyway. */
  const uploadsOpen = canUpload(admin);
  const notice = uploadsOpen ? null : closedNotice(publicWallState());

  const photos = await getPhotos();

  return (
    <section id="photos" className="view">
      <div className="wrap page-top">
        <h2 className="head">Steve Was There. Were You?</h2>
        <p className="lede">
          {uploadsOpen
            ? "Got shots from the fest? Drop one below and we'll add it to the pile."
            : "Shots from the fest, all in one pile."}
        </p>

        <PhotoGrid
          photos={photos}
          canUpload={uploadsOpen}
          notice={notice}
          /* Admins get in outside the window; say so, so an admin doesn't
             assume the wall is open to everyone when it isn't. */
          adminOverride={admin && !publicWallState().open}
        />
      </div>
    </section>
  );
}

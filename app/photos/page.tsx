import type { Metadata } from "next";
import { list } from "@vercel/blob";
import PhotoGrid from "../components/PhotoGrid";

export const metadata: Metadata = {
  title: "Steve Was There. Were You? — Steve Fest II",
  description: "Share your Steve Fest II photos.",
};

/* Seeded example so the wall isn't empty on day one. */
const EXAMPLE_PHOTO = { url: "/photo-example.png", pathname: "example" };

async function getPhotos() {
  try {
    /* Passed explicitly on purpose: `vercel env pull` also drops a
       VERCEL_OIDC_TOKEN into .env.local, and the SDK prefers it over the
       read/write token — then fails, because OIDC is off for development. */
    const { blobs } = await list({
      prefix: "wall/",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const sorted = [...blobs].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    return [EXAMPLE_PHOTO, ...sorted];
  } catch (error) {
    /* Don't take the whole page down over this, but don't hide it either —
       an empty wall and a broken token look identical from the outside. */
    console.error("Couldn't list photos:", error);
    return [EXAMPLE_PHOTO];
  }
}

export default async function Photos() {
  const photos = await getPhotos();

  return (
    <section id="photos" className="view">
      <div className="wrap page-top">
        <h2 className="head">Steve Was There. Were You?</h2>
        <p className="lede">
          Got shots from the fest? Drop one below and we&apos;ll add it
          to the pile.
        </p>

        <PhotoGrid photos={photos} />
      </div>
    </section>
  );
}

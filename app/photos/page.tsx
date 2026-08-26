import type { Metadata } from "next";
import { list } from "@vercel/blob";
import PhotoUpload from "../components/PhotoUpload";
import PhotoGrid from "../components/PhotoGrid";

export const metadata: Metadata = {
  title: "Steve Was There. Were You? — Steve Fest II",
  description: "Share your Steve Fest II photos.",
};

async function getPhotos() {
  try {
    const { blobs } = await list({ prefix: "photos/" });
    return [...blobs].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  } catch {
    return [];
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

        <PhotoUpload />
        <PhotoGrid photos={photos} />
      </div>
    </section>
  );
}

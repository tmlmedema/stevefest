/*
 * Shrinks a photo in the browser before it ever leaves the device.
 *
 * Most of these come off phones: 3–12 MB, 4000px wide, far more than a
 * polaroid tile on a photo wall will ever show. We redraw them onto a canvas
 * at a sane size and re-encode as JPEG, which typically lands around 10x
 * smaller. Re-encoding also drops the EXIF block, so the GPS coordinates
 * baked into a phone photo don't end up on a public URL.
 */

/* Refuse to even decode something this big — it's not a phone photo. */
export const MAX_INPUT_BYTES = 40 * 1024 * 1024;

/* Longest edge after scaling. Comfortably sharp in the lightbox on retina. */
const MAX_DIMENSION = 2400;

/* What we aim for. We stop stepping down quality once we're under this. */
const TARGET_BYTES = 1.5 * 1024 * 1024;

const QUALITY_STEPS = [0.82, 0.72, 0.62, 0.5];

/* Safari only learned the options bag late; fall back if it complains. */
async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await createImageBitmap(file);
  }
}

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
}

/* IMG_1234.HEIC is a JPEG once we're done with it — say so. */
function jpegName(name: string): string {
  const stem = name.replace(/\.[^./\\]+$/, "") || "photo";
  return `${stem}.jpg`;
}

export async function compressImage(file: File): Promise<File> {
  const bitmap = await decode(file);

  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height)
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Couldn't process that image.");
  }

  /* JPEG has no alpha channel; without this, transparent PNGs go black. */
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let best: Blob | null = null;
  for (const quality of QUALITY_STEPS) {
    const blob = await encode(canvas, quality);
    if (!blob) continue;
    best = blob;
    if (blob.size <= TARGET_BYTES) break;
  }

  if (!best) throw new Error("Couldn't process that image.");

  return new File([best], jpegName(file.name), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

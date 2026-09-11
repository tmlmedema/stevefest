/*
 * Shrinks a photo in the browser before it ever leaves the device.
 *
 * Most of these come off phones: 3–12 MB, 4000px wide, far more than a
 * polaroid tile on a photo wall will ever show. We redraw them onto a canvas
 * at a sane size and re-encode as JPEG, which typically lands around 30x
 * smaller. Re-encoding also drops the EXIF block, so the GPS coordinates
 * baked into a phone photo don't end up on a public URL.
 */

/* Refuse to even decode something this big — it's not a phone photo. */
export const MAX_INPUT_BYTES = 40 * 1024 * 1024;

/*
 * What the wall actually needs from a stored photo, and so what sets the
 * ceiling here: the lightbox fits it to the viewport, and the download is a
 * fixed 1080px square whose photo window is under 1050px across. 1600 on the
 * long edge covers both with room to spare — past that we'd be storing detail
 * nothing on the site ever shows.
 */
const DIMENSION_STEPS = [1600, 1280, 1024];

/* What we aim for. We stop stepping down once we're under this. */
const TARGET_BYTES = 380 * 1024;

const QUALITY_STEPS = [0.78, 0.7, 0.62, 0.54, 0.46];

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

function draw(bitmap: ImageBitmap, maxDimension: number): HTMLCanvasElement {
  const scale = Math.min(
    1,
    maxDimension / Math.max(bitmap.width, bitmap.height)
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process that image.");

  /* Downscaling in one jump drops pixels rather than averaging them, which
     stipples the fine stuff — a crowd, a hi-hat, a brick wall. The smoothing
     hint is what makes the browser resample properly instead. */
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  /* JPEG has no alpha channel; without this, transparent PNGs go black. */
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);

  return canvas;
}

export async function compressImage(file: File): Promise<File> {
  const bitmap = await decode(file);

  /*
   * Two ladders, because quality alone can't carry it. A busy, grainy shot —
   * a dark room, a lot of texture — can still sit well over the target at a
   * quality low enough to look chewed, and at that point fewer pixels read
   * better than worse ones. So: walk the quality steps at full size, and only
   * if none of them land under the target do we redraw smaller and try again.
   *
   * Whatever came out smallest is kept as we go, so a photo that never gets
   * under the target still uploads at the best we managed rather than failing.
   */
  let best: Blob | null = null;
  let done = false;
  let drawnAt = Infinity;

  try {
    for (const dimension of DIMENSION_STEPS) {
      /* A photo that was already small never grows to meet a rung, so a rung
         above its own size would redraw the identical pixels and re-encode
         them for nothing. */
      const longest = Math.min(dimension, Math.max(bitmap.width, bitmap.height));
      if (longest >= drawnAt) continue;
      drawnAt = longest;

      const canvas = draw(bitmap, dimension);

      for (const quality of QUALITY_STEPS) {
        const blob = await encode(canvas, quality);
        if (!blob) continue;
        if (!best || blob.size < best.size) best = blob;
        if (blob.size <= TARGET_BYTES) {
          done = true;
          break;
        }
      }

      if (done) break;
    }
  } finally {
    bitmap.close();
  }

  if (!best) throw new Error("Couldn't process that image.");

  return new File([best], jpegName(file.name), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

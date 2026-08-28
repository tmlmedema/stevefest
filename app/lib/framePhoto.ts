/*
 * Redraws a photo inside the polaroid frame so it can be saved as one image.
 *
 * The lightbox frame is CSS, which the browser won't hand us as a file, so the
 * frame is painted again here on a canvas. The polaroid is built at the photo's
 * full resolution, then scaled to 1080px wide — Instagram's native width — with
 * the height left to follow the polaroid's own proportions. The saved image is
 * the polaroid and nothing else: no backdrop, edge to edge.
 *
 * One deliberate difference from the CSS: on screen the border and bottom band
 * are fixed pixel sizes, so their proportions shift with the photo's shape.
 * Here they scale with the photo's width, which keeps a downloaded portrait and
 * a downloaded landscape looking like the same object.
 */

const INK = "#14100F";
const PAPER = "#FFFFFF";
/* Instagram's native upload width; height follows the polaroid's shape. */
const OUTPUT_W = 1080;

const BORDER_RATIO = 0.03; /* frame edge, as a fraction of photo width */
const BAND_RATIO = 0.17; /* deep bottom band, likewise */
const TILT = (-1.5 * Math.PI) / 180; /* matches the nav and the lightbox */

const WORDMARK = "/assets/wordmark-nav.png";

function load(src: string, cors: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    /* Blob storage sends `access-control-allow-origin: *`; without asking for
       CORS the canvas would taint and toBlob would throw on read. */
    if (cors) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Couldn't load that image."));
    img.src = src;
  });
}

export async function framePhoto(src: string): Promise<Blob> {
  const [photo, mark] = await Promise.all([
    load(src, !src.startsWith("/")),
    load(WORDMARK, false),
  ]);

  const w = photo.naturalWidth;
  const h = photo.naturalHeight;
  const border = Math.round(w * BORDER_RATIO);
  const band = Math.round(w * BAND_RATIO);

  /* The polaroid itself, at the photo's own resolution. */
  const frame = document.createElement("canvas");
  frame.width = w + border * 2;
  frame.height = h + border + band;

  const ctx = frame.getContext("2d");
  if (!ctx) throw new Error("Couldn't prepare that image.");

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, frame.width, frame.height);
  ctx.drawImage(photo, border, border, w, h);

  /* Wordmark on its black block, bottom-left, centred in the band. */
  const markH = Math.round(band * 0.34);
  const markW = Math.round(markH * (mark.naturalWidth / mark.naturalHeight));
  const padX = Math.round(markH * 0.3);
  const padY = Math.round(markH * 0.24);
  const blockW = markW + padX * 2;
  const blockH = markH + padY * 2;
  const blockX = border;
  const blockY = border + h + Math.round((band - blockH) / 2);

  ctx.save();
  ctx.translate(blockX + blockW / 2, blockY + blockH / 2);
  ctx.rotate(TILT);
  ctx.fillStyle = INK;
  ctx.fillRect(-blockW / 2, -blockH / 2, blockW, blockH);
  ctx.drawImage(mark, -markW / 2, -markH / 2, markW, markH);
  ctx.restore();

  /* Resample the whole polaroid down to the output width. */
  const post = document.createElement("canvas");
  post.width = OUTPUT_W;
  post.height = Math.round((frame.height / frame.width) * OUTPUT_W);

  const pctx = post.getContext("2d");
  if (!pctx) throw new Error("Couldn't prepare that image.");

  pctx.imageSmoothingEnabled = true;
  pctx.imageSmoothingQuality = "high";
  pctx.drawImage(frame, 0, 0, post.width, post.height);

  return new Promise((resolve, reject) =>
    post.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Couldn't prepare that image.")),
      "image/jpeg",
      0.92
    )
  );
}

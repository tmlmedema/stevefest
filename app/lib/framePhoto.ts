/*
 * Redraws a photo inside the polaroid frame so it can be saved as one image.
 *
 * The lightbox frame is CSS, which the browser won't hand us as a file, so the
 * frame is painted again here on a canvas. The polaroid is built at the photo's
 * full resolution, then dropped whole onto a 1080x1080 board — Instagram's
 * square — so a saved photo posts without the crop tool touching it.
 *
 * The polaroid is fitted rather than cropped: whatever shape the photo is, all
 * of it survives, and the grape board takes up the slack down the sides of a
 * portrait or above and below a landscape.
 *
 * One deliberate difference from the CSS: on screen the border and bottom band
 * are fixed pixel sizes, so their proportions shift with the photo's shape.
 * Here they scale with the photo's width, which keeps a downloaded portrait and
 * a downloaded landscape looking like the same object.
 */

const INK = "#14100F";
const PAPER = "#FFFFFF";
/* The board behind the polaroid — the site's own deep grape, so a saved
   photo still reads as coming from here. */
const BOARD = "#280E2F";
/* Instagram's square, at its native upload width. */
const OUTPUT = 1080;
/* Air left around the polaroid, as a fraction of the board's side. Enough
   that the paper never runs into the edge of a feed post. */
const MARGIN_RATIO = 0.05;

const BORDER_RATIO = 0.03; /* frame edge, as a fraction of photo width */
const BAND_RATIO = 0.17; /* deep bottom band, likewise */
const TILT = (-1.5 * Math.PI) / 180; /* matches the nav and the lightbox */

const WORDMARK = "/assets/wordmark-nav.png";

/* Stamped bottom-right, opposite the wordmark. Just the year for now — a
   fuller date can replace it here without touching the drawing below. */
const STAMP = "2026";

/* Canvas needs a real family name, and --display is a stack fronted by the
   hashed name next/font generates per build. Read it back off a probe rather
   than hard-coding this build's hash. */
async function displayFont(size: number): Promise<string> {
  const probe = document.createElement("span");
  probe.style.cssText =
    "position:absolute; visibility:hidden; font-family:var(--display)";
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily;
  probe.remove();

  const font = `900 ${size}px ${family}`;
  /* Canvas doesn't wait on webfonts — it silently draws in whatever's
     already there — so the stamp would come out in Impact on a cold load. */
  try {
    await document.fonts.load(font);
  } catch {
    /* Not worth failing a download over; it falls down the stack instead. */
  }
  return font;
}

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

  /* Year stamp, bottom-right. Centred on the band's mid-line, which is the
     wordmark's centre too, so the pair sit level however tall the band is. */
  const bandMidY = border + h + band / 2;
  const stampSize = Math.round(band * 0.3);
  ctx.font = await displayFont(stampSize);
  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  const metrics = ctx.measureText(STAMP);
  /* Centre the glyphs by their painted bounds, not the em box: digits have
     no descender, so a "middle" baseline would hang the stamp low. */
  const ascent = metrics.actualBoundingBoxAscent || stampSize * 0.72;
  const descent = metrics.actualBoundingBoxDescent || 0;

  ctx.save();
  ctx.translate(frame.width - border - metrics.width / 2, bandMidY);
  ctx.rotate(TILT);
  ctx.fillText(STAMP, 0, (ascent - descent) / 2);
  ctx.restore();

  /* Sit the finished polaroid on the square board, scaled to whichever of
     its sides runs out of room first and centred on both axes. */
  const post = document.createElement("canvas");
  post.width = OUTPUT;
  post.height = OUTPUT;

  const pctx = post.getContext("2d");
  if (!pctx) throw new Error("Couldn't prepare that image.");

  pctx.fillStyle = BOARD;
  pctx.fillRect(0, 0, OUTPUT, OUTPUT);

  const room = OUTPUT * (1 - MARGIN_RATIO * 2);
  const scale = Math.min(room / frame.width, room / frame.height);
  const drawW = Math.round(frame.width * scale);
  const drawH = Math.round(frame.height * scale);
  const drawX = Math.round((OUTPUT - drawW) / 2);
  const drawY = Math.round((OUTPUT - drawH) / 2);

  pctx.imageSmoothingEnabled = true;
  pctx.imageSmoothingQuality = "high";
  /* The same lift the lightbox gives the frame, so the paper reads as an
     object on the board rather than a white rectangle painted on it. */
  pctx.save();
  pctx.shadowColor = "rgba(0,0,0,.55)";
  pctx.shadowBlur = Math.round(OUTPUT * 0.03);
  pctx.shadowOffsetY = Math.round(OUTPUT * 0.012);
  pctx.drawImage(frame, drawX, drawY, drawW, drawH);
  pctx.restore();

  return new Promise((resolve, reject) =>
    post.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Couldn't prepare that image.")),
      "image/jpeg",
      0.92
    )
  );
}

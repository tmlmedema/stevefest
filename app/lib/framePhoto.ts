/*
 * Redraws a photo inside the polaroid frame so it can be saved as one image.
 *
 * The lightbox frame is CSS, which the browser won't hand us as a file, so the
 * frame is painted again here on a canvas. The output is a 1080x1080 square —
 * Instagram's — and the polaroid fills the whole of it, edge to edge, with no
 * board behind it. What you save is the paper and nothing else.
 *
 * A polaroid is taller than it is wide, so a square one can't have a square
 * window: once the border and the deep bottom band are taken off, what's left
 * for the photo is landscape, about 1.16:1. The photo is therefore covered
 * into that window — scaled to fill and centre-cropped — rather than fitted.
 * A portrait loses its top and bottom to do it; that's the price of the square
 * having no board to absorb the difference.
 *
 * One deliberate difference from the CSS: on screen the border and bottom band
 * are fixed pixel sizes, so their proportions shift with the photo's shape.
 * Here they're struck off the square, so every download is the same object
 * whatever went into it.
 */

const INK = "#14100F";
const PAPER = "#FFFFFF";
/* Instagram's square, at its native upload width. The polaroid is this size —
   there's nothing behind it. */
const OUTPUT = 1080;

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

  /* Work back from the square: the border is a fraction of the window's
     width, and the window is what's left of the square once both borders are
     off it — so the ratio has to be solved for rather than multiplied out. */
  const border = Math.round((OUTPUT * BORDER_RATIO) / (1 + BORDER_RATIO * 2));
  const w = OUTPUT - border * 2;
  const band = Math.round(w * BAND_RATIO);
  /* What's left for the photo after the border above and the band below. */
  const h = OUTPUT - border - band;

  const frame = document.createElement("canvas");
  frame.width = OUTPUT;
  frame.height = OUTPUT;

  const ctx = frame.getContext("2d");
  if (!ctx) throw new Error("Couldn't prepare that image.");

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, OUTPUT, OUTPUT);

  /* Cover: scale to fill the window on whichever axis is short, then take the
     middle of the other one. Nothing is left blank inside the frame. */
  const crop = Math.min(photo.naturalWidth / w, photo.naturalHeight / h);
  const cropW = w * crop;
  const cropH = h * crop;
  ctx.drawImage(
    photo,
    (photo.naturalWidth - cropW) / 2,
    (photo.naturalHeight - cropH) / 2,
    cropW,
    cropH,
    border,
    border,
    w,
    h
  );

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

  /* No board, so no drop shadow either — there'd be nothing for it to fall
     on. The polaroid is the whole image. */
  return new Promise((resolve, reject) =>
    frame.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Couldn't prepare that image.")),
      "image/jpeg",
      0.92
    )
  );
}

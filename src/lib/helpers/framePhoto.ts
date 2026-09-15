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
 *
 * The band carries the wordmark at one end and the year at the other, and a
 * photographer's credit between them when the shot has one.
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

/* Sits above the photographer's name, on its own line. */
const CREDIT_LABEL = "Photo Cred:";

/* Canvas needs a real family name, and --display is a stack fronted by the
   hashed name next/font generates per build. Read it back off a probe rather
   than hard-coding this build's hash.

   Looked up once and then reused at whatever size each line wants: the size
   in a load() request doesn't change which file is fetched, and the credit
   measures itself at several sizes before it settles on one. */
async function displayFamily(): Promise<string> {
  const probe = document.createElement("span");
  probe.style.cssText =
    "position:absolute; visibility:hidden; font-family:var(--display)";
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily;
  probe.remove();

  /* Canvas doesn't wait on webfonts — it silently draws in whatever's
     already there — so the band would come out in Impact on a cold load. */
  try {
    await document.fonts.load(`900 100px ${family}`);
  } catch {
    /* Not worth failing a download over; it falls down the stack instead. */
  }
  return family;
}

const displayFont = (size: number, family: string) =>
  `900 ${size}px ${family}`;

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

export async function framePhoto(
  src: string,
  /* The photographer's name, when the shot was uploaded on a code. Nothing is
     drawn in the middle of the band without one. */
  credit?: string | null
): Promise<Blob> {
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
  const family = await displayFamily();
  ctx.font = displayFont(stampSize, family);
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

  /* The credit, in what's left of the band between the wordmark and the year.
     Drawn last because it needs both of their edges to know where the gap is
     and how wide it runs. */
  if (credit) {
    const gutter = Math.round(band * 0.12);
    const from = blockX + blockW + gutter;
    const to = frame.width - border - metrics.width - gutter;
    const midX = (from + to) / 2;
    const room = to - from;

    let labelSize = Math.round(band * 0.16);
    let nameSize = Math.round(band * 0.22);

    /* A long name would otherwise run under the year, so the two lines shrink
       together — keeping the label smaller than the name it introduces —
       until the wider of them fits the gap. */
    const overrun = () => {
      ctx.font = displayFont(labelSize, family);
      const label = ctx.measureText(CREDIT_LABEL).width;
      ctx.font = displayFont(nameSize, family);
      return Math.max(label, ctx.measureText(credit).width) > room;
    };
    while (labelSize > band * 0.08 && overrun()) {
      labelSize -= 1;
      nameSize -= 1;
    }

    ctx.font = displayFont(labelSize, family);
    const label = ctx.measureText(CREDIT_LABEL);
    const labelAscent = label.actualBoundingBoxAscent || labelSize * 0.72;
    const labelDescent = label.actualBoundingBoxDescent || 0;

    ctx.font = displayFont(nameSize, family);
    const name = ctx.measureText(credit);
    const nameAscent = name.actualBoundingBoxAscent || nameSize * 0.72;
    const nameDescent = name.actualBoundingBoxDescent || 0;

    /* Centre the pair on the same mid-line the wordmark and year sit on, by
       their painted heights rather than their em boxes — the same reason the
       year is placed that way. */
    const lineGap = Math.round(band * 0.05);
    const total =
      labelAscent + labelDescent + lineGap + nameAscent + nameDescent;

    ctx.save();
    ctx.translate(midX, bandMidY);
    ctx.rotate(TILT);
    ctx.font = displayFont(labelSize, family);
    ctx.fillText(CREDIT_LABEL, 0, -total / 2 + labelAscent);
    ctx.font = displayFont(nameSize, family);
    ctx.fillText(
      credit,
      0,
      -total / 2 + labelAscent + labelDescent + lineGap + nameAscent
    );
    ctx.restore();
  }

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

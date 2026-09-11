/*
 * One-off pass that re-compresses photos already in Blob storage.
 *
 * app/lib/compressImage.ts shrinks photos in the browser on the way in, but
 * it only ever sees new uploads. Anything that landed under an older, laxer
 * setting stays as it was — this is how those get brought down to the same
 * size the wall asks for now.
 *
 * Each photo is written back to its own pathname, so its URL doesn't move and
 * the uploads table isn't touched: approvals, credits and timestamps all
 * survive untouched. Vercel's CDN takes up to a minute to catch up, and a
 * browser that already has the old file keeps it until its cache expires —
 * which costs nothing, since a cached photo is never fetched again.
 *
 * Reads only, unless you pass --write:
 *
 *   node --env-file=.env.local scripts/recompress-wall.mjs
 *   node --env-file=.env.local scripts/recompress-wall.mjs --backup ./wall-originals
 *   node --env-file=.env.local scripts/recompress-wall.mjs --backup ./wall-originals --write
 *
 * Overwriting is the one step that can't be undone from the store itself, so
 * take the backup first — it's what you'd restore from.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { list, put } from "@vercel/blob";
import sharp from "sharp";

/* Kept deliberately in step with app/lib/compressImage.ts — if the wall's
   target moves, both move together or the two paths disagree. */
const DIMENSION_STEPS = [1600, 1280, 1024];
const TARGET_BYTES = 380 * 1024;
const QUALITY_STEPS = [0.78, 0.7, 0.62, 0.54, 0.46];

/* Below this a photo is already where we want it; re-encoding would only cost
   it a generation of quality for a few KB. */
const LEAVE_ALONE_BELOW = 450 * 1024;

const args = new Set(process.argv.slice(2));
const write = args.has("--write");
const backupDir = (() => {
  const argv = process.argv.slice(2);
  const at = argv.indexOf("--backup");
  return at === -1 ? null : argv[at + 1] ?? null;
})();

const kb = (n) => `${Math.round(n / 1024)} KB`;

/* The same two ladders the browser walks: step the quality down at full size,
   and only if nothing lands under the target redraw smaller and try again. */
async function recompress(input) {
  const source = sharp(input, { failOn: "none" }).rotate();
  const { width, height } = await source.metadata();
  const longest = Math.max(width, height);

  let best = null;
  let drawnAt = Infinity;

  for (const dimension of DIMENSION_STEPS) {
    const at = Math.min(dimension, longest);
    if (at >= drawnAt) continue;
    drawnAt = at;

    const resized = sharp(input, { failOn: "none" })
      .rotate()
      .resize({ width: dimension, height: dimension, fit: "inside", withoutEnlargement: true })
      /* JPEG has no alpha; without this a transparent PNG would go black. */
      .flatten({ background: "#ffffff" });

    for (const quality of QUALITY_STEPS) {
      const out = await resized
        .clone()
        .jpeg({ quality: Math.round(quality * 100), mozjpeg: true })
        .toBuffer();

      if (!best || out.length < best.buffer.length) {
        best = { buffer: out, quality, at };
      }
      if (out.length <= TARGET_BYTES) return best;
    }
  }

  return best;
}

const blobs = [];
let cursor;
do {
  const page = await list({ prefix: "wall/", cursor, limit: 1000 });
  blobs.push(...page.blobs);
  cursor = page.cursor;
} while (cursor);

if (backupDir) await mkdir(backupDir, { recursive: true });

console.log(write ? "WRITING — blobs will be overwritten\n" : "DRY RUN — nothing will be written\n");

let before = 0;
let after = 0;
let changed = 0;

for (const blob of blobs.sort((a, b) => b.size - a.size)) {
  const name = blob.pathname.replace(/^wall\//, "");
  before += blob.size;

  if (blob.size < LEAVE_ALONE_BELOW) {
    after += blob.size;
    console.log(`skip   ${kb(blob.size).padStart(7)}  already small        ${name}`);
    continue;
  }

  const original = Buffer.from(await fetch(blob.url).then((r) => r.arrayBuffer()));

  if (backupDir) await writeFile(join(backupDir, name), original);

  const best = await recompress(original);

  /* A photo that doesn't actually get smaller is left exactly as it is —
     re-encoding it would spend quality for nothing. */
  if (!best || best.buffer.length >= blob.size) {
    after += blob.size;
    console.log(`skip   ${kb(blob.size).padStart(7)}  no saving            ${name}`);
    continue;
  }

  after += best.buffer.length;
  changed++;

  const detail = `${kb(blob.size)} -> ${kb(best.buffer.length)}  @${best.at}px q${best.quality}`;

  if (!write) {
    console.log(`would  ${detail.padEnd(38)} ${name}`);
    continue;
  }

  const written = await put(blob.pathname, best.buffer, {
    access: "public",
    contentType: "image/jpeg",
    /* The pathname already carries the suffix it was given on the way in.
       Asking for another would make a second blob instead of replacing this
       one — and then the URL in the uploads table would point at the old
       file. Both of these have to stay off for the URL to hold still. */
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  /* If the URL moved, the row in the uploads table now points somewhere
     stale, which is worth stopping over rather than logging past. */
  if (written.url !== blob.url) {
    throw new Error(`URL moved for ${blob.pathname}:\n  was ${blob.url}\n  now ${written.url}`);
  }

  console.log(`wrote  ${detail.padEnd(38)} ${name}`);
}

console.log(
  `\n${changed} of ${blobs.length} photos` +
    `   ${(before / 1024 / 1024).toFixed(1)} MB -> ${(after / 1024 / 1024).toFixed(1)} MB` +
    `   saves ${(((before - after) / before) * 100).toFixed(0)}%`
);
if (!write) console.log("Re-run with --write to apply.");

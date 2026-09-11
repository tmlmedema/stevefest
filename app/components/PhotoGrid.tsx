"use client";

import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { compressImage, MAX_INPUT_BYTES } from "../lib/compressImage";
import { framePhoto } from "../lib/framePhoto";
import {
  BAD_CODE_MESSAGE,
  PHOTOGRAPHER_CODE_LENGTH,
  photographerFor,
} from "../lib/data";

const ROTATIONS = [-3, 2, -2, 3, -1, 1];

/* How many tiles the wall puts up at a time.
 *
 * loading="lazy" on each tile only defers the fetch — every photo is still a
 * DOM node and a request the browser is holding, and by the end of the fest
 * that's a long list to hand someone on a phone at once. This puts up a
 * screenful or two, then adds more as they scroll.
 *
 * A whole number of rows at every breakpoint (the grid runs 2, 3 or 4 across)
 * so a batch never ends mid-row. */
const BATCH = 24;

/* How far below the fold the next batch starts loading. Roughly a screen's
   worth, so the tiles have arrived by the time they're scrolled to rather
   than appearing under the reader. */
const LOOKAHEAD = "800px";

/* The share sheet is worth offering on a phone or tablet and nowhere else,
   so this has to be sure before it says yes. Chrome and Edge answer outright
   with userAgentData.mobile; everywhere else (Safari, Firefox) it takes all
   three of a coarse pointer, no hover, and a real touchscreen. Anything the
   browser won't tell us about counts as desktop and gets a plain download. */
const touchDevice = () => {
  if (typeof navigator === "undefined" || typeof matchMedia !== "function") {
    return false;
  }

  const ua = (navigator as Navigator & { userAgentData?: { mobile?: boolean } })
    .userAgentData;
  if (typeof ua?.mobile === "boolean") return ua.mobile;

  return (
    matchMedia("(pointer: coarse)").matches &&
    matchMedia("(hover: none)").matches &&
    navigator.maxTouchPoints > 0
  );
};

type Status = "idle" | "compressing" | "uploading" | "done" | "error";

export default function PhotoGrid({
  photos,
  canUpload,
  notice,
  adminOverride,
}: {
  photos: { url: string; pathname: string; credit?: string | null }[];
  /* Decided on the server. The upload route enforces the same rule, so this
     only decides what's drawn — losing the argument here costs nothing. */
  canUpload: boolean;
  notice: string | null;
  adminOverride: boolean;
}) {
  /* The whole photo rather than its url: the band needs the credit too, and
     looking it back up by url would only be the same object again. */
  const [active, setActive] = useState<{
    url: string;
    credit?: string | null;
  } | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  /* The upload form. The photo is chosen but not sent until Submit, so the
     code can be checked against it and both travel together. */
  const [formOpen, setFormOpen] = useState(false);
  const [pick, setPick] = useState<File | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [formError, setFormError] = useState("");
  const router = useRouter();
  const busy = status === "compressing" || status === "uploading";
  const [saveError, setSaveError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  /* Set when Download is pressed before the render has finished; the effect
     below hands over as soon as it has something to hand over. */
  const [waiting, setWaiting] = useState(false);

  /* How much of the wall is on the page so far, and the marker that sits
     under it waiting to come into view. */
  const [shown, setShown] = useState(BATCH);
  const more = useRef<HTMLDivElement>(null);

  /* Rendered when the lightbox opens, not when Download is pressed. iOS only
     allows navigator.share while the tap's user activation is still live, and
     framePhoto's image loads and toBlob are long enough to lose it — by the
     time a blob came back the share sheet would be refused. */
  useEffect(() => {
    setSaveError("");
    setFile(null);
    setWaiting(false);
    if (!active) return;

    let stale = false;

    framePhoto(active.url, active.credit)
      .then((blob) => {
        if (stale) return;
        setFile(
          new File([blob], `steve-fest-${Date.now()}.jpg`, {
            type: "image/jpeg",
          })
        );
      })
      .catch(() => {
        if (stale) return;
        setSaveError("Couldn't save that one.");
        /* Release a press that was queued against a render that's never
           coming, so the button doesn't sit on "Preparing…" for good. */
        setWaiting(false);
      });

    return () => {
      stale = true;
    };
  }, [active]);

  /* The confirmation clears itself so the wall isn't left with a stale
     "thanks" pinned over it, but not before it's been read — it's a couple
     of sentences, and a phone that's just come back from the photo picker
     needs a moment to settle. Errors stay put: the visitor has to act on
     those, and picking another file replaces the toast anyway. */
  useEffect(() => {
    if (status !== "done") return;
    const t = setTimeout(() => setStatus("idle"), 11000);
    return () => clearTimeout(t);
  }, [status]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [active]);

  /* Adds the next batch when the marker below the grid comes within reach.
     Re-runs on `shown` because each batch moves the marker down the page —
     the observer has to be pointed at where it is now, not where it was. */
  useEffect(() => {
    const marker = more.current;
    if (!marker) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown((n) => Math.min(n + BATCH, photos.length));
        }
      },
      { rootMargin: LOOKAHEAD }
    );

    observer.observe(marker);
    return () => observer.disconnect();
  }, [shown, photos.length]);

  /* An upload drops a new photo in at the top, and the wall shouldn't roll
     itself back up to a single batch underneath the visitor when it does. */
  useEffect(() => {
    setShown((n) => Math.min(Math.max(n, BATCH), photos.length));
  }, [photos.length]);

  /* Escape closes the upload form too — but not mid-upload, where it would
     look like a cancel it can't actually perform. */
  useEffect(() => {
    if (!formOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || busy) return;
      setFormOpen(false);
      if (inputRef.current) inputRef.current.value = "";
      setPick(null);
      setCode("");
      setCodeError("");
      setFormError("");
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [formOpen, busy]);

  /* Clearing the input's value matters as well as dropping the File: without
     it, picking the same photo again fires no change event. */
  const clearForm = () => {
    if (inputRef.current) inputRef.current.value = "";
    setPick(null);
    setCode("");
    setCodeError("");
    setFormError("");
  };

  const closeForm = () => {
    setFormOpen(false);
    clearForm();
  };

  const deliver = async (ready: File) => {
    /* The share sheet is the only route to a phone's camera roll — a plain
       download lands in Files or the Downloads folder instead. On a desktop
       it's the wrong answer: canShare says yes there too on recent Chrome
       and Safari, and a mouse gets a sheet to click through when it asked
       for a file. touchDevice decides which one this is. */
    if (touchDevice() && navigator.canShare?.({ files: [ready] })) {
      try {
        await navigator.share({ files: [ready] });
        return;
      } catch (err) {
        /* Dismissing the sheet is a choice, not a failure. Anything else
           falls through to the download rather than leaving them empty
           handed. */
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    const url = URL.createObjectURL(ready);
    const a = document.createElement("a");
    a.href = url;
    a.download = ready.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onDownload = () => {
    setSaveError("");
    /* Nothing to give yet: remember the press and let the effect below run
       it the moment the render lands. */
    if (!file) {
      setWaiting(true);
      return;
    }
    void deliver(file);
  };

  /* Picks up a press that arrived early. Split out of the click handler so
     the button can stay live while the canvas is still working. */
  useEffect(() => {
    if (!waiting || !file) return;
    setWaiting(false);
    void deliver(file);
  }, [waiting, file]);

  /* Picking only stages the photo — nothing leaves the browser until Submit,
     so the code beside it can be checked first and the two travel together. */
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    if (!chosen) return;

    /* Some Android pickers ignore the accept attribute, so check again here.
       An empty type comes back from a few of them too — let the decoder
       be the judge in that case rather than rejecting a real photo. */
    if (chosen.type && !chosen.type.startsWith("image/")) {
      setPick(null);
      setFormError("Photos only — that looks like a video or a document.");
      return;
    }

    if (chosen.size > MAX_INPUT_BYTES) {
      setPick(null);
      setFormError("That file is too big. Try a photo straight off your phone.");
      return;
    }

    setFormError("");
    setPick(chosen);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    /* Both fields are judged before either is reported, so a form with two
       things wrong with it says so once rather than a field at a time.

       An empty code is the ordinary case — most people at the fest aren't
       shooting on one — but a code that has been typed has to be a real one
       before anything is sent. The route checks it again on arrival. */
    const typed = code.trim();
    const missingPhoto = !pick;
    const badCode = !!typed && !photographerFor(typed);

    setFormError(missingPhoto ? "Pick a photo to upload." : "");
    setCodeError(badCode ? BAD_CODE_MESSAGE : "");
    if (missingPhoto || badCode) return;

    setStatus("compressing");
    setError("");

    let photo: File;
    try {
      photo = await compressImage(pick);
    } catch {
      const message = "Couldn't read that image. Try a JPEG or PNG.";
      setStatus("error");
      setError(message);
      setFormError(message);
      return;
    }

    setStatus("uploading");

    try {
      /* Deliberately not pick.name — the uploader's original filename
         would end up in a public URL. The random suffix the server adds is
         what makes this unique; the timestamp just keeps it readable. */
      const blob = await upload(`wall/${Date.now()}.jpg`, photo, {
        access: "public",
        handleUploadUrl: "/api/wall",
        /* Read before a token is signed, so a code that isn't one is refused
           without a file being written at all. */
        clientPayload: JSON.stringify({ code: typed || null }),
      });

      /* Get it into the review queue now rather than waiting on Vercel's
         completion callback, which doesn't reach localhost at all. If this
         fails the photo is still safely uploaded — the callback will catch
         it in production — so it isn't worth an error in the visitor's face. */
      try {
        await fetch("/api/wall/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pathname: blob.pathname,
            code: typed || null,
          }),
        });
      } catch {
        /* Left to the server-side callback. */
      }

      closeForm();
      setStatus("done");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";

      /* The token step refuses a bad code, so it can arrive here rather than
         from the check above — someone with the console open, or a list that
         changed between the page loading and Submit. That one belongs on the
         field, where it can be corrected, and needs no toast shouting the
         same thing from the bottom of the screen. */
      if (message === BAD_CODE_MESSAGE) {
        setStatus("idle");
        setCodeError(message);
        return;
      }

      /* Anything else is the submission itself failing, which the toast
         reports the same way it reports a success. The form stays open
         underneath it so the photo doesn't have to be found again. */
      setStatus("error");
      setError(message);
      setFormError(message);
    }
  };

  return (
    <>
      {!canUpload && notice && <p className="wall-closed">{notice}</p>}

      <div className="photo-grid">
        {canUpload && (
          <button
            type="button"
            className="upload-tile"
            disabled={busy}
            onClick={() => setFormOpen(true)}
          >
            <span className="plus-circle">+</span>
            {status === "compressing" && "Shrinking…"}
            {status === "uploading" && "Uploading…"}
            {!busy && "Upload Photos"}
          </button>
        )}

        {photos.slice(0, shown).map((p, i) => (
          <button
            type="button"
            className="polaroid"
            key={p.pathname}
            style={{ "--r": `${ROTATIONS[i % ROTATIONS.length]}deg` } as React.CSSProperties}
            onClick={() => setActive(p)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" loading="lazy" decoding="async" />
            {/* Decoration, not a control — it advertises the download
                waiting in the lightbox. The tile itself is the button. */}
            <span className="polaroid-save" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M12 3v10m0 0 4-4m-4 4-4-4" />
                <path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      {/* Outside the grid so it isn't laid out as a cell of it. Rendered only
          while there's more to come, which is what stops the observer from
          firing against an exhausted wall. */}
      {shown < photos.length && (
        <div ref={more} className="wall-more" aria-hidden="true" />
      )}

      {adminOverride && (
        <p className="wall-admin-note">
          The wall is shut to the public right now — you can post because
          you&apos;re signed in.
        </p>
      )}

      {(status === "done" || status === "error") && (
        <div
          className={status === "done" ? "toast toast-ok" : "toast toast-bad"}
          role={status === "done" ? "status" : "alert"}
          aria-live={status === "done" ? "polite" : "assertive"}
        >
          <p className="toast-text">
            {status === "done"
              ? "Steve has collected your photo! It gets a quick look from an organiser before it lands on the wall — thanks for your submission."
              : error}
          </p>
          <button
            type="button"
            className="toast-close"
            aria-label="Dismiss"
            onClick={() => setStatus("idle")}
          >
            ×
          </button>
        </div>
      )}

      {formOpen && (
        <div
          className="upload-modal"
          onClick={() => !busy && closeForm()}
        >
          <form
            className="upload-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-title"
            onClick={(e) => e.stopPropagation()}
            onSubmit={onSubmit}
            noValidate
          >
            <div className="upload-head">
              <h3 id="upload-title">Add to the wall</h3>
              <button
                type="button"
                className="upload-close"
                aria-label="Close"
                onClick={closeForm}
                disabled={busy}
              >
                ×
              </button>
            </div>

            <div className="upload-field">
              <span className="upload-label">Your photo</span>
              <button
                type="button"
                className="upload-choose"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
              >
                {pick ? "Choose a different photo" : "Choose a photo"}
              </button>
              {/* The name is the only feedback that the pick landed — the
                  input itself is hidden, so its own label never shows. */}
              {pick && <span className="upload-picked">{pick.name}</span>}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={onPick}
                hidden
              />
            </div>

            <div className="upload-field">
              <label className="upload-label" htmlFor="photographer-code">
                Photographer code <span className="upload-optional">optional</span>
              </label>
              <input
                id="photographer-code"
                className={codeError ? "upload-input is-bad" : "upload-input"}
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={PHOTOGRAPHER_CODE_LENGTH}
                placeholder="AB1234"
                value={code}
                disabled={busy}
                aria-invalid={!!codeError}
                aria-describedby={
                  codeError ? "photographer-code-error" : "photographer-code-hint"
                }
                /* Upper-cased as it's typed so what's on screen matches what
                   the check compares — the lookup folds case anyway. */
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setCodeError("");
                }}
              />
              {codeError ? (
                <span className="upload-error" id="photographer-code-error">
                  {codeError}
                </span>
              ) : (
                <span className="upload-hint" id="photographer-code-hint">
                  Shooting the fest for us? Enter your code so the shot gets
                  credited. Leave it blank otherwise.
                </span>
              )}
            </div>

            {formError && (
              <p className="upload-error upload-error-form" role="alert">
                {formError}
              </p>
            )}

            <button type="submit" className="upload-submit" disabled={busy}>
              {status === "compressing" && "Shrinking…"}
              {status === "uploading" && "Uploading…"}
              {!busy && "Submit"}
            </button>
          </form>
        </div>
      )}

      {active && (
        <div className="lightbox" onClick={() => setActive(null)}>
          <div
            className="lightbox-actions"
            onClick={(e) => e.stopPropagation()}
          >
            {saveError && <span className="lightbox-error">{saveError}</span>}
            <button
              type="button"
              className="lightbox-close"
              aria-label="Close"
              onClick={() => setActive(null)}
            >
              ×
            </button>
          </div>
          <figure
            className="lightbox-frame"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.url} alt="" />
            {/* The wordmark is yellow on transparent, so it gets the same
                black block the nav gives it — on bare paper it disappears.
                The sizes hint keeps Next from fetching the 1920px variant
                for a slot that renders about 145px wide. */}
            {/* One row rather than two separately-pinned corners: the mark
                and the button are different heights, so matching their
                bottom edges left their centres out of line. */}
            <div className="lightbox-footer">
              <span className="lightbox-mark">
                <Image
                  src="/assets/wordmark-nav.png"
                  alt=""
                  width={760}
                  height={187}
                  sizes="150px"
                />
              </span>
              {/* Between the two, as it is in the download. A shot with no
                  photographer on it gets no line at all rather than an
                  empty label. */}
              {active.credit && (
                <span className="lightbox-credit">
                  <span className="lightbox-credit-label">Photo Cred:</span>
                  <span className="lightbox-credit-name">{active.credit}</span>
                </span>
              )}
              {/* Lives inside the frame, but it's DOM only — the download is
                  a fresh canvas render, so the button never lands in the
                  file. */}
              {/* Reads "Download" from the moment the lightbox opens: the
                  canvas render runs in the background, and "Preparing…"
                  only shows if someone gets there before it does. */}
              <button
                type="button"
                className="lightbox-save"
                onClick={onDownload}
                disabled={waiting || !!saveError}
              >
                {waiting ? "Preparing…" : "Download"}
              </button>
            </div>
          </figure>
        </div>
      )}
    </>
  );
}

"use client";

import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { compressImage, MAX_INPUT_BYTES } from "../lib/compressImage";
import { framePhoto } from "../lib/framePhoto";

const ROTATIONS = [-3, 2, -2, 3, -1, 1];

type Status = "idle" | "compressing" | "uploading" | "done" | "error";

export default function PhotoGrid({
  photos,
  canUpload,
  notice,
  adminOverride,
}: {
  photos: { url: string; pathname: string }[];
  /* Decided on the server. The upload route enforces the same rule, so this
     only decides what's drawn — losing the argument here costs nothing. */
  canUpload: boolean;
  notice: string | null;
  adminOverride: boolean;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const busy = status === "compressing" || status === "uploading";
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [file, setFile] = useState<File | null>(null);

  /* Rendered when the lightbox opens, not when Download is pressed. iOS only
     allows navigator.share while the tap's user activation is still live, and
     framePhoto's image loads and toBlob are long enough to lose it — by the
     time a blob came back the share sheet would be refused. */
  useEffect(() => {
    setSaveError("");
    setFile(null);
    if (!active) return;

    let stale = false;
    setSaving(true);

    framePhoto(active)
      .then((blob) => {
        if (stale) return;
        setFile(
          new File([blob], `steve-fest-${Date.now()}.jpg`, {
            type: "image/jpeg",
          })
        );
      })
      .catch(() => {
        if (!stale) setSaveError("Couldn't save that one.");
      })
      .finally(() => {
        if (!stale) setSaving(false);
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

  const reset = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  const fail = (message: string) => {
    setStatus("error");
    setError(message);
    reset();
  };

  const onDownload = async () => {
    if (!file) return;
    setSaveError("");

    /* The share sheet is the only route to a phone's camera roll — a plain
       download lands in Files or the Downloads folder instead. Desktop
       browsers don't offer it for files, and fall through. */
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (err) {
        /* Dismissing the sheet is a choice, not a failure. Anything else
           falls through to the download rather than leaving them empty
           handed. */
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    /* Some Android pickers ignore the accept attribute, so check again here.
       An empty type comes back from a few of them too — let the decoder
       be the judge in that case rather than rejecting a real photo. */
    if (file.type && !file.type.startsWith("image/")) {
      fail("Photos only — that looks like a video or a document.");
      return;
    }

    if (file.size > MAX_INPUT_BYTES) {
      fail("That file is too big. Try a photo straight off your phone.");
      return;
    }

    setStatus("compressing");
    setError("");

    let photo: File;
    try {
      photo = await compressImage(file);
    } catch {
      fail("Couldn't read that image. Try a JPEG or PNG.");
      return;
    }

    setStatus("uploading");

    try {
      /* Deliberately not photo.name — the uploader's original filename
         would end up in a public URL. The random suffix the server adds is
         what makes this unique; the timestamp just keeps it readable. */
      const blob = await upload(`wall/${Date.now()}.jpg`, photo, {
        access: "public",
        handleUploadUrl: "/api/wall",
      });

      /* Get it into the review queue now rather than waiting on Vercel's
         completion callback, which doesn't reach localhost at all. If this
         fails the photo is still safely uploaded — the callback will catch
         it in production — so it isn't worth an error in the visitor's face. */
      try {
        await fetch("/api/wall/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pathname: blob.pathname }),
        });
      } catch {
        /* Left to the server-side callback. */
      }

      setStatus("done");
      reset();
      router.refresh();
    } catch (err) {
      fail(err instanceof Error ? err.message : "Upload failed.");
    }
  };

  return (
    <>
      {!canUpload && notice && <p className="wall-closed">{notice}</p>}

      <div className="photo-grid">
        {canUpload && (
          <>
            <button
              type="button"
              className="upload-tile"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <span className="plus-circle">+</span>
              {status === "compressing" && "Shrinking…"}
              {status === "uploading" && "Uploading…"}
              {!busy && "Upload Photos"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              onChange={onChange}
              hidden
            />
          </>
        )}

        {photos.map((p, i) => (
          <button
            type="button"
            className="polaroid"
            key={p.pathname}
            style={{ "--r": `${ROTATIONS[i % ROTATIONS.length]}deg` } as React.CSSProperties}
            onClick={() => setActive(p.url)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" loading="lazy" />
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
            <img src={active} alt="" />
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
              {/* Lives inside the frame, but it's DOM only — the download is
                  a fresh canvas render, so the button never lands in the
                  file. */}
              <button
                type="button"
                className="lightbox-save"
                onClick={onDownload}
                disabled={saving || !file}
              >
                {saving ? "Preparing…" : "Download"}
              </button>
            </div>
          </figure>
        </div>
      )}
    </>
  );
}

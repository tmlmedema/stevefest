"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const ROTATIONS = [-3, 2, -2, 3, -1, 1];

type Status = "idle" | "uploading" | "error";

export default function PhotoGrid({
  photos,
}: {
  photos: { url: string; pathname: string }[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [active]);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setError("");

    try {
      await upload(`photos/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/photos",
      });
      setStatus("idle");
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  };

  return (
    <>
      <div className="photo-grid">
        <button
          type="button"
          className="upload-tile"
          disabled={status === "uploading"}
          onClick={() => inputRef.current?.click()}
        >
          <span className="plus-circle">+</span>
          {status === "uploading" ? "Uploading…" : "Upload Photos"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onChange}
          hidden
        />

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
          </button>
        ))}
      </div>

      {status === "error" && <p className="upload-error">{error}</p>}

      {active && (
        <div className="lightbox" onClick={() => setActive(null)}>
          <button
            type="button"
            className="lightbox-close"
            aria-label="Close"
            onClick={() => setActive(null)}
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={active} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

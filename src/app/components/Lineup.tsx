"use client";

import { useCallback, useEffect, useRef } from "react";
import { BANDS, nameStyle } from "../lib/data";

export default function Lineup() {
  const box = useRef<HTMLDivElement>(null);

  /* squares separate names, so drop the one at each line's end */
  const trimSquares = useCallback(() => {
    const names = Array.from(box.current?.querySelectorAll<HTMLElement>(".name") ?? []);
    names.forEach((el) => el.classList.remove("eol"));
    names.forEach((el, i) => {
      const next = names[i + 1];
      if (!next || next.offsetTop > el.offsetTop) el.classList.add("eol");
    });
  }, []);

  useEffect(() => {
    trimSquares();
    document.fonts?.ready.then(trimSquares);

    let rz: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(rz);
      rz = setTimeout(trimSquares, 120);
    };
    addEventListener("resize", onResize);
    return () => {
      clearTimeout(rz);
      removeEventListener("resize", onResize);
    };
  }, [trimSquares]);

  return (
    <div className="names" id="names" ref={box}>
      {BANDS.map((b) => {
        const style = nameStyle(b.n);
        /* no link of their own, so no hover and nothing to click — the name
           just sits there as text */
        return b.u ? (
          <a
            key={b.n}
            className="name"
            href={b.u}
            target="_blank"
            rel="noopener"
            data-store="1"
            style={style}
          >
            <span className="nm">{b.n}</span>
          </a>
        ) : (
          <span key={b.n} className="name" data-store="0" style={style}>
            <span className="nm">{b.n}</span>
          </span>
        );
      })}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { BANDS, nameStyle } from "../lib/data";

export default function Lineup() {
  const box = useRef<HTMLDivElement>(null);

  /* squares separate names, so drop the one at each line's end */
  const trimSquares = useCallback(() => {
    const links = Array.from(box.current?.querySelectorAll("a") ?? []);
    links.forEach((a) => a.classList.remove("eol"));
    links.forEach((a, i) => {
      const next = links[i + 1];
      if (!next || next.offsetTop > a.offsetTop) a.classList.add("eol");
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
        return b.u ? (
          <a
            key={b.n}
            href={b.u}
            target="_blank"
            rel="noopener"
            data-store="1"
            style={style}
          >
            <span className="nm">{b.n}</span>
          </a>
        ) : (
          <Link key={b.n} href="/bands" data-store="0" style={style}>
            <span className="nm">{b.n}</span>
          </Link>
        );
      })}
    </div>
  );
}

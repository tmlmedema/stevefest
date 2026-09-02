"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/bands", label: "Bands" },
  { href: "/photos", label: "Photos" },
  {
    href: "https://givebutter.com/stevefestii",
    label: "Feed a steve",
    external: true,
    /* Burger menu only. On wide screens the footer link and the home page's
       CTAs already cover donating, and the nav row reads better without it. */
    mobileOnly: true,
  },
];

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const tape = useRef<HTMLDivElement>(null);

  // the menu never survives a page change
  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!tape.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div className="tape" ref={tape}>
      <div className="wrap">
        <Link className="mark" href="/" aria-label="Steve Fest II — home">
          <Image
            src="/assets/wordmark-nav.png"
            alt=""
            width={760}
            height={187}
          />
        </Link>
        <button
          type="button"
          className="burger"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="burger-box" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
        <nav id="site-nav" className={open ? "is-open" : undefined}>
          {LINKS.map((l) =>
            l.external ? (
              <a
                key={l.href}
                className={l.mobileOnly ? "nav-mobile-only" : undefined}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                aria-current={path === l.href ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/bands", label: "Bands" },
  { href: "/photos", label: "Photos" },
];

export default function Nav() {
  const path = usePathname();

  return (
    <div className="tape">
      <div className="wrap">
        <Link className="mark" href="/" aria-label="Steve Fest II — home">
          <Image
            src="/assets/wordmark-nav.png"
            alt=""
            width={760}
            height={187}
          />
        </Link>
        <nav>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={path === l.href ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

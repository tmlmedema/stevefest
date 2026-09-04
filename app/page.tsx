import Image from "next/image";
import Link from "next/link";
import { BANDS, SPONSORS } from "./lib/data";
import Countdown from "./components/Countdown";
import GiveCta from "./components/GiveCta";
import PlaylistCta from "./components/PlaylistCta";
import Lineup from "./components/Lineup";

export default function Home() {
  return (
    <section id="home" className="view">
      <div className="wrap hero">
        <div className="dateline">
          <span className="ed">Downtown Lombard Edition</span>
          <span>&ndash;</span>
          <span>Sept. 11&ndash;13, 2026</span>
          <span className="free">Free</span>
        </div>

        <h1 className="wordmark">
          <Image
            src="/assets/wordmark-hero.png"
            alt="Steve Fest II"
            width={1324}
            height={456}
            priority
          />
        </h1>

        <p className="subhead">Shannon&apos;s Deli hosts the regional festival</p>
        <p className="stats">
          <span>
            <b>{BANDS.length}</b> bands
          </span>
          <span>
            <b>3</b> stages
          </span>
          <span>
            <b>3</b> days
          </span>
          <span>All ages</span>
          <span>No cover</span>
        </p>

        <div className="cta">
          <Link href="/schedule">See the schedule</Link>
          <Link className="hollow" href="/bands">
            Bands &amp; merch
          </Link>
          <Link className="hollow" href="https://givebutter.com/stevefestii" target="_blank">
            Feed a steve
          </Link>
        </div>

        <Countdown />

        <div className="sheet lineup">
          <Lineup />
        </div>

        <div className="ask-row">
          <GiveCta />
          <PlaylistCta />
        </div>

        <div className="sheet supporters" id="sponsors">
          <span className="supporters-title">Steve Couldn&apos;t Do It Without Our Sponsors</span>
          <div className="sup-row">
            {SPONSORS.map((sp) => {
              const img = (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sp.src} alt={sp.name} width={sp.w} height={sp.h} />
              );
              return sp.href ? (
                <a
                  className="sup logo"
                  key={sp.name}
                  href={sp.href}
                  target="_blank"
                  rel="noopener"
                >
                  {img}
                </a>
              ) : (
                <div className="sup logo" key={sp.name}>
                  {img}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import Countdown from "./components/Countdown";
import Lineup from "./components/Lineup";

const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Shannon%27s+Deli+11+S+Park+Ave+Lombard+IL+60148&query_place_id=ChIJIapJJ2FNDogRqQ7cDnSbWx4";

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
        <p className="venue">
          <a href={MAP_URL} target="_blank" rel="noopener">
            11 S Park Ave, Lombard, IL 60148
          </a>
        </p>
        <p className="stats">
          <span>
            <b>40</b> bands
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
        </div>

        <Countdown />

        <div style={{ height: "3.2rem" }} />

        <div className="sheet lineup">
          <Lineup />
          <p className="tail">*Rooftop / acoustic stage lineup coming soon</p>
        </div>

        <div className="sheet supporters">
          <span className="eyebrow">Presented by &amp; supported by</span>
          <div className="sup-row">
            <div className="sup host">
              <b>
                Shannon&apos;s Deli<small>Downtown Lombard</small>
              </b>
            </div>
            <div className="sup logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/logo-punk-rock-saves-lives.png"
                alt="Punk Rock Saves Lives"
                width={360}
                height={360}
              />
            </div>
            <div className="sup logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/dtl-heart.svg"
                alt="I heart Downtown Lombard"
                width={1254}
                height={1254}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import Countdown from "./components/Countdown";
import Lineup from "./components/Lineup";

const SPONSORS = [
  { name: "Shannon's Deli", src: "/assets/sponsors/shannons-deli.png", w: 2560, h: 806, href: "https://shannonsdeli.net/" },
  { name: "Blind Corner Brewery", src: "/assets/sponsors/blind-corner-brewery.png", w: 1460, h: 1268, href: "https://www.blindcornerbrewery.com/" },
  { name: "Punk Rock Saves Lives", src: "/assets/logo-punk-rock-saves-lives.png", w: 360, h: 360, href: "https://www.punkrocksaveslives.org/" },
  { name: "Carpool", src: "/assets/sponsors/carpool.png", w: 336, h: 336, href: null },
  { name: "Dobies Printing LLC", src: "/assets/sponsors/dobies-printing.png", w: 500, h: 500, href: "https://dobiesprinting.com/" },
  { name: "Eating Soup Daily", src: "/assets/sponsors/eating-soup-daily.jpg", w: 1080, h: 1080, href: "https://www.tiktok.com/@nagernadnerb" },
  { name: "JL Vintage", src: "/assets/sponsors/jl-vintage.jpg", w: 1304, h: 1600, href: "https://www.jlvintage.com/" },
  { name: "I Heart DTL", src: "/assets/dtl-heart.svg", w: 1254, h: 1254, href: "https://iheartdtl.com/" },
];

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
            <b>57</b> bands
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
          </Link
          <Link className="hollow" href="https://givebutter.com/stevefestii" terget="_blank">
            Feed a steve
          </Link>
          
        </div>

        <Countdown />

        <div style={{ height: "3.2rem" }} />

        <div className="sheet lineup">
          <Lineup />
        </div>

        <div className="sheet give">
          <span className="eyebrow">No cover, never has been</span>
          <h2 className="give-head">Keep Steve Fest free</h2>
          <p className="give-copy">
            Three days, three stages, 57 bands, and not one dollar at the door.
            Donations are what keep it that way &mdash; chip in whatever you&apos;ve got.
          </p>
          <a
            className="give-btn"
            href="https://givebutter.com/stevefestii"
            target="_blank"
            rel="noopener noreferrer"
          >
            Donate to Steve Fest
          </a>
        </div>

        <div className="sheet supporters">
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

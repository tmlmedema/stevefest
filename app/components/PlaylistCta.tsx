/*
 * The playlist panel, home page only. It sits beside the donate ask rather than
 * inside it: same sheet, same block shadow, a green ground so the two boxes
 * read as a pair of asks instead of one panel with two buttons.
 */
const SPOTIFY =
  "https://open.spotify.com/playlist/2PrX33Krg7CxeuXnrXWexl?si=n9F4yggyQ7WG30vR7FKArg&utm_source=sms&pi=w9Z74OoxRRaNk";
const APPLE_MUSIC =
  "https://music.apple.com/us/playlist/steve-fest-ii/pl.u-zPyLmGYCMBMAyZ";

export default function PlaylistCta() {
  return (
    <div className="sheet playlist">
      <span className="eyebrow">Do your homework</span>
      <h2 className="give-head">Steve Fest on shuffle</h2>
      <p className="give-copy">
        We put the fest on a playlist. Learn a few words now so you can shout them
        back at the band later.
      </p>
      <div className="playlist-btns">
        <a
          className="give-btn playlist-btn"
          href={SPOTIFY}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Spotify
        </a>
        <a
          className="give-btn playlist-btn"
          href={APPLE_MUSIC}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Apple Music
        </a>
      </div>
    </div>
  );
}

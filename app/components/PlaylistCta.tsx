/*
 * The playlist panel, home page only. It sits beside the donate ask rather than
 * inside it: same sheet, same block shadow, a green ground so the two boxes
 * read as a pair of asks instead of one panel with two buttons.
 */
const PLAYLIST =
  "https://open.spotify.com/playlist/2PrX33Krg7CxeuXnrXWexl?si=n9F4yggyQ7WG30vR7FKArg&utm_source=sms&pi=w9Z74OoxRRaNk";

export default function PlaylistCta() {
  return (
    <div className="sheet playlist">
      <span className="eyebrow">Do your homework</span>
      <h2 className="give-head">Steve Fest on shuffle</h2>
      <p className="give-copy">
        We put the fest on a playlist. Learn a few words now so you can shout them
        back at the band later.
      </p>
      <a
        className="give-btn playlist-btn"
        href={PLAYLIST}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open in Spotify
      </a>
    </div>
  );
}

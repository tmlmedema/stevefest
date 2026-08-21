import { BANDS } from "../lib/data";

export default function BandShelf() {
  return (
    <div className="shelf" id="shelf">
      {BANDS.map((b) => {
        const links = [];
        if (b.u)
          links.push(
            <a key="u" href={b.u} target="_blank" rel="noopener">
              {b.l1 || "Buy"}
            </a>
          );
        if (b.u2)
          links.push(
            <a key="u2" className="ghost" href={b.u2} target="_blank" rel="noopener">
              {b.l2 || "More"}
            </a>
          );

        return (
          <article className={b.u ? "band" : "band dim"} key={b.n}>
            <h3>{b.n}</h3>
            <span className="where">{b.base}</span>
            <p className="blurb">{b.kind}</p>
            <div className="links">
              {links.length ? (
                links
              ) : (
                <span className="at-table">Catch them at the merch table</span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

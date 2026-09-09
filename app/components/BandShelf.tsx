import { BANDS, nameStyle } from "../lib/data";

const SORTED_BANDS = [...BANDS].sort((a, b) => a.n.localeCompare(b.n));

export default function BandShelf() {
  return (
    <div className="shelf" id="shelf">
      {SORTED_BANDS.map((b) => {
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
        if (b.u3)
          links.push(
            <a key="u3" className="ghost" href={b.u3} target="_blank" rel="noopener">
              {b.l3 || "More"}
            </a>
          );

        return (
          <article className={b.u ? "band" : "band dim"} key={b.n}>
            <h3 style={nameStyle(b.n)}>
              {b.n}
            </h3>
            <span className="where">{b.base}</span>
            {b.kind && <p className="blurb">{b.kind}</p>}
            {links.length > 0 && <div className="links">{links}</div>}
          </article>
        );
      })}
    </div>
  );
}

const ROTATIONS = [-3, 2, -2, 3, -1, 1];

export default function PhotoGrid({
  photos,
}: {
  photos: { url: string; pathname: string }[];
}) {
  if (!photos.length) {
    return <p className="photo-empty">No photos yet — be the first.</p>;
  }

  return (
    <div className="photo-grid">
      {photos.map((p, i) => (
        <div
          className="polaroid"
          key={p.pathname}
          style={{ "--r": `${ROTATIONS[i % ROTATIONS.length]}deg` } as React.CSSProperties}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.url} alt="" loading="lazy" />
        </div>
      ))}
    </div>
  );
}

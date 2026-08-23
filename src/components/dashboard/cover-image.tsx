/**
 * A cover filling its parent well.
 *
 * Deliberately a plain `<img>`: the src is whatever an editor typed, and
 * `next/image` only accepts hosts declared in `next.config.ts`. A dashboard
 * that refuses to preview a URL because it is not yet allow-listed is worse
 * than an unoptimised thumbnail.
 */
export function CoverImage({
  src,
  pos = "50% 18%",
  video = false,
  dim = 1,
}: {
  src: string;
  pos?: string;
  video?: boolean;
  /** Rows for switched-off sections are faded rather than hidden. */
  dim?: number;
}) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-well px-1 text-center font-sans text-[9px] leading-[110%] font-bold tracking-[0.06em] text-subtle uppercase">
        No image
      </div>
    );
  }

  const style = { objectPosition: pos, opacity: dim };

  if (video) {
    return (
      <video
        src={src}
        muted
        playsInline
        preload="metadata"
        style={style}
        className="block h-full w-full bg-black object-cover"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      style={style}
      className="block h-full w-full object-cover"
    />
  );
}

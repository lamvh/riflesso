"use client";

/* eslint-disable @next/next/no-img-element */
/* Previews take whatever address is typed, allow-listed host or not. */

/**
 * How a page will look in Google results and as a shared link on Facebook,
 * drawn from the values that will actually be used (typed or derived).
 */
export function SeoPreviewCards({
  title,
  description,
  url,
  image,
  imageNote,
  siteName,
  logoCard = false,
}: {
  title: string;
  description: string;
  url: string;
  /** Picture to show, or null when the preview is cut from a page photo at share time. */
  image: string | null;
  imageNote: string;
  siteName: string;
  /** `image` is a logo: shown centred on white, the way /og renders the logo card. */
  logoCard?: boolean;
}) {
  const host = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="grid gap-[14px] md:grid-cols-2">
      <figure className="min-w-0">
        <figcaption className="mb-[6px] font-sans text-[11px] font-bold tracking-[0.12em] text-graphite uppercase">
          Google
        </figcaption>
        <div className="rounded-[8px] border border-line bg-paper p-[14px] font-[arial,sans-serif]">
          <p className="truncate text-[12px] text-[#4d5156] admin-dark:text-[#bdc1c6]">{host}</p>
          <p className="mt-[2px] line-clamp-1 text-[18px] leading-[1.3] text-[#1a0dab] admin-dark:text-[#99c3ff]">
            {title}
          </p>
          <p className="mt-[3px] line-clamp-2 text-[13px] leading-[1.45] text-[#4d5156] admin-dark:text-[#bdc1c6]">
            {description}
          </p>
        </div>
      </figure>

      <figure className="min-w-0">
        <figcaption className="mb-[6px] font-sans text-[11px] font-bold tracking-[0.12em] text-graphite uppercase">
          Facebook
        </figcaption>
        <div className="overflow-hidden rounded-[8px] border border-line bg-paper font-[helvetica,arial,sans-serif]">
          <div className="relative aspect-[1200/630] bg-well">
            {image ? (
              logoCard ? (
                <div className="flex h-full w-full items-center justify-center bg-white">
                  <img src={image} alt="" className="block max-h-[47.6%] max-w-[46.7%] object-contain" />
                </div>
              ) : (
                <img src={image} alt="" className="block h-full w-full object-cover" />
              )
            ) : (
              <p className="absolute inset-0 flex items-center justify-center px-[16px] text-center font-sans text-[12px] text-graphite">
                {imageNote}
              </p>
            )}
          </div>
          <div className="bg-hover px-[12px] py-[9px]">
            <p className="truncate text-[11px] text-graphite uppercase">{host || siteName}</p>
            <p className="mt-[2px] line-clamp-1 text-[15px] font-semibold text-ink">{title}</p>
            <p className="mt-[1px] line-clamp-1 text-[13px] text-graphite">{description}</p>
          </div>
        </div>
      </figure>
    </div>
  );
}

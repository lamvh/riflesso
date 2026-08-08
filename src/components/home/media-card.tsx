"use client";

/* eslint-disable @next/next/no-img-element */
/*
 * Rail cards are sized by `height: var(--twg-rail-height); width: auto`, so the
 * rendered width comes from each asset's own aspect ratio. next/image needs
 * explicit dimensions (or a `fill` parent of known size) and neither is available
 * here, so a plain <img> is the correct primitive.
 */

import { useVideoAutoplay } from "@/hooks/use-video-autoplay";
import type { MediaItem } from "@/lib/media-item";

import { ArtistCreditLine } from "./artist-credit-line";

const MEDIA_SIZING = "block h-[var(--twg-rail-height)] w-auto max-w-none";

function describe(item: MediaItem) {
  const names = item.credits.map((credit) => credit.name.trim()).join(", ");
  return item.title ? `${item.title} — ${names}` : names;
}

function RailVideo({ src, label }: { src: string; label: string }) {
  const ref = useVideoAutoplay();
  return (
    <video
      ref={ref}
      src={src}
      aria-label={label}
      loop
      playsInline
      preload="metadata"
      className={MEDIA_SIZING}
    />
  );
}

export function MediaCard({ item }: { item: MediaItem }) {
  const label = describe(item);

  return (
    <a
      href="#"
      className="group flex shrink-0 grow-0 basis-auto flex-col items-start"
    >
      <div className="overflow-hidden">
        {item.kind === "image" ? (
          <img
            src={item.src}
            alt={label}
            loading="lazy"
            draggable={false}
            className={`${MEDIA_SIZING} transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[var(--twg-rail-zoom)]`}
          />
        ) : (
          <RailVideo src={item.src} label={label} />
        )}
      </div>

      <div className="flex w-full flex-col gap-[9px] py-[10px]">
        <div className="flex flex-col gap-[9px]">
          {item.credits.map((credit, index) => (
            <ArtistCreditLine key={`${credit.name}-${index}`} {...credit} />
          ))}
        </div>
        {item.title && (
          <p className="font-serif text-[15px] leading-[100%] italic">
            {item.title}
          </p>
        )}
      </div>
    </a>
  );
}

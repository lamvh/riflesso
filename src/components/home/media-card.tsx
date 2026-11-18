"use client";

/* eslint-disable @next/next/no-img-element */
/*
 * Rail cards are sized by `height: var(--rfl-rail-height); width: auto`, so the
 * rendered width comes from each asset's own aspect ratio. next/image needs
 * explicit dimensions (or a `fill` parent of known size) and neither is available
 * here, so a plain <img> is the correct primitive.
 */

import Link from "next/link";

import { useVideoAutoplay } from "@/hooks/use-video-autoplay";
import { describeMedia, type MediaItem } from "@/lib/media-item";
import { optimizedImgProps } from "@/lib/optimized-img-props";

import { ArtistCreditLine } from "./artist-credit-line";

const MEDIA_SIZING = "block h-[var(--rfl-rail-height)] w-auto max-w-none";
/*
 * Cards are --rfl-rail-height (350px) tall, so even a wide frame stays near
 * 560px across; on phones a card is at most most of the screen.
 */
const RAIL_SIZES = "(max-width: 640px) 80vw, 560px";
const CARD = "group flex shrink-0 grow-0 basis-auto flex-col items-start text-left";

/** Where a card without a gallery points, matching the New Signs rail. */
const DIRECTORY_HREF = "/artists";

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

type MediaCardProps = {
  item: MediaItem;
  /** Given by rails that carry a category; without it the card is a link. */
  onOpen?: () => void;
  /** First cards of a rail that is on screen at load: fetch now instead of lazily. */
  eager?: boolean;
};

export function MediaCard({ item, onOpen, eager = false }: MediaCardProps) {
  const label = describeMedia(item);

  const body = (
    <>
      <div className="overflow-hidden">
        {item.kind === "image" ? (
          <img
            {...optimizedImgProps(item.src, RAIL_SIZES)}
            alt={label}
            loading={eager ? "eager" : "lazy"}
            draggable={false}
            className={`${MEDIA_SIZING} transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[var(--rfl-rail-zoom)]`}
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
          <p className="font-serif text-[15px] leading-[100%]">{item.title}</p>
        )}
      </div>
    </>
  );

  if (!onOpen) {
    return (
      <Link href={DIRECTORY_HREF} className={CARD}>
        {body}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onOpen} className={CARD}>
      {body}
    </button>
  );
}

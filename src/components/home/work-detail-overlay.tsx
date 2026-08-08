"use client";

/* eslint-disable @next/next/no-img-element */
/*
 * The stage is sized by `height: var(--twg-gallery-height); width: auto`, so the
 * rendered width comes from each asset's own ratio — the same reason the rail
 * cards use a plain <img> rather than next/image.
 */

import Link from "next/link";
import { useEffect, useState } from "react";

import { CloseIcon } from "@/components/close-icon";
import { useVideoAutoplay } from "@/hooks/use-video-autoplay";
import { describeMedia, type MediaItem } from "@/lib/media-item";
import type { WorkDetail } from "@/lib/work-detail";

/*
 * The frame takes its configured height but never enough to push the caption off
 * screen — 340px covers the thumbnail strip, the gaps, and the credits below.
 */
const STAGE_SIZING =
  "block h-[min(var(--twg-gallery-height),calc(100vh-340px))] w-auto max-w-[92vw] object-contain";

function StageVideo({ src, label }: { src: string; label: string }) {
  const ref = useVideoAutoplay();
  return (
    <video
      ref={ref}
      src={src}
      aria-label={label}
      loop
      muted
      playsInline
      preload="metadata"
      className={STAGE_SIZING}
    />
  );
}

function ThumbnailVideo({ src }: { src: string }) {
  const ref = useVideoAutoplay();
  return (
    <video
      ref={ref}
      src={src}
      loop
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      className="block size-full object-cover"
    />
  );
}

function Thumbnail({
  item,
  index,
  isActive,
  onSelect,
}: {
  item: MediaItem;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Show frame ${index + 1}`}
      aria-pressed={isActive}
      // The active thumbnail is the dimmed one, matching the hero strip.
      className="block h-[95px] w-[75px] overflow-hidden transition-opacity duration-[250ms] ease-in-out"
      style={{ opacity: isActive ? 0.4 : 1 }}
    >
      {item.kind === "image" ? (
        <img
          src={item.src}
          alt=""
          loading="lazy"
          draggable={false}
          className="block size-full object-cover object-center"
        />
      ) : (
        <ThumbnailVideo src={item.src} />
      )}
    </button>
  );
}

type WorkDetailOverlayProps = {
  work: WorkDetail;
  onClose: () => void;
};

/**
 * Full-screen gallery raised over the home page. It mounts fresh on every open
 * — nothing behind it is clickable — so the frame index needs no reset.
 */
export function WorkDetailOverlay({ work, onClose }: WorkDetailOverlayProps) {
  const [index, setIndex] = useState(0);
  const lastFrame = work.media.length - 1;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight")
        setIndex((current) => Math.min(lastFrame, current + 1));
      if (event.key === "ArrowLeft")
        setIndex((current) => Math.max(0, current - 1));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lastFrame, onClose]);

  const current = work.media[index] ?? work.media[0];
  const label = describeMedia(current);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={work.title}
      className="fixed inset-0 z-40 overflow-x-hidden overflow-y-auto overscroll-contain bg-paper"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="fixed top-6 right-7 z-[3] block"
      >
        <CloseIcon />
      </button>

      <div className="flex flex-wrap items-start justify-center gap-[5px] px-5 pt-[44px]">
        {work.media.map((item, frame) => (
          <Thumbnail
            key={`${item.src}-${frame}`}
            item={item}
            index={frame}
            isActive={frame === index}
            onSelect={() => setIndex(frame)}
          />
        ))}
      </div>

      <div className="flex justify-center px-5 pt-[22px]">
        {current.kind === "image" ? (
          <img
            src={current.src}
            alt={label}
            draggable={false}
            className={STAGE_SIZING}
          />
        ) : (
          <StageVideo src={current.src} label={label} />
        )}
      </div>

      <div className="flex flex-col items-start gap-[11px] px-5 pt-[30px] pb-[44px]">
        <p className="font-serif text-[27px] leading-[100%] italic">
          {work.title}
        </p>

        <div className="flex flex-col gap-[5px]">
          {work.credits.map((credit, creditIndex) => (
            <p key={`${credit.name}-${creditIndex}`} className="leading-[100%]">
              <Link
                href="/artists"
                className="font-sans text-[15px] font-bold tracking-[-0.5px]"
              >
                {credit.name}
              </Link>{" "}
              <span className="font-serif text-[15px] tracking-[-0.28px]">
                {credit.roles}
              </span>
            </p>
          ))}
        </div>

        <p className="font-serif text-[13px] leading-[100%] text-[#161616] italic">
          {work.category}
        </p>
      </div>
    </div>
  );
}

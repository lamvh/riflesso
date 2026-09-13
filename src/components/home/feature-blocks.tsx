"use client";

/* eslint-disable @next/next/no-img-element */
/*
 * Both features render at `width: 100%; height: auto`, letting each asset's own
 * ratio set the height. Passing guessed dimensions to next/image would assert a
 * ratio the source design never specifies.
 */

import { describeMedia, type MediaItem } from "@/lib/media-item";
import type { MediaSection } from "@/lib/work-detail";

import { ArtistCreditLine } from "./artist-credit-line";
import { SectionHeading } from "./section-heading";
import { useOpenWork } from "./work-detail-context";

/** Edge-to-edge editorial with its credit block inset by the page gutter. */
export function FeatureEditorial({
  heading,
  item,
  section,
}: {
  heading: string;
  item: MediaItem;
  /** The rail of the same kind; a single-frame album borrows its gallery from it. */
  section: MediaSection;
}) {
  const openWork = useOpenWork();

  return (
    <section className="pt-[70px]">
      <SectionHeading>{heading}</SectionHeading>
      <button
        type="button"
        onClick={() => openWork(item, section)}
        className="block w-full text-left"
      >
        <img
          src={item.src}
          alt={describeMedia(item)}
          loading="lazy"
          draggable={false}
          className="block h-auto w-full object-cover object-center"
        />
        <div className="flex flex-col gap-[9px] px-5 pt-[10px]">
          {item.credits.map((credit, index) => (
            <ArtistCreditLine key={`${credit.name}-${index}`} {...credit} />
          ))}
          <p className="font-serif text-[15px] leading-[100%]">{item.title}</p>
        </div>
      </button>
    </section>
  );
}

/** Banner image, inset rather than full-bleed and with no caption. */
export function FeatureAnniversary({ heading, src }: { heading: string; src: string }) {
  return (
    <section className="pt-[70px]">
      <SectionHeading>{heading}</SectionHeading>
      <a href="#" className="block px-5">
        <img
          src={src}
          alt={heading}
          loading="lazy"
          draggable={false}
          className="block h-auto w-full object-cover object-center"
        />
      </a>
    </section>
  );
}

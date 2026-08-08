"use client";

/* eslint-disable @next/next/no-img-element */
/*
 * Both features render at `width: 100%; height: auto`, letting each asset's own
 * ratio set the height. Passing guessed dimensions to next/image would assert a
 * ratio the source design never specifies.
 */

import { FEATURE_ANNIVERSARY, FEATURE_EDITORIAL } from "@/data/home-features";
import { EDITORIALS_SECTION } from "@/data/home-sections";
import { describeMedia } from "@/lib/media-item";

import { ArtistCreditLine } from "./artist-credit-line";
import { SectionHeading } from "./section-heading";
import { useOpenWork } from "./work-detail-context";

/** Edge-to-edge editorial with its credit block inset by the page gutter. */
export function FeatureEditorial() {
  const { heading, item } = FEATURE_EDITORIAL;
  const openWork = useOpenWork();

  return (
    <section className="pt-[70px]">
      <SectionHeading>{heading}</SectionHeading>
      {/*
       * The feature is not itself in the Editorials rail, so the gallery it opens
       * leads with this frame and continues from the head of that rail.
       */}
      <button
        type="button"
        onClick={() => openWork(item, EDITORIALS_SECTION)}
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

/** Anniversary banner, inset rather than full-bleed and with no caption. */
export function FeatureAnniversary() {
  const { heading, src } = FEATURE_ANNIVERSARY;

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

/* eslint-disable @next/next/no-img-element */
/*
 * Both features render at `width: 100%; height: auto`, letting each asset's own
 * ratio set the height. Passing guessed dimensions to next/image would assert a
 * ratio the source design never specifies.
 */

import { FEATURE_ANNIVERSARY, FEATURE_EDITORIAL } from "@/data/home-features";

import { ArtistCreditLine } from "./artist-credit-line";
import { SectionHeading } from "./section-heading";

/** Edge-to-edge editorial with its credit block inset by the page gutter. */
export function FeatureEditorial() {
  const { heading, src, credit, title } = FEATURE_EDITORIAL;

  return (
    <section className="pt-[70px]">
      <SectionHeading>{heading}</SectionHeading>
      <a href="#" className="block">
        <img
          src={src}
          alt={`${title} — ${credit.name}`}
          loading="lazy"
          draggable={false}
          className="block h-auto w-full object-cover object-center"
        />
        <div className="flex flex-col gap-[9px] px-5 pt-[10px]">
          <ArtistCreditLine {...credit} />
          <p className="font-serif text-[15px] leading-[100%] italic">{title}</p>
        </div>
      </a>
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

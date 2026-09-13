"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { DEFAULT_LOGO_URL } from "@/lib/content/site-content-types";
import { canOptimizeImage, isPublishableSrc } from "@/lib/media-src";

import { SearchIcon } from "./search-icon";

/**
 * Layout box for the wordmark at its largest rendered size, matching the
 * source file's 2233x384 ratio. Declaring the display size rather than the
 * intrinsic size keeps the generated srcset small (128w/256w instead of 3840w).
 */
const WORDMARK_WIDTH = 116;
const WORDMARK_HEIGHT = 20;

/**
 * A few pixels of slack so a rubber-band overscroll or a one-pixel layout shift
 * does not flicker the backdrop on and off at rest.
 */
const SCROLL_THRESHOLD = 8;

/**
 * Every animated property runs on one curve so the backdrop, the scrim, and the
 * text all land together. The easing is the same decelerating curve the rail
 * cards use on hover, which is what makes the two read as one interface.
 */
const EASING = "duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

/** Fixed masthead carrying the centred Riflesso wordmark. */
type SiteHeaderProps = {
  /** Underlines the matching nav item. The home page marks nothing active. */
  currentSection?: "artists";
  /**
   * Set on pages whose first screen is a photograph. The masthead then rides
   * over that picture in white until the page scrolls under it. Pages that open
   * on paper leave this off — white on white reads as nothing at all.
   */
  overImagery?: boolean;
  /** Wordmark from Site settings; anything unusable falls back to the built-in file. */
  logoUrl: string;
  logoAlt: string;
};

export function SiteHeader({
  currentSection,
  overImagery = false,
  logoUrl,
  logoAlt,
}: SiteHeaderProps) {
  const artistsActive = currentSection === "artists";
  const logo = isPublishableSrc(logoUrl) ? logoUrl : DEFAULT_LOGO_URL;
  const [scrolled, setScrolled] = useState(false);

  /* The masthead floats over the hero at rest and only earns its paper backdrop
     once content starts sliding underneath it. */
  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    /* Scroll fires many times between two paints. Coalescing to a single frame
       keeps the wheel path cheap and means the class swap lands on a repaint
       boundary rather than mid-frame, which is what removes the visible step. */
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    // Browsers restore the previous scroll position before this runs.
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /** Over a photograph with nothing scrolled under the bar yet. */
  const floating = overImagery && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 z-30 h-[60px] w-full transition-[background-color,box-shadow] ${EASING} ${
        scrolled
          ? "bg-paper shadow-[0_1px_0_rgba(0,0,0,0.07)]"
          : "bg-transparent shadow-none"
      }`}
    >
      {/*
       * Hero frames run from near-black to blown-out white, so white type needs
       * a floor under it. This scrim is light enough to leave the photograph
       * intact and fades out with everything else once the bar turns to paper.
       */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-[140%] bg-gradient-to-b from-black/35 to-transparent transition-opacity ${EASING} ${
          floating ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`relative flex h-full items-center justify-between px-5 transition-colors ${EASING} ${
          floating
            ? "text-paper [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]"
            : "text-ink [text-shadow:none]"
        }`}
      >
        <Link
          href="/artists"
          aria-current={artistsActive ? "page" : undefined}
          className={`font-sans text-[13px] leading-[94%] font-bold tracking-[-0.5px] sm:text-[15px] ${
            artistsActive
              ? "underline decoration-2 underline-offset-[3px]"
              : "no-underline"
          }`}
        >
          Artists
        </Link>

        <Link
          href="/"
          aria-label={`${logoAlt || "Riflesso"} homepage`}
          className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center"
        >
          {/*
           * The wordmark asset is fixed, so the floating state recolours it in
           * CSS rather than swapping in a second file. Both states name the
           * same three filter functions — a filter list only interpolates
           * against another list of the same shape, and `none` is not one, so
           * spelling out the identity values is what buys the fade.
           */}
          <Image
            src={logo}
            alt=""
            width={WORDMARK_WIDTH}
            height={WORDMARK_HEIGHT}
            priority
            unoptimized={!canOptimizeImage(logo)}
            className={`h-[16px] w-auto sm:h-[20px] transition-[filter] ${EASING} ${
              floating
                ? "brightness-0 invert drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
                : "brightness-100 invert-0 drop-shadow-none"
            }`}
          />
        </Link>

        <button
          type="button"
          className="flex items-center gap-[7px] font-sans text-[13px] leading-[94%] font-bold tracking-[-0.5px] sm:text-[15px]"
        >
          <span>Search</span>
          <SearchIcon size={17} />
        </button>
      </div>
    </header>
  );
}

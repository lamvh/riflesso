"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { HERO_SLIDES } from "@/data/home-hero-slides";

const CYCLE_INTERVAL_MS = 2800;

/** One glyph size for both the layout spacer and every image-filled copy. */
const NUMERAL =
  "font-sans text-[min(31vw,58vh)] leading-[0.78] font-bold tracking-[-0.07em]";

const NAV_LINK =
  "border-b border-ink font-sans text-[15px] leading-[94%] font-bold tracking-[-0.5px]";

/**
 * The 404 numeral is a window onto the hero imagery: each slide is painted as
 * the text's background and clipped to the glyphs, and the stack cross-fades one
 * frame at a time. A hidden copy holds the box open, since every visible copy is
 * absolutely positioned on top of it.
 */
export function NotFoundPanel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setActive((current) => (current + 1) % HERO_SLIDES.length),
      CYCLE_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center overflow-hidden bg-paper">
      <div className="relative inline-block">
        <span className={`${NUMERAL} block invisible`} aria-hidden="true">
          404
        </span>

        {HERO_SLIDES.map((slide, index) => (
          <span
            key={slide.src}
            aria-hidden={index !== active}
            className={`${NUMERAL} absolute top-0 left-0 transition-opacity duration-[1200ms] ease-in-out`}
            style={{
              backgroundImage: `url(${slide.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              opacity: index === active ? 1 : 0,
            }}
          >
            404
          </span>
        ))}
      </div>

      <div className="absolute bottom-[34px] left-5 flex flex-col items-start gap-[11px]">
        <p className="font-serif text-[27px] leading-[100%] italic">
          Page not found
        </p>
        <div className="flex gap-[18px]">
          <Link href="/" className={NAV_LINK}>
            Home
          </Link>
          <Link href="/artists" className={NAV_LINK}>
            Artists
          </Link>
        </div>
      </div>
    </div>
  );
}

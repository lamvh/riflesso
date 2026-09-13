"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { HeroSlide } from "@/data/home-hero-slides";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import { canOptimizeImage } from "@/lib/media-src";

const AUTOPLAY_INTERVAL_MS = 5000;
const HIDE_SCROLLBAR = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

type HeroBannerProps = {
  slides: HeroSlide[];
  /** Off by default, matching the design's `bannerAutoplay` prop. */
  autoplay?: boolean;
};

export function HeroBanner({ slides, autoplay = false }: HeroBannerProps) {
  const [active, setActive] = useState(0);
  const thumbnailsRef = useDragScroll<HTMLDivElement>();
  const count = slides.length;

  useEffect(() => {
    if (!autoplay || count < 2) return;
    const timer = setInterval(
      () => setActive((current) => (current + 1) % count),
      AUTOPLAY_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, [autoplay, count]);

  return (
    <div className="flex h-svh flex-col">
      {/* Slides are stacked and cross-faded; only the active one is focusable. */}
      <div className="relative w-full flex-grow overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = index === active;
          return (
            <a
              key={`${slide.src}-${index}`}
              href="#"
              aria-hidden={!isActive}
              tabIndex={isActive ? 0 : -1}
              className="absolute inset-0 flex items-center justify-center overflow-hidden transition-opacity duration-500 ease-in-out"
              style={{
                opacity: isActive ? 1 : 0,
                visibility: isActive ? "visible" : "hidden",
                color: slide.captionColor,
              }}
            >
              <Image
                src={slide.src}
                alt={`${slide.publication} — ${slide.credits
                  .map((credit) => credit.name.trim())
                  .join(", ")}`}
                fill
                priority={index === 0}
                sizes="100vw"
                draggable={false}
                unoptimized={!canOptimizeImage(slide.src)}
                className="object-cover"
                style={{ objectPosition: slide.position }}
              />

              <div className="absolute inset-x-0 bottom-0 z-[1] mx-auto w-max max-w-full p-[30px]">
                <p className="font-serif text-[15px] leading-[100%]">
                  {slide.credits.map((credit, creditIndex) => (
                    <span key={`${credit.name}-${creditIndex}`}>
                      <strong className="font-sans text-[15px] leading-[94%] font-bold tracking-[-0.5px]">
                        {credit.name}
                      </strong>
                      {credit.role}
                    </span>
                  ))}
                  <em className="italic">{slide.publication}</em>
                </p>
              </div>
            </a>
          );
        })}
      </div>

      <div
        ref={thumbnailsRef}
        className={`mx-auto flex w-fit max-w-full cursor-grab gap-[17px] overflow-x-auto bg-paper px-[18px] pt-3 pb-[31px] ${HIDE_SCROLLBAR}`}
      >
        {slides.map((slide, index) => (
          <button
            key={`${slide.src}-${index}`}
            type="button"
            aria-label={`Show slide ${index + 1}: ${slide.publication}`}
            aria-pressed={index === active}
            onClick={() => setActive(index)}
            className="w-fit shrink-0 grow-0 text-left"
          >
            <p className="mb-[7px] font-sans text-[13px] leading-[92%] font-bold tracking-[-0.4px]">
              {String(index + 1).padStart(2, "0")}
            </p>
            {/* Active thumbnail is dimmed, so the strip reads as "you are here". */}
            <div
              className="relative h-[110px] w-[177px] min-w-[177px]"
              style={{ opacity: index === active ? 0.5 : 1 }}
            >
              <Image
                src={slide.src}
                alt=""
                fill
                sizes="177px"
                draggable={false}
                unoptimized={!canOptimizeImage(slide.src)}
                className="pointer-events-none object-cover object-center"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

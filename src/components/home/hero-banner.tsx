"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";

import type { HeroSlide } from "@/data/home-hero-slides";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import { useHeroAutoplay, useKeepThumbnailInView } from "@/hooks/use-hero-autoplay";
import { DEFAULT_HERO_AUTOPLAY } from "@/lib/content/hero-autoplay";
import { canOptimizeImage } from "@/lib/media-src";

const HIDE_SCROLLBAR = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

type HeroBannerProps = {
  slides: HeroSlide[];
  /** Advance on its own; set on the dashboard (Homepage → Hero banner). */
  autoplay?: boolean;
  /** Seconds per slide while autoplaying. */
  seconds?: number;
};

/** "Publication — Name, Name", leaving out whichever part is empty. */
const slideLabel = (slide: HeroSlide) =>
  [slide.publication.trim(), slide.credits.map((credit) => credit.name.trim()).filter(Boolean).join(", ")]
    .filter(Boolean)
    .join(" — ") || "Hero image";

/** Each screen's crop as a variable; `.rfl-hero-crop` picks one per breakpoint. */
const cropStyle = (slide: HeroSlide) =>
  ({
    "--rfl-pos-desktop": slide.position,
    "--rfl-pos-tablet": slide.positionTablet ?? slide.position,
    "--rfl-pos-mobile": slide.positionMobile ?? slide.positionTablet ?? slide.position,
  }) as CSSProperties;

/**
 * Runs `work` once the page has finished loading and the main thread is idle,
 * so background fetches never compete with the first paint.
 */
function afterLoadIdle(work: () => void) {
  let idle = 0;
  const schedule = () => {
    idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(work, { timeout: 2500 })
        : window.setTimeout(work, 1200);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    window.removeEventListener("load", schedule);
    if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
    window.clearTimeout(idle);
  };
}

export function HeroBanner({ slides, autoplay = false, seconds = DEFAULT_HERO_AUTOPLAY.seconds }: HeroBannerProps) {
  const [active, setActive] = useState(0);
  /*
   * Only the first slide's full-screen frame loads with the page. The others
   * are stacked invisibly on top of it, and since they sit "in view" the
   * browser would fetch them all at once and slow the first one down; they
   * mount once the page has loaded (or as soon as one is picked).
   */
  const [warm, setWarm] = useState(false);
  useEffect(() => afterLoadIdle(() => setWarm(true)), []);
  const thumbnailsRef = useDragScroll<HTMLDivElement>();
  const count = slides.length;

  const rootRef = useHeroAutoplay<HTMLDivElement>({
    strip: thumbnailsRef,
    enabled: autoplay,
    seconds,
    active,
    count,
    setActive,
  });
  useKeepThumbnailInView(thumbnailsRef, active);

  return (
    <div ref={rootRef} className="flex h-svh flex-col">
      {/* Slides are stacked and cross-faded; only the active one is focusable. */}
      <div className="relative w-full flex-grow overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = index === active;
          /*
           * The first frame is the LCP element. Next 16's `priority` sets
           * `loading="eager"` and emits the preload link, but it no longer sets
           * `fetchPriority` on its own (image-component.js passes the prop through
           * verbatim), so the hero requests it explicitly — upgrading both the
           * <img> and that preload link to high priority.
           */
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
              {(index === 0 || isActive || warm) && (
                <Image
                  src={slide.src}
                  alt={slideLabel(slide)}
                  fill
                  priority={index === 0}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  sizes="100vw"
                  draggable={false}
                  unoptimized={!canOptimizeImage(slide.src)}
                  className={`rfl-hero-crop object-cover ${index === 0 ? "rfl-hero-settle" : ""}`}
                  style={cropStyle(slide)}
                />
              )}

              <div className="rfl-intro rfl-intro-2 absolute inset-x-0 bottom-0 z-[1] mx-auto w-max max-w-full p-[30px]">
                <p className="font-serif text-[15px] leading-[100%]">
                  {slide.credits.map((credit, creditIndex) => (
                    <span key={`${credit.name}-${creditIndex}`}>
                      <strong className="font-sans text-[15px] leading-[94%] font-bold tracking-[-0.5px]">
                        {credit.name}
                      </strong>
                      {credit.role}
                    </span>
                  ))}
                  {slide.publication && <em className="italic">{slide.publication}</em>}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      <div
        ref={thumbnailsRef}
        className={`rfl-intro rfl-intro-3 mx-auto flex w-fit max-w-full cursor-grab gap-[17px] overflow-x-auto bg-paper px-[18px] pt-3 pb-[31px] ${HIDE_SCROLLBAR}`}
      >
        {slides.map((slide, index) => (
          <button
            key={`${slide.src}-${index}`}
            type="button"
            aria-label={`Show slide ${index + 1}: ${slideLabel(slide)}`}
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

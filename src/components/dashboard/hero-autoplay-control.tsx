"use client";

import { HERO_AUTOPLAY_LIMITS, type HeroAutoplay } from "@/lib/content/hero-autoplay";

import { Switch } from "./ui/controls";

/**
 * Auto scroll for the hero banner: on/off and seconds per slide. On the site
 * it holds while the tab is in the background, the banner is scrolled away,
 * the thumbnails are hovered, or the visitor prefers reduced motion.
 */
export function HeroAutoplayControl({
  value,
  disabled,
  onChange,
}: {
  value: HeroAutoplay;
  /** No banner, or a single slide: nothing to scroll through. */
  disabled: boolean;
  onChange: (next: HeroAutoplay) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-[18px] gap-y-[10px] rounded-[6px] border border-line px-[12px] py-[10px]">
      <span className="flex items-center gap-[8px] font-sans text-[14px] font-bold">
        Auto scroll
        <Switch
          on={value.on}
          label="Advance the hero banner automatically"
          onClick={() => onChange({ ...value, on: !value.on })}
        />
      </span>
      <label
        className={`flex min-w-[220px] flex-1 items-center gap-[10px] font-sans text-[13px] text-graphite ${
          value.on ? "" : "opacity-50"
        }`}
      >
        Every
        <input
          type="range"
          min={HERO_AUTOPLAY_LIMITS.min}
          max={HERO_AUTOPLAY_LIMITS.max}
          step={1}
          value={value.seconds}
          disabled={!value.on}
          aria-label="Seconds per slide"
          onChange={(event) => onChange({ ...value, seconds: Number(event.target.value) })}
          className="min-w-0 flex-1 accent-[var(--color-ink)]"
        />
        <span className="w-[28px] text-right font-medium text-ink tabular-nums">{value.seconds}s</span>
      </label>
      <p className="w-full font-sans text-[12px] leading-[140%] text-subtle">
        {disabled
          ? "Needs the banner showing with at least two slides."
          : "Pauses while the thumbnails are hovered, the tab is in the background or the banner is scrolled away; off for visitors who prefer reduced motion."}
      </p>
    </div>
  );
}

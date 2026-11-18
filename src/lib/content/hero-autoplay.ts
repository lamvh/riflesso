/*
 * Hero banner autoplay, set on the dashboard (Homepage → Hero banner). Stored
 * as one small jsonb document on site_settings (`hero_autoplay`), like SEO.
 * Older rows, drafts and cached reads may lack it or carry odd values, so
 * every read goes through `withHeroAutoplayDefaults`.
 */

export type HeroAutoplay = {
  /** Advance to the next slide on its own. */
  on: boolean;
  /** Seconds each slide stays before the next one fades in. */
  seconds: number;
};

export const HERO_AUTOPLAY_LIMITS = { min: 3, max: 15 } as const;
export const DEFAULT_HERO_AUTOPLAY: HeroAutoplay = { on: false, seconds: 5 };

const clampSeconds = (value: number) =>
  Math.min(HERO_AUTOPLAY_LIMITS.max, Math.max(HERO_AUTOPLAY_LIMITS.min, Math.round(value)));

/** A complete, in-range autoplay setting from whatever was stored. */
export function withHeroAutoplayDefaults(value: unknown): HeroAutoplay {
  const raw = value && typeof value === "object" ? (value as Partial<Record<keyof HeroAutoplay, unknown>>) : {};
  const seconds = typeof raw.seconds === "number" && Number.isFinite(raw.seconds) ? raw.seconds : DEFAULT_HERO_AUTOPLAY.seconds;
  return { on: raw.on === true, seconds: clampSeconds(seconds) };
}

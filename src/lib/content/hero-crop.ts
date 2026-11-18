/*
 * Hero banner crops, one per screen size. The banner fills the screen above
 * its thumbnail strip, so a wide desktop and a tall phone show very different
 * parts of the same picture. Desktop is the base crop; tablet and mobile may
 * set their own or, left empty, follow the next size up. The thumbnail in the
 * strip under the banner is a fourth, much smaller frame; left empty it
 * follows desktop.
 *
 * A crop is a CSS object-position ("x% y%"): the point of the picture kept in
 * view when the frame is cut down to the screen's shape.
 */

export const HERO_SCREENS = ["desktop", "tablet", "mobile", "thumbnail"] as const;
export type HeroScreen = (typeof HERO_SCREENS)[number];

/**
 * Each frame, used for the dashboard previews. Banner sizes are a typical
 * device of that class minus the thumbnail strip under the banner (~165px);
 * breakpoints live in globals.css (Tailwind md/lg). The thumbnail is the
 * strip's 177 × 110 tile (hero-banner.tsx).
 */
export const HERO_SCREEN_INFO: Record<HeroScreen, { label: string; width: number; height: number }> = {
  desktop: { label: "Desktop", width: 1440, height: 735 },
  tablet: { label: "Tablet", width: 834, height: 947 },
  mobile: { label: "Mobile", width: 390, height: 679 },
  thumbnail: { label: "Thumbnail", width: 177, height: 110 },
};

/** The crop a screen borrows while it has none of its own. */
export const HERO_FALLBACK_OF: Record<HeroScreen, HeroScreen | null> = {
  desktop: null,
  tablet: "desktop",
  mobile: "tablet",
  thumbnail: "desktop",
};

/** Per-screen crops as stored on a slide; '' means "borrow the fallback". */
export type HeroCrops = { pos: string; posTablet?: string; posMobile?: string; posThumb?: string };

export const DEFAULT_HERO_POSITION = "50% 18%";

/** The crop each screen actually uses, with empty ones falling through. */
export function resolveHeroCrops(crops: HeroCrops): Record<HeroScreen, string> {
  const desktop = crops.pos?.trim() || DEFAULT_HERO_POSITION;
  const tablet = crops.posTablet?.trim() || desktop;
  const mobile = crops.posMobile?.trim() || tablet;
  const thumbnail = crops.posThumb?.trim() || desktop;
  return { desktop, tablet, mobile, thumbnail };
}

const CROP_FIELDS = { desktop: "pos", tablet: "posTablet", mobile: "posMobile", thumbnail: "posThumb" } as const;

/** The slide field holding a screen's own crop. */
export const cropField = <S extends HeroScreen>(screen: S): (typeof CROP_FIELDS)[S] => CROP_FIELDS[screen];

/** Nine anchors: corners, edge midpoints and the centre. */
export const HERO_ANCHORS: { value: string; label: string }[] = [
  { value: "0% 0%", label: "Top left" },
  { value: "50% 0%", label: "Top" },
  { value: "100% 0%", label: "Top right" },
  { value: "0% 50%", label: "Left" },
  { value: "50% 50%", label: "Centre" },
  { value: "100% 50%", label: "Right" },
  { value: "0% 100%", label: "Bottom left" },
  { value: "50% 100%", label: "Bottom" },
  { value: "100% 100%", label: "Bottom right" },
];

const clampPercent = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

/** "x% y%" → numbers; keywords and unparsable input read as the centre. */
export function parsePosition(position: string): { x: number; y: number } {
  const words: Record<string, number> = { left: 0, top: 0, center: 50, right: 100, bottom: 100 };
  const parts = position.trim().split(/\s+/);
  const read = (part: string | undefined) => {
    if (!part) return 50;
    if (part in words) return words[part];
    const number = Number.parseFloat(part);
    return Number.isFinite(number) ? clampPercent(number) : 50;
  };
  return { x: read(parts[0]), y: read(parts[1]) };
}

export const formatPosition = (x: number, y: number) => `${clampPercent(x)}% ${clampPercent(y)}%`;

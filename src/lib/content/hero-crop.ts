/*
 * Hero banner crops, one per screen size. The banner fills the screen above
 * its thumbnail strip, so a wide desktop and a tall phone show very different
 * parts of the same picture. Desktop is the base crop; tablet and mobile may
 * set their own or, left empty, follow the next size up.
 *
 * A crop is a CSS object-position ("x% y%"): the point of the picture kept in
 * view when the frame is cut down to the screen's shape.
 */

export const HERO_SCREENS = ["desktop", "tablet", "mobile"] as const;
export type HeroScreen = (typeof HERO_SCREENS)[number];

/**
 * Each screen's banner frame, used for the dashboard previews. Sizes are a
 * typical device of that class minus the thumbnail strip under the banner
 * (~165px). `minWidth` matches the breakpoints in globals.css (Tailwind md/lg).
 */
export const HERO_SCREEN_INFO: Record<
  HeroScreen,
  { label: string; width: number; height: number; minWidth: number }
> = {
  desktop: { label: "Desktop", width: 1440, height: 735, minWidth: 1024 },
  tablet: { label: "Tablet", width: 834, height: 947, minWidth: 768 },
  mobile: { label: "Mobile", width: 390, height: 679, minWidth: 0 },
};

/** Per-screen crops as stored on a slide; '' means "same as the next size up". */
export type HeroCrops = { pos: string; posTablet?: string; posMobile?: string };

export const DEFAULT_HERO_POSITION = "50% 18%";

/** The crop each screen actually uses, with empty ones falling through. */
export function resolveHeroCrops(crops: HeroCrops): Record<HeroScreen, string> {
  const desktop = crops.pos?.trim() || DEFAULT_HERO_POSITION;
  const tablet = crops.posTablet?.trim() || desktop;
  const mobile = crops.posMobile?.trim() || tablet;
  return { desktop, tablet, mobile };
}

/** The slide field holding a screen's own crop. */
export const cropField = (screen: HeroScreen) =>
  screen === "desktop" ? "pos" : screen === "tablet" ? "posTablet" : "posMobile";

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

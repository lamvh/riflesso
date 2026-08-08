import type { CSSProperties } from "react";

import { FeatureAnniversary, FeatureEditorial } from "@/components/home/feature-blocks";
import { HeroBanner } from "@/components/home/hero-banner";
import { MediaRail } from "@/components/home/media-rail";
import { WorkDetailProvider } from "@/components/home/work-detail-context";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { NEW_SIGNS } from "@/data/home-rail-new-signs";
import {
  CAMPAIGNS_SECTION,
  COUTURE_SECTION,
  EDITORIALS_SECTION,
  FASHION_WEEKS_SECTION,
} from "@/data/home-sections";

/**
 * Display knobs the source design exposes as editable props. They reach the rail
 * cards and the work detail gallery as custom properties so a single value drives
 * every card at once.
 */
const DISPLAY = {
  bannerAutoplay: false,
  /** Design range: 236–460px. */
  sliderHeight: 350,
  hoverZoom: true,
  /** Height of the opened gallery frame. Design range: 45–85vh. */
  galleryHeight: 72,
};

const displayVars = {
  "--twg-rail-height": `${DISPLAY.sliderHeight}px`,
  "--twg-rail-zoom": DISPLAY.hoverZoom ? "1.04" : "1",
  "--twg-gallery-height": `${DISPLAY.galleryHeight}vh`,
} as CSSProperties;

export default function HomePage() {
  return (
    <div
      className="flex min-h-svh flex-col overflow-x-hidden"
      style={displayVars}
    >
      <SiteHeader />

      <WorkDetailProvider>
        <main>
          <HeroBanner autoplay={DISPLAY.bannerAutoplay} />

          <section>
            <MediaRail {...EDITORIALS_SECTION} />
            <MediaRail {...CAMPAIGNS_SECTION} />
            <FeatureEditorial />
            <MediaRail {...COUTURE_SECTION} />
            <MediaRail {...FASHION_WEEKS_SECTION} />
            <FeatureAnniversary />
            {/* No category: New Signs cards go to the directory, not a gallery. */}
            <MediaRail heading="New Signs" items={NEW_SIGNS} />
          </section>
        </main>
      </WorkDetailProvider>

      <SiteFooter className="mt-[110px]" />
    </div>
  );
}

import type { CSSProperties } from "react";

import { FeatureAnniversary, FeatureEditorial } from "@/components/home/feature-blocks";
import { HeroBanner } from "@/components/home/hero-banner";
import { MediaRail } from "@/components/home/media-rail";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CAMPAIGNS } from "@/data/home-rail-campaigns";
import { COUTURE } from "@/data/home-rail-couture";
import { EDITORIALS } from "@/data/home-rail-editorials";
import { FASHION_WEEKS } from "@/data/home-rail-fashion-weeks";
import { NEW_SIGNS } from "@/data/home-rail-new-signs";

/**
 * Display knobs the source design exposes as editable props. They reach the rail
 * cards as custom properties so a single value drives every card at once.
 */
const DISPLAY = {
  bannerAutoplay: false,
  /** Design range: 236–460px. */
  sliderHeight: 350,
  hoverZoom: true,
};

const displayVars = {
  "--twg-rail-height": `${DISPLAY.sliderHeight}px`,
  "--twg-rail-zoom": DISPLAY.hoverZoom ? "1.04" : "1",
} as CSSProperties;

export default function HomePage() {
  return (
    <div
      className="flex min-h-svh flex-col overflow-x-hidden"
      style={displayVars}
    >
      <SiteHeader />

      <main>
        <HeroBanner autoplay={DISPLAY.bannerAutoplay} />

        <section>
          <MediaRail heading="Latest Editorials" items={EDITORIALS} />
          <MediaRail heading="Latest Campaigns" items={CAMPAIGNS} />
          <FeatureEditorial />
          <MediaRail
            heading="Paris Haute Couture Fashion Week"
            items={COUTURE}
          />
          <MediaRail heading="Paris & Milan Fashion Weeks" items={FASHION_WEEKS} />
          <FeatureAnniversary />
          <MediaRail heading="New Signs" items={NEW_SIGNS} />
        </section>
      </main>

      <SiteFooter className="mt-[110px]" />
    </div>
  );
}

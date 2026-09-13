import type { CSSProperties } from "react";

import { FeatureAnniversary, FeatureEditorial } from "@/components/home/feature-blocks";
import { HeroBanner } from "@/components/home/hero-banner";
import { MediaRail } from "@/components/home/media-rail";
import { WorkDetailProvider } from "@/components/home/work-detail-context";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildHomeSections, toHeroSlides } from "@/lib/content/home-page-view";
import { getHomeContent, getSiteSettings } from "@/lib/content/public-site-content";

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
  "--rfl-rail-height": `${DISPLAY.sliderHeight}px`,
  "--rfl-rail-zoom": DISPLAY.hoverZoom ? "1.04" : "1",
  "--rfl-gallery-height": `${DISPLAY.galleryHeight}vh`,
} as CSSProperties;

/** Hero slides and sections, in the order and state set on the dashboard. */
export default async function HomePage() {
  const [settings, home] = await Promise.all([getSiteSettings(), getHomeContent()]);
  const slides = toHeroSlides(home.slides);
  const sections = buildHomeSections(home.blocks, home.albums);

  return (
    <div
      className="flex min-h-svh flex-col overflow-x-hidden"
      style={displayVars}
    >
      <SiteHeader overImagery logoUrl={settings.logoUrl} logoAlt={settings.logoAlt} />

      <WorkDetailProvider>
        <main>
          {slides.length > 0 && (
            <HeroBanner slides={slides} autoplay={DISPLAY.bannerAutoplay} />
          )}

          <section>
            {sections.map((section) => {
              switch (section.layout) {
                case "rail":
                  /* No category: New Signs cards go to the directory, not a gallery. */
                  return (
                    <MediaRail
                      key={section.key}
                      heading={section.heading}
                      items={section.items}
                      category={section.category}
                    />
                  );
                case "feature":
                  return (
                    <FeatureEditorial
                      key={section.key}
                      heading={section.heading}
                      item={section.item}
                      section={section.section}
                    />
                  );
                case "banner":
                  return (
                    <FeatureAnniversary
                      key={section.key}
                      heading={section.heading}
                      src={section.src}
                    />
                  );
              }
            })}
          </section>
        </main>
      </WorkDetailProvider>

      <SiteFooter />
    </div>
  );
}

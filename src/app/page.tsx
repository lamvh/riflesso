import type { Metadata } from "next";
import { Suspense, type CSSProperties } from "react";

import { FeatureAnniversary, FeatureEditorial } from "@/components/home/feature-blocks";
import { HeroBanner } from "@/components/home/hero-banner";
import { MediaRail } from "@/components/home/media-rail";
import { WorkDeepLink, type DeepLinkWork } from "@/components/home/work-deep-link";
import { WorkDetailProvider } from "@/components/home/work-detail-context";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildHomeSections, toHeroSlides } from "@/lib/content/home-page-view";
import { getHomeContent, getSiteSettings } from "@/lib/content/public-site-content";
import { isPartShown } from "@/lib/content/site-visibility";
import { pageMetadata } from "@/lib/seo/share-metadata";
import { StructuredData } from "@/components/structured-data";

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

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("home");
}

/** Hero slides and sections, in the order and state set on the dashboard. */
export default async function HomePage() {
  const [settings, home] = await Promise.all([getSiteSettings(), getHomeContent()]);
  const slides = toHeroSlides(home.slides);
  const sections = buildHomeSections(home.blocks, home.albums);
  /* Hidden banner, or every slide hidden: the page opens on paper instead. */
  const showHero = isPartShown(settings, "home:hero") && slides.length > 0;

  return (
    <div
      className="flex min-h-svh flex-col overflow-x-hidden"
      style={displayVars}
    >
      <SiteHeader
        overImagery={showHero}
        logoUrl={settings.logoUrl}
        logoAlt={settings.logoAlt}
        showArtists={isPartShown(settings, "page:artists")}
      />

      <WorkDetailProvider>
        <Suspense fallback={null}>
          <WorkDeepLink works={deepLinkWorks(sections)} />
        </Suspense>
        <main>
          {showHero ? (
            <HeroBanner slides={slides} autoplay={DISPLAY.bannerAutoplay} />
          ) : (
            /* Clears the 60px fixed masthead. */
            <div className="h-[110px]" />
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
      <StructuredData />
    </div>
  );
}

/** Every album a section shows, with the section it opens in, for `/?work=`. */
function deepLinkWorks(sections: ReturnType<typeof buildHomeSections>): DeepLinkWork[] {
  const works = new Map<string, DeepLinkWork>();
  for (const view of sections) {
    /* A rail with no gallery label (New Signs) sends cards to the directory instead. */
    if (view.layout === "rail" && view.category) {
      const section = { heading: view.heading, category: view.category, items: view.items };
      for (const item of view.items) {
        if (item.albumId && !works.has(item.albumId)) works.set(item.albumId, { id: item.albumId, item, section });
      }
    } else if (view.layout === "feature" && view.item.albumId && !works.has(view.item.albumId)) {
      works.set(view.item.albumId, { id: view.item.albumId, item: view.item, section: view.section });
    }
  }
  return [...works.values()];
}


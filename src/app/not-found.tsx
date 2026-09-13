import { NotFoundPanel } from "@/components/not-found-panel";
import { SiteHeader } from "@/components/site-header";
import { getHeroFrames, getSiteSettings } from "@/lib/content/public-site-content";

/**
 * The panel is a fixed, full-viewport sheet under the masthead — the masthead
 * stays reachable and the footer sits behind it, exactly as in the design, so
 * this page renders nothing else.
 */
export default async function NotFound() {
  const [settings, frames] = await Promise.all([getSiteSettings(), getHeroFrames()]);

  return (
    <div className="min-h-svh overflow-x-hidden">
      <SiteHeader overImagery logoUrl={settings.logoUrl} logoAlt={settings.logoAlt} />
      <NotFoundPanel frames={frames.filter(Boolean)} />
    </div>
  );
}

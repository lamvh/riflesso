import { NotFoundPanel } from "@/components/not-found-panel";
import { SiteHeader } from "@/components/site-header";

/**
 * The panel is a fixed, full-viewport sheet under the masthead — the masthead
 * stays reachable and the footer sits behind it, exactly as in the design, so
 * this page renders nothing else.
 */
export default function NotFound() {
  return (
    <div className="min-h-svh overflow-x-hidden">
      <SiteHeader />
      <NotFoundPanel />
    </div>
  );
}

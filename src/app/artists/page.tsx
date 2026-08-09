import type { Metadata } from "next";

import { ArtistsDirectory } from "@/components/artists-directory";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "The Wall Group — Artists",
  description:
    "The Wall Group represents hair, makeup, styling, grooming and manicure artists across the US and Europe.",
};

export default function ArtistsPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader currentSection="artists" />
      <main>
        <ArtistsDirectory />
      </main>
      <SiteFooter />
    </div>
  );
}

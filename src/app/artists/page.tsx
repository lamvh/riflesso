import type { Metadata } from "next";

import { ArtistsDirectory } from "@/components/artists-directory";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { toDirectory } from "@/lib/content/directory-view";
import { getDirectoryContent, getSiteSettings } from "@/lib/content/public-site-content";

export async function generateMetadata(): Promise<Metadata> {
  const { metaTitle, metaDescription } = await getSiteSettings();
  return { title: `${metaTitle} — Artists`, description: metaDescription };
}

export default async function ArtistsPage() {
  const [settings, content] = await Promise.all([getSiteSettings(), getDirectoryContent()]);
  const { artists, categories } = toDirectory(content.artists, content.cats);

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader
        currentSection="artists"
        logoUrl={settings.logoUrl}
        logoAlt={settings.logoAlt}
      />
      <main>
        <ArtistsDirectory artists={artists} categories={categories} />
      </main>
      <SiteFooter />
    </div>
  );
}

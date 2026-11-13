import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContactGrid } from "@/components/contact-grid";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContactCards, getSiteSettings } from "@/lib/content/public-site-content";
import { isPartShown } from "@/lib/content/site-visibility";
import { pageMetadata } from "@/lib/seo/share-metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("contact");
}

export default async function ContactPage() {
  const [settings, cards] = await Promise.all([getSiteSettings(), getContactCards()]);
  if (!isPartShown(settings, "page:contact")) notFound();

  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden">
      <SiteHeader
        logoUrl={settings.logoUrl}
        logoAlt={settings.logoAlt}
        showArtists={isPartShown(settings, "page:artists")}
      />

      <main>
        {/*
         * With no copy above it the grid needs its own lead-in, so the spacer and
         * the grid's 90px padding together match About's 200px top offset.
         */}
        <div className="h-[110px]" />
        <ContactGrid variant="contact" cards={cards} />
      </main>

      <SiteFooter />
    </div>
  );
}

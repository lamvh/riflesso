import type { Metadata } from "next";

import { ContactGrid } from "@/components/contact-grid";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContactCards, getSiteSettings } from "@/lib/content/public-site-content";

export async function generateMetadata(): Promise<Metadata> {
  const [{ metaTitle }, cards] = await Promise.all([getSiteSettings(), getContactCards()]);
  return {
    title: `${metaTitle} — Contact`,
    description: `Offices and enquiries: ${cards.map((card) => card.heading).join(", ")}.`,
  };
}

export default async function ContactPage() {
  const [settings, cards] = await Promise.all([getSiteSettings(), getContactCards()]);

  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden">
      <SiteHeader logoUrl={settings.logoUrl} logoAlt={settings.logoAlt} />

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

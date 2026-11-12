import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContactGrid } from "@/components/contact-grid";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContactCards, getSiteSettings } from "@/lib/content/public-site-content";
import { isPartShown } from "@/lib/content/site-visibility";

export async function generateMetadata(): Promise<Metadata> {
  const { metaTitle, aboutParagraphs } = await getSiteSettings();
  return {
    title: `${metaTitle} — About`,
    description: aboutParagraphs[0],
  };
}

const COPY = "font-serif text-[24px] leading-[132%] text-pretty";

export default async function AboutPage() {
  const [settings, cards] = await Promise.all([getSiteSettings(), getContactCards()]);
  if (!isPartShown(settings, "page:about")) notFound();

  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden">
      <SiteHeader
        logoUrl={settings.logoUrl}
        logoAlt={settings.logoAlt}
        showArtists={isPartShown(settings, "page:artists")}
      />

      <main>
        {/* The copy column is capped well short of the grid below it. */}
        {isPartShown(settings, "about:copy") ? (
          <div className="px-5 pt-[200px]">
            <div className="flex max-w-[1000px] flex-col gap-[26px]">
              {settings.aboutParagraphs.map((paragraph, index) => (
                <p key={index} className={COPY}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ) : (
          /* Same lead-in Contact uses, so the grid still clears the masthead. */
          <div className="h-[110px]" />
        )}

        {isPartShown(settings, "about:contacts") && <ContactGrid variant="about" cards={cards} />}
      </main>

      <SiteFooter />
    </div>
  );
}

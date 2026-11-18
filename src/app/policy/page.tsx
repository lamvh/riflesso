import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PolicyMarkdown } from "@/components/policy-markdown";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { parsePolicyMarkdown, policySections } from "@/lib/content/policy-markdown";
import { getSiteSettings } from "@/lib/content/public-site-content";
import { formatPolicyDate } from "@/lib/content/site-policy";
import { isPartShown } from "@/lib/content/site-visibility";
import { pageMetadata } from "@/lib/seo/share-metadata";
import { staggerStyle } from "@/lib/stagger-style";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("policy");
}

/**
 * Privacy, cookies and terms on one page, written on the dashboard (Site →
 * Policy). From `lg` a list of its sections sits beside the text; the footer
 * links straight to them (/policy#privacy, #cookies, #terms-of-use).
 */
export default async function PolicyPage() {
  const settings = await getSiteSettings();
  if (!isPartShown(settings, "page:policy")) notFound();

  const { title, updated, body } = settings.policy;
  const blocks = parsePolicyMarkdown(body);
  const sections = policySections(blocks);
  const date = formatPolicyDate(updated);

  return (
    <div className="rfl-page flex min-h-svh flex-col overflow-x-hidden">
      <SiteHeader
        logoUrl={settings.logoUrl}
        logoAlt={settings.logoAlt}
        showArtists={isPartShown(settings, "page:artists")}
      />

      <main className="px-5 pt-[200px]">
        <header className="rfl-intro flex max-w-[1000px] flex-col gap-[14px]" style={staggerStyle(0)}>
          <h1 className="font-sans text-[clamp(40px,7vw,72px)] leading-[94%] font-bold tracking-[-0.05em]">
            {title.trim() || "Policy"}
          </h1>
          {date && (
            <p className="font-sans text-[14px] leading-[94%] font-bold tracking-[-0.5px] text-black/50">
              Last updated {date}
            </p>
          )}
        </header>

        <div className="mt-[60px] grid gap-[40px] lg:grid-cols-[220px_minmax(0,720px)] lg:gap-[80px]">
          {sections.length > 1 ? (
            <nav aria-label="On this page" className="rfl-intro hidden lg:block" style={staggerStyle(1)}>
              <ul className="sticky top-[120px] m-0 flex list-none flex-col gap-[10px] p-0">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="font-sans text-[14px] leading-[110%] font-bold tracking-[-0.5px] hover:underline"
                    >
                      {section.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <div className="hidden lg:block" />
          )}

          <article className="rfl-intro min-w-0" style={staggerStyle(2)}>
            <PolicyMarkdown blocks={blocks} />
          </article>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

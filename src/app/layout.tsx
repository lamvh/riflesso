import type { Metadata } from "next";
import { draftMode } from "next/headers";

import { ContentPreviewBanner } from "@/components/content-preview-banner";
import { PageViewTracker } from "@/components/page-view-tracker";

import { getSiteSettings } from "@/lib/content/public-site-content";
import { logoCardUrl } from "@/lib/seo/share-metadata";
import { siteUrl } from "@/lib/seo/site-url";

import "./globals.css";

/**
 * Site-wide defaults from Site settings. Each public page then sets its own
 * title, description, canonical URL and preview (see share-metadata.ts);
 * what is here covers everything else — the 404, verification tags, and the
 * base every relative URL in the metadata is resolved against.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const { metaTitle, metaDescription, brandName, seo } = settings;
  return {
    metadataBase: siteUrl(),
    title: metaTitle,
    description: metaDescription,
    applicationName: brandName,
    verification: {
      google: seo.googleVerification.trim() || undefined,
      other: seo.bingVerification.trim() ? { "msvalidate.01": seo.bingVerification.trim() } : undefined,
    },
    facebook: seo.facebookAppId.trim() ? { appId: seo.facebookAppId.trim() } : undefined,
    openGraph: {
      type: "website",
      siteName: brandName,
      locale: seo.locale,
      images: [{ url: logoCardUrl(settings), width: 1200, height: 630, alt: brandName }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* The dashboard sets its theme on <html> before hydration (see
       admin-theme-script.ts); that one attribute is expected to differ. */
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <PageViewTracker />
        {(await draftMode()).isEnabled && <ContentPreviewBanner />}
      </body>
    </html>
  );
}

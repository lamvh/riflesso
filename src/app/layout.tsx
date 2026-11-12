import type { Metadata } from "next";
import { draftMode } from "next/headers";

import { ContentPreviewBanner } from "@/components/content-preview-banner";
import { PageViewTracker } from "@/components/page-view-tracker";

import { getSiteSettings } from "@/lib/content/public-site-content";

import "./globals.css";

/** Default title and description from Site settings; pages may override. */
export async function generateMetadata(): Promise<Metadata> {
  const { metaTitle, metaDescription } = await getSiteSettings();
  return { title: metaTitle, description: metaDescription };
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

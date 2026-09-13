import type { Metadata } from "next";

import { getSiteSettings } from "@/lib/content/public-site-content";

import "./globals.css";

/** Default title and description from Site settings; pages may override. */
export async function generateMetadata(): Promise<Metadata> {
  const { metaTitle, metaDescription } = await getSiteSettings();
  return { title: metaTitle, description: metaDescription };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

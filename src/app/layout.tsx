import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Riflesso",
  description:
    "Riflesso represents hair, makeup, styling, grooming and manicure artists across the US and UK.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

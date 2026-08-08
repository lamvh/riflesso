import type { Metadata } from "next";

import { ContactGrid } from "@/components/contact-grid";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "The Wall Group — Contact",
  description:
    "Offices in New York, Los Angeles, London and Nashville, plus careers, new business and representation enquiries.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden">
      <SiteHeader />

      <main>
        {/*
         * With no copy above it the grid needs its own lead-in, so the spacer and
         * the grid's 90px padding together match About's 200px top offset.
         */}
        <div className="h-[110px]" />
        <ContactGrid variant="contact" />
      </main>

      <SiteFooter />
    </div>
  );
}

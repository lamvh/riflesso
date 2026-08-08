import type { Metadata } from "next";

import { ContactGrid } from "@/components/contact-grid";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "The Wall Group — About",
  description:
    "The Wall Group is a fully integrated management company championing creative talent through effective, career elevating representation.",
};

const INLINE_LINK = "border-b border-ink";
const COPY = "font-serif text-[24px] leading-[132%] text-pretty";

export default function AboutPage() {
  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden">
      <SiteHeader />

      <main>
        {/* The copy column is capped well short of the grid below it. */}
        <div className="px-5 pt-[200px]">
          <div className="flex max-w-[1000px] flex-col gap-[26px]">
            <p className={COPY}>
              The Wall Group is a fully integrated management company championing
              creative talent through effective, career elevating representation.
              With offices in New York, Los Angeles, Nashville, and London, our
              team represents the industry’s most influential fashion stylists,
              hairstylists, makeup artists, manicurists and production designers.
              Services including editorial and commercial bookings, endorsement
              and sponsorship management, and trend-focused brand consulting allow
              The Wall Group to drive the careers of fashion’s foremost creators.
              As an industry leader, The Wall Group uses its position to advocate
              for important social causes, including a commitment to expanding
              representation and industry education for historically
              underrepresented talent through the{" "}
              <a
                href="https://wmefashion.com/the-incubator-2025/"
                className={INLINE_LINK}
              >
                WME Fashion Incubator
              </a>{" "}
              program and the promotion of environmental conservation through
              business and not-for-profit ventures.
            </p>
            <p className={COPY}>
              The Wall Group is part of{" "}
              <a href="https://wmefashion.com/" className={INLINE_LINK}>
                WME Fashion
              </a>
              , a division of{" "}
              <a href="https://www.wmeagency.com/" className={INLINE_LINK}>
                WME
              </a>
              , the world’s preeminent talent agency.
            </p>
          </div>
        </div>

        <ContactGrid variant="about" />
      </main>

      <SiteFooter />
    </div>
  );
}

import type { Metadata } from "next";

import { ContactGrid } from "@/components/contact-grid";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Riflesso — About",
  description:
    "Riflesso is a fully integrated management company championing creative talent through effective, career elevating representation.",
};

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
              Riflesso Studio is a creative production house and artist
              management company working across fashion, beauty and portraiture.
              From studios in Ho Chi Minh City and Hanoi, our team represents
              photographers, stylists, hairstylists, makeup artists and set
              designers, and produces the editorial, campaign and runway work
              they are commissioned for. Services spanning casting, production,
              post and brand consulting let us carry a shoot from the first
              reference through to the printed page.
            </p>
            <p className={COPY}>
              The studio takes its name from the Italian for reflection. Every
              commission starts with the same question — what is this image
              reflecting back? We build our work around long collaborations with
              a small roster of artists, and we invest in the next generation of
              Vietnamese talent through assisting placements, mentorship and open
              studio days.
            </p>
          </div>
        </div>

        <ContactGrid variant="about" />
      </main>

      <SiteFooter />
    </div>
  );
}

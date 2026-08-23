"use client";

import type { Block } from "@/lib/dashboard/admin-types";

import { useAdmin } from "../admin-store";
import { CoverImage } from "../cover-image";
import { HeroEditor } from "../hero-editor";
import { SectionList } from "../section-list";

/** Height of a section's band in the wireframe preview, by what it renders as. */
const BAND_HEIGHT: Record<Block["kind"], string> = {
  "Scroll row": "26px",
  Banner: "20px",
  "Full-bleed": "46px",
};

const bandCells = (kind: Block["kind"]) => (kind === "Scroll row" ? 4 : 1);

export function HomepageScreen() {
  const { state, dispatch } = useAdmin();
  const current = Math.min(state.slide, Math.max(0, state.slides.length - 1));
  const hero = state.slides[current];
  const liveBlocks = state.blocks.filter((block) => block.on);

  return (
    <section className="grid grid-cols-[minmax(0,1fr)_268px] items-start gap-[32px] px-[28px] pt-[24px] pb-[60px]">
      <div className="flex min-w-0 flex-col gap-[38px]">
        <HeroEditor slides={state.slides} current={current} dispatch={dispatch} />
        <SectionList
          blocks={state.blocks}
          albums={state.albums}
          dispatch={dispatch}
        />
      </div>

      {/* A wireframe of the page as it currently stands, not a live render. */}
      <div className="sticky top-[118px] border border-ink">
        <div className="flex items-center justify-between gap-[10px] border-b border-ink px-[14px] py-[12px]">
          <p className="font-sans text-[11px] leading-none font-bold tracking-[0.08em] uppercase">
            Page preview
          </p>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="border-b border-ink font-sans text-[11px] leading-none font-bold tracking-[-0.2px]"
          >
            Open
          </a>
        </div>

        <div className="flex flex-col gap-[8px] bg-shell p-[12px]">
          <div className="relative h-[96px] overflow-hidden bg-well">
            {hero && <CoverImage src={hero.src} pos={hero.pos} />}
            <span
              className="absolute inset-x-0 bottom-[5px] text-center font-serif text-[9px] leading-none"
              style={{ color: hero?.ink }}
            >
              {hero?.pub}
            </span>
          </div>

          {liveBlocks.map((block) => (
            <div key={block.label} className="flex flex-col gap-[4px]">
              <p className="font-sans text-[10px] leading-none font-bold tracking-[-0.3px]">
                {block.label}
              </p>
              <div className="flex gap-[4px]">
                {Array.from({ length: bandCells(block.kind) }, (_, cell) => (
                  <span
                    key={cell}
                    className="flex-1 bg-[#dcdcdc]"
                    style={{ height: BAND_HEIGHT[block.kind] }}
                  />
                ))}
              </div>
            </div>
          ))}

          {liveBlocks.length === 0 && (
            <p className="px-[2px] py-[12px] font-serif text-[13px] leading-[120%] text-subtle">
              All sections are switched off — only the hero banner shows.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import type { Block } from "@/lib/dashboard/admin-types";

import { useAdmin } from "../admin-store";
import { CoverImage } from "../cover-image";
import { HeroEditor } from "../hero-editor";
import { SectionList } from "../section-list";
import { buttonClass } from "../ui/controls";
import { Panel } from "../ui/panel";

/** Height of a section's band in the outline, by what it renders as. */
const BAND_HEIGHT: Record<Block["kind"], string> = {
  "Scroll row": "24px",
  Banner: "18px",
  "Full-bleed": "42px",
};

const bandCells = (kind: Block["kind"]) => (kind === "Scroll row" ? 4 : 1);

export function HomepageScreen() {
  const { state, dispatch } = useAdmin();
  const current = Math.min(state.slide, Math.max(0, state.slides.length - 1));
  const hero = state.slides[current];
  const liveBlocks = state.blocks.filter((block) => block.on);

  return (
    <div className="grid items-start gap-[16px] xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex min-w-0 flex-col gap-[16px]">
        <HeroEditor slides={state.slides} current={current} dispatch={dispatch} />
        <SectionList blocks={state.blocks} albums={state.albums} dispatch={dispatch} />
      </div>

      {/* An outline of the page as it currently stands, not a live render. */}
      <aside className="xl:sticky xl:top-[104px]">
        <Panel
          title="Page outline"
          description="Top to bottom"
          action={
            <a href="/" target="_blank" rel="noreferrer" className={buttonClass("ghost", "sm")}>
              Open
            </a>
          }
          bodyClassName="flex flex-col gap-[10px] bg-hover p-[12px]"
        >
          <div className="relative h-[100px] overflow-hidden rounded-[2px] bg-well">
            {hero && <CoverImage src={hero.src} pos={hero.pos} />}
            <span
              className="absolute inset-x-0 bottom-[6px] text-center font-serif text-[10px] leading-none italic"
              style={{ color: hero?.ink }}
            >
              {hero?.pub}
            </span>
          </div>

          {liveBlocks.map((block) => (
            <div key={block.id} className="flex flex-col gap-[5px]">
              <p className="truncate font-sans text-[11px] leading-none font-bold">{block.label}</p>
              <div className="flex gap-[4px]">
                {Array.from({ length: bandCells(block.kind) }, (_, cell) => (
                  <span
                    key={cell}
                    className="flex-1 rounded-[1px] bg-[#d9d9d6]"
                    style={{ height: BAND_HEIGHT[block.kind] }}
                  />
                ))}
              </div>
            </div>
          ))}

          {liveBlocks.length === 0 && (
            <p className="px-[2px] py-[10px] font-sans text-[13px] leading-[140%] text-graphite">
              Every section is switched off, so only the hero banner shows.
            </p>
          )}
        </Panel>
      </aside>
    </div>
  );
}

"use client";

import type { HeroAutoplay } from "@/lib/content/hero-autoplay";
import { resolveHeroCrops } from "@/lib/content/hero-crop";
import { plural } from "@/lib/dashboard/admin-changes";
import type { AdminAction } from "@/lib/dashboard/admin-reducer";
import type { Slide } from "@/lib/dashboard/admin-types";

import { CoverImage } from "./cover-image";
import { HeroAutoplayControl } from "./hero-autoplay-control";
import { HeroCropWorkspace } from "./hero-crop-workspace";
import { Button, Segmented, StatusPill, Switch, buttonClass } from "./ui/controls";
import { LabelledField, NameInput, ProseInput } from "./ui/fields";
import { ArrowUpIcon, PlusIcon } from "./ui/icons";
import { SortableItem, SortableList } from "./ui/sortable-list";
import { UploadButton } from "./ui/upload-button";
import { MediaLibraryButton } from "./ui/media-library-picker";
import { Panel } from "./ui/panel";

const INKS: { value: string; label: string }[] = [
  { value: "#fff", label: "Light" },
  { value: "#000", label: "Dark" },
];

export function HeroEditor({
  slides,
  current,
  bannerShown,
  onToggleBanner,
  autoplay,
  onAutoplayChange,
  dispatch,
}: {
  slides: Slide[];
  /** Auto scroll setting for the banner on the site. */
  autoplay: HeroAutoplay;
  onAutoplayChange: (next: HeroAutoplay) => void;
  /** Whether the whole banner shows; switched off it keeps every slide. */
  bannerShown: boolean;
  onToggleBanner: () => void;
  /** Index of the slide being edited, already clamped to the list. */
  current: number;
  dispatch: (action: AdminAction) => void;
}) {
  const slide = slides[current];
  const set = (patch: Partial<Slide>) => dispatch({ type: "slide/set", patch });

  const remove = () => {
    if (window.confirm(`Remove the ${slide.pub || "untitled"} slide from the banner?`)) {
      dispatch({ type: "slide/remove" });
    }
  };

  return (
    <Panel
      title="Hero banner"
      description={
        bannerShown
          ? `${plural(slides.filter((entry) => !entry.hidden).length, "slide")} rotating at the top of the homepage`
          : "Hidden — the homepage opens on its first section"
      }
      action={
        <div className="flex items-center gap-[10px]">
          <span className="flex items-center gap-[8px] font-sans text-[13px] text-graphite">
            Show banner
            <Switch on={bannerShown} label="Show the hero banner" onClick={onToggleBanner} />
          </span>
          <Button size="sm" onClick={() => dispatch({ type: "slide/add" })}>
            <PlusIcon />
            Add slide
          </Button>
        </div>
      }
      bodyClassName="flex flex-col gap-[18px] p-[20px]"
    >
      <HeroAutoplayControl
        value={autoplay}
        disabled={!bannerShown || slides.filter((entry) => !entry.hidden && entry.src).length < 2}
        onChange={onAutoplayChange}
      />
      <SortableList
        layout="horizontal"
        ids={slides.map((entry) => entry.id)}
        onReorder={(from, to) => dispatch({ type: "list/reorder", list: "slides", from, to })}
      >
      <div className="-mx-[20px] flex gap-[10px] overflow-x-auto px-[20px] pt-[2px] pb-[4px]">
        {slides.map((entry, index) => {
          const active = index === current;
          return (
            <SortableItem key={entry.id} id={entry.id} as="div" className="shrink-0 rounded-[6px]">
            {({ handleProps }) => (
            <button
              type="button"
              {...handleProps}
              aria-pressed={active}
              aria-roledescription="sortable slide"
              title="Click to edit, drag to reorder"
              onClick={() => dispatch({ type: "slide/select", index })}
              className="flex w-[120px] shrink-0 cursor-pointer touch-manipulation flex-col gap-[6px] text-left"
            >
              <span
                className={`relative block aspect-177/110 overflow-hidden rounded-[6px] bg-well transition-opacity ${
                  active ? "shadow-[0_0_0_2px_var(--color-ink)]" : "opacity-70 hover:opacity-100"
                }`}
              >
                <CoverImage src={entry.src} pos={resolveHeroCrops(entry).thumbnail} dim={entry.hidden ? 0.35 : 1} />
                {entry.hidden && (
                  <span className="absolute right-[4px] bottom-[4px] rounded-[4px] bg-paper/90 px-[5px] py-[3px] font-sans text-[11px] leading-none font-bold">
                    Hidden
                  </span>
                )}
                <span className="absolute top-[4px] left-[4px] rounded-[4px] bg-paper/90 px-[5px] py-[3px] font-sans text-[11px] leading-none font-bold tabular-nums">
                  {index + 1}
                </span>
              </span>
              <span
                className={`truncate font-sans text-[12px] leading-[120%] ${
                  active ? "font-bold" : "font-medium text-graphite"
                }`}
              >
                {entry.pub || "Untitled"}
              </span>
            </button>
            )}
            </SortableItem>
          );
        })}
      </div>
      </SortableList>

      {slide ? (
        <div className="flex flex-col gap-[20px]">
          {/* Full width, so the picture and every rendered crop sit side by side. */}
          <HeroCropWorkspace slide={slide} onChange={set} />

          <div className="grid min-w-0 items-start gap-[16px] border-t border-line pt-[18px] lg:grid-cols-2">
            <div className="flex items-center justify-between gap-[12px] rounded-[6px] border border-line px-[12px] py-[10px] lg:col-span-2">
              <span className="flex items-center gap-[8px] font-sans text-[14px] font-bold">
                Show this slide
                {slide.hidden && <StatusPill tone="draft">Hidden</StatusPill>}
              </span>
              <Switch
                on={!slide.hidden}
                label={`Show the ${slide.pub || "untitled"} slide in the banner`}
                onClick={() => set({ hidden: !slide.hidden })}
              />
            </div>

            <LabelledField label="Publication" hint="Optional — left empty, the caption shows only the credits">
              <NameInput
                value={slide.pub}
                placeholder="e.g. Vogue UK"
                onChange={(pub) => set({ pub })}
              />
            </LabelledField>

            <LabelledField label="Credit line" hint="Name — Role, separated by commas">
              <ProseInput
                value={slide.credit}
                placeholder="May Truong — Hair"
                onChange={(credit) => set({ credit })}
              />
            </LabelledField>

            <div className="flex flex-wrap gap-[16px]">
              <LabelledField label="Caption colour">
                <Segmented label="Caption colour" options={INKS} value={slide.ink} onChange={(ink) => set({ ink })} />
              </LabelledField>
            </div>

            <LabelledField label="Image address" hint="A path under /assets or an https:// link">
              <ProseInput value={slide.src} placeholder="https://…" onChange={(src) => set({ src })} />
              <div className="flex flex-wrap gap-[6px]">
                <UploadButton onUploaded={(src) => set({ src })} className={buttonClass("secondary", "sm")}>
                  Upload a file
                </UploadButton>
                <MediaLibraryButton onPick={(src) => set({ src })} className={buttonClass("ghost", "sm")} />
              </div>
            </LabelledField>

            <div className="flex flex-wrap items-center gap-[6px] border-t border-line pt-[14px] lg:col-span-2">
              <Button
                size="sm"
                disabled={current === 0}
                onClick={() => dispatch({ type: "slide/move", delta: -1 })}
              >
                <ArrowUpIcon className="-rotate-90" />
                Move earlier
              </Button>
              <Button
                size="sm"
                disabled={current === slides.length - 1}
                onClick={() => dispatch({ type: "slide/move", delta: 1 })}
              >
                <ArrowUpIcon className="rotate-90" />
                Move later
              </Button>
              <Button size="sm" variant="danger" className="ml-auto" onClick={remove}>
                Remove slide
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="font-sans text-[14px] text-graphite">
          No slides yet. Add one to show a banner at the top of the homepage.
        </p>
      )}
    </Panel>
  );
}

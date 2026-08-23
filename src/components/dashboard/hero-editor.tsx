"use client";

import type { AdminAction } from "@/lib/dashboard/admin-reducer";
import type { Slide } from "@/lib/dashboard/admin-types";

import { CoverImage } from "./cover-image";
import { Chip, OutlineButton, UnderlineButton } from "./ui/controls";
import { LabelledField, NameInput, ProseInput } from "./ui/fields";
import { ImagePickButton } from "./ui/image-pick";

const INKS = [
  { label: "Light", value: "#fff" },
  { label: "Dark", value: "#000" },
];

/** The three crops the design offers, rather than free-typed object-position. */
const CROPS = [
  { label: "Top", value: "50% 10%" },
  { label: "Centre", value: "50% 45%" },
  { label: "Bottom", value: "50% 85%" },
];

export function HeroEditor({
  slides,
  current,
  dispatch,
}: {
  slides: Slide[];
  /** Index of the slide being edited, already clamped to the list. */
  current: number;
  dispatch: (action: AdminAction) => void;
}) {
  const slide = slides[current];
  const set = (patch: Partial<Slide>) => dispatch({ type: "slide/set", patch });

  return (
    <div>
      <div className="flex items-end justify-between gap-5 border-b border-ink pb-[12px]">
        <div>
          <h2 className="font-sans text-[22px] leading-[95%] font-bold tracking-[-1.1px]">
            Hero banner
          </h2>
          <p className="mt-[7px] font-serif text-[15px] leading-none text-dim">
            {slides.length} slides in rotation · click a thumbnail to edit
          </p>
        </div>
        <OutlineButton onClick={() => dispatch({ type: "slide/add" })}>
          + Add slide
        </OutlineButton>
      </div>

      {slide && (
        <div className="mt-[18px] grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-start gap-[22px]">
          <div className="relative aspect-16/10 overflow-hidden bg-well">
            <CoverImage src={slide.src} pos={slide.pos} />
            <div className="absolute inset-x-0 bottom-0 flex justify-center bg-linear-to-t from-black/45 to-transparent p-[18px]">
              <p
                className="text-center font-serif text-[14px] leading-[120%]"
                style={{ color: slide.ink }}
              >
                {slide.credit} · {slide.pub}
              </p>
            </div>
            <span className="absolute top-[10px] left-[10px] bg-paper px-[8px] py-[4px] font-sans text-[10px] leading-none font-bold tracking-[0.06em] uppercase">
              Slide {current + 1}
            </span>
          </div>

          <div className="flex min-w-0 flex-col gap-[16px]">
            <LabelledField label="Publication">
              <NameInput
                size={16}
                value={slide.pub}
                placeholder="e.g. Vogue UK"
                onChange={(pub) => set({ pub })}
              />
            </LabelledField>

            <LabelledField label="Credit line">
              <ProseInput
                value={slide.credit}
                placeholder="Artist — Role"
                onChange={(credit) => set({ credit })}
              />
            </LabelledField>

            <LabelledField label="Caption colour" gap={8}>
              <div className="flex gap-[6px]">
                {INKS.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    active={slide.ink === option.value}
                    onClick={() => set({ ink: option.value })}
                  />
                ))}
              </div>
            </LabelledField>

            <LabelledField label="Crop focus" gap={8}>
              <div className="flex gap-[6px]">
                {CROPS.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    active={slide.pos === option.value}
                    onClick={() => set({ pos: option.value })}
                  />
                ))}
              </div>
            </LabelledField>

            <LabelledField label="Frame" gap={8}>
              <ImagePickButton
                onPick={(src) => set({ src })}
                className="flex h-[40px] items-center justify-center border border-dashed border-ink bg-shell font-sans text-[12px] leading-none font-bold tracking-[-0.3px]"
              >
                Replace image
              </ImagePickButton>
            </LabelledField>

            <div className="flex gap-[8px] pt-[4px]">
              <OutlineButton onClick={() => dispatch({ type: "slide/move", delta: -1 })}>
                ← Move earlier
              </OutlineButton>
              <OutlineButton onClick={() => dispatch({ type: "slide/move", delta: 1 })}>
                Move later →
              </OutlineButton>
              <span className="ml-auto self-center">
                <UnderlineButton muted onClick={() => dispatch({ type: "slide/remove" })}>
                  Remove
                </UnderlineButton>
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-[18px] flex gap-[10px] overflow-x-auto pb-[4px] [scrollbar-width:none]">
        {slides.map((entry, index) => (
          <button
            key={`${entry.src}-${index}`}
            type="button"
            onClick={() => dispatch({ type: "slide/select", index })}
            className="flex w-[126px] shrink-0 cursor-pointer flex-col gap-[6px]"
          >
            <span
              className="relative block h-[82px] overflow-hidden bg-well"
              style={{
                outline: index === current ? "2px solid #000" : "1px solid #e6e6e6",
                outlineOffset: "-2px",
              }}
            >
              <CoverImage
                src={entry.src}
                pos={entry.pos}
                dim={index === current ? 1 : 0.62}
              />
              <span
                className={`absolute top-0 left-0 px-[5px] py-[3px] font-sans text-[10px] leading-none font-bold ${
                  index === current ? "bg-ink text-paper" : "bg-paper text-ink"
                }`}
              >
                {index + 1}
              </span>
            </span>
            <span className="truncate text-left font-sans text-[12px] leading-[110%] font-bold tracking-[-0.4px]">
              {entry.pub}
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => dispatch({ type: "slide/add" })}
          className="flex h-[82px] w-[126px] shrink-0 cursor-pointer items-center justify-center border border-dashed border-ink bg-shell font-sans text-[22px] leading-none font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}

"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import {
  cropField,
  formatPosition,
  HERO_ANCHORS,
  HERO_FALLBACK_OF,
  HERO_SCREEN_INFO,
  HERO_SCREENS,
  parsePosition,
  resolveHeroCrops,
  type HeroScreen,
} from "@/lib/content/hero-crop";
import type { Slide } from "@/lib/dashboard/admin-types";

import { CoverImage } from "./cover-image";
import { Button, Segmented } from "./ui/controls";
import { FieldLabel } from "./ui/fields";
import { MediaDropZone } from "./ui/media-drop-zone";

/*
 * Cropping a hero slide for each screen and for its thumbnail. The whole
 * picture sits on the left with the focus point on it (click or drag to move
 * it, arrow keys to nudge); right beside it the slide is rendered at desktop,
 * tablet, phone and thumbnail proportions, so every crop can be checked
 * without leaving the pointer's reach. Empty crops borrow their fallback
 * (tablet → desktop, mobile → tablet, thumbnail → desktop).
 */

type CropPatch = Partial<Pick<Slide, "pos" | "posTablet" | "posMobile" | "posThumb" | "src">>;

const SCREEN_OPTIONS = HERO_SCREENS.map((screen) => ({
  value: screen,
  label: HERO_SCREEN_INFO[screen].label,
}));
/** Desktop gets a row to itself; the tall screens and the thumbnail share the next one at a common height. */
const PREVIEW_ROWS: HeroScreen[][] = [["desktop"], ["tablet", "mobile", "thumbnail"]];

/** Whether a screen has its own crop or borrows the next size up. */
const ownCrop = (slide: Slide, screen: HeroScreen) => screen === "desktop" || Boolean(slide[cropField(screen)]?.trim());

export function HeroCropWorkspace({ slide, onChange }: { slide: Slide; onChange: (patch: CropPatch) => void }) {
  const [screen, setScreen] = useState<HeroScreen>("desktop");
  const crops = resolveHeroCrops(slide);
  const current = parsePosition(crops[screen]);
  const setCrop = (position: string) => onChange({ [cropField(screen)]: position });
  const fallback = HERO_FALLBACK_OF[screen];

  return (
    <div className="grid min-w-0 items-start gap-[20px] lg:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-[14px]">
        <div className="flex flex-wrap items-center justify-between gap-[10px]">
          <Segmented label="Screen to crop" options={SCREEN_OPTIONS} value={screen} onChange={setScreen} />
          <span className="font-sans text-[12px] text-graphite tabular-nums">
            Focus {crops[screen]}
            {!ownCrop(slide, screen) && fallback && ` · same as ${HERO_SCREEN_INFO[fallback].label.toLowerCase()}`}
          </span>
        </div>

        <MediaDropZone
          onUploaded={([src]) => onChange({ src })}
          label="Drop to replace this slide's image"
          className="overflow-hidden rounded-[6px] bg-well"
        >
          <FocusPicker
            src={slide.src}
            point={current}
            screenLabel={HERO_SCREEN_INFO[screen].label}
            onPick={(x, y) => setCrop(formatPosition(x, y))}
          />
        </MediaDropZone>

        <div className="flex flex-wrap items-start gap-[16px]">
          <div className="flex flex-col gap-[8px]">
            <FieldLabel>Anchor</FieldLabel>
            <AnchorGrid value={crops[screen]} onPick={setCrop} />
          </div>
          <p className="min-w-[180px] flex-1 font-sans text-[12px] leading-[140%] text-graphite">
            Pick one of nine anchors, or click / drag on the picture to put the focus anywhere. Arrow keys nudge it
            (Shift for bigger steps).
            {fallback && (
              <span className="mt-[8px] block">
                {ownCrop(slide, screen) ? (
                  <Button size="sm" variant="ghost" onClick={() => setCrop("")}>
                    Use the {HERO_SCREEN_INFO[fallback].label.toLowerCase()} crop
                  </Button>
                ) : (
                  `${HERO_SCREEN_INFO[screen].label} follows ${HERO_SCREEN_INFO[fallback].label.toLowerCase()} until you set a focus.`
                )}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-[8px]">
        <FieldLabel>Rendered on each screen · click one to crop it</FieldLabel>
        {PREVIEW_ROWS.map((row) => (
          <div key={row.join("-")} className="flex items-start gap-[10px] pt-[2px]">
            {row.map((each) => (
              <ScreenPreview
                key={each}
                slide={slide}
                screen={each}
                position={crops[each]}
                own={ownCrop(slide, each)}
                active={each === screen}
                onSelect={() => setScreen(each)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** The whole picture with the focus point; click, drag or use the arrow keys. */
function FocusPicker({
  src,
  point,
  screenLabel,
  onPick,
}: {
  src: string;
  point: { x: number; y: number };
  screenLabel: string;
  onPick: (x: number, y: number) => void;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  if (!src) {
    return (
      <div className="aspect-16/10">
        <CoverImage src="" />
      </div>
    );
  }

  const pickAt = (event: PointerEvent<HTMLDivElement>) => {
    const box = frame.current?.getBoundingClientRect();
    if (!box?.width || !box.height) return;
    onPick(((event.clientX - box.left) / box.width) * 100, ((event.clientY - box.top) / box.height) * 100);
  };

  const nudge = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 1;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    onPick(point.x + move[0], point.y + move[1]);
  };

  return (
    <div className="flex justify-center bg-sink p-[10px]">
      <div
        ref={frame}
        role="application"
        tabIndex={0}
        aria-roledescription="focus picker"
        aria-label={`${screenLabel} crop focus: ${point.x}% across, ${point.y}% down. Arrow keys move it.`}
        onPointerDown={(event) => {
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          pickAt(event);
        }}
        onPointerMove={(event) => dragging.current && pickAt(event)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        onKeyDown={nudge}
        className="relative inline-block cursor-crosshair touch-none outline-offset-2 select-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- see CoverImage: any host an editor types */}
        <img src={src} alt="" draggable={false} className="block max-h-[420px] w-auto max-w-full" />
        <span
          aria-hidden
          className="pointer-events-none absolute size-[22px] -translate-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.4)]"
          style={{ left: `${point.x}%`, top: `${point.y}%` }}
        >
          <span className="absolute inset-[7px] rounded-full bg-white" />
        </span>
      </div>
    </div>
  );
}

/** Nine anchors as a 3 × 3 pad. */
function AnchorGrid({ value, onPick }: { value: string; onPick: (position: string) => void }) {
  const active = parsePosition(value);
  return (
    <div
      role="radiogroup"
      aria-label="Crop anchor"
      className="grid w-max grid-cols-3 gap-[3px] rounded-[8px] bg-sink p-[3px]"
    >
      {HERO_ANCHORS.map((anchor) => {
        const point = parsePosition(anchor.value);
        const on = point.x === active.x && point.y === active.y;
        return (
          <button
            key={anchor.value}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={anchor.label}
            title={anchor.label}
            onClick={() => onPick(anchor.value)}
            className={`flex size-[28px] cursor-pointer items-center justify-center rounded-[6px] transition-colors ${
              on ? "bg-paper shadow-[0_1px_2px_rgba(28,24,16,0.1)]" : "hover:bg-paper/60"
            }`}
          >
            <span className={`size-[7px] rounded-full ${on ? "bg-ink" : "bg-subtle"}`} />
          </button>
        );
      })}
    </div>
  );
}

/** The slide as the banner draws it on one screen, scaled down. */
function ScreenPreview({
  slide,
  screen,
  position,
  own,
  active,
  onSelect,
}: {
  slide: Slide;
  screen: HeroScreen;
  position: string;
  own: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  const info = HERO_SCREEN_INFO[screen];
  const ratio = info.width / info.height;
  /* The thumbnail is small enough to draw at its real size (square corners,
     as in the strip). Screens grow in proportion to their aspect ratio, which
     gives them the same height, so the row fits its column whatever the width.
     Every frame keeps its real aspect ratio. */
  const actualSize = screen === "thumbnail";
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className="flex min-w-0 cursor-pointer flex-col gap-[6px] text-left"
      style={actualSize ? { flex: "none", width: info.width } : { flex: `${ratio} 1 0` }}
    >
      <span
        className={`relative block overflow-hidden bg-well transition-shadow ${actualSize ? "" : "rounded-[6px]"} ${
          active ? "shadow-[0_0_0_2px_var(--color-ink)]" : "opacity-80 hover:opacity-100"
        }`}
        style={{ aspectRatio: `${info.width} / ${info.height}` }}
      >
        <CoverImage src={slide.src} pos={position} />
        {slide.src && screen !== "thumbnail" && (
          <span className="absolute inset-x-0 bottom-0 flex justify-center bg-linear-to-t from-black/40 to-transparent px-[6px] pt-[18px] pb-[6px]">
            <span className="truncate font-serif text-[8px] leading-[120%]" style={{ color: slide.ink }}>
              {slide.credit} <em>{slide.pub}</em>
            </span>
          </span>
        )}
      </span>
      <span className="flex flex-col gap-[2px] font-sans text-[12px] leading-[120%]">
        <span className={active ? "font-bold" : "font-medium text-graphite"}>{info.label}</span>
        <span className="text-[11px] text-subtle tabular-nums">
          {info.width}×{info.height}
          {actualSize && " · actual size"} · {own ? "own crop" : "inherited"}
        </span>
      </span>
    </button>
  );
}

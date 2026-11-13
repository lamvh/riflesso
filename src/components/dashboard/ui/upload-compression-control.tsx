"use client";

import { useEffect, useRef, useState } from "react";

import {
  COMPRESSION_PRESETS,
  describeCompression,
  EDGE_OPTIONS,
  presetOf,
  QUALITY_RANGE,
  type CompressionPreset,
} from "@/lib/media/upload-compression";

import { useUploadCompression } from "../use-upload-compression";
import { buttonClass, Segmented } from "./controls";
import { SelectField } from "./fields";

const PRESET_OPTIONS = [
  ...(Object.keys(COMPRESSION_PRESETS) as CompressionPreset[]).map((key) => ({
    value: key as CompressionPreset | "custom",
    label: COMPRESSION_PRESETS[key].label,
  })),
  { value: "custom" as const, label: "Custom" },
];

/**
 * "Compression: Balanced" — opens a small panel to choose how uploads are
 * compressed. The choice is remembered in this browser and applies to every
 * upload in the dashboard (album, artist, hero, library…).
 */
export function UploadCompressionControl({ align = "left" }: { align?: "left" | "right" }) {
  const [value, set] = useUploadCompression();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const preset = presetOf(value);

  /* Click outside or Escape closes. */
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={buttonClass("ghost", "sm")}
      >
        Compression: {describeCompression(value)}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Upload compression"
          className={`absolute top-[calc(100%+6px)] z-40 flex w-[340px] max-w-[calc(100vw-32px)] flex-col gap-[12px] rounded-[10px] border border-line bg-paper p-[14px] font-sans shadow-[0_12px_32px_rgba(28,24,16,0.18)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <Segmented
            label="Compression preset"
            options={PRESET_OPTIONS}
            value={preset}
            onChange={(next) => {
              if (next === "custom") set({ ...value, original: false });
              else set(COMPRESSION_PRESETS[next].value);
            }}
          />
          {preset === "custom" ? (
            <div className="flex flex-col gap-[10px]">
              <label className="flex flex-col gap-[6px] text-[13px] text-graphite">
                <span className="flex justify-between">
                  <span className="font-medium">Quality</span>
                  <span className="text-ink tabular-nums">{value.quality}</span>
                </span>
                <input
                  type="range"
                  min={QUALITY_RANGE.min}
                  max={QUALITY_RANGE.max}
                  step={1}
                  value={value.quality}
                  onChange={(event) => set({ ...value, quality: Number(event.target.value) })}
                  className="accent-ink"
                />
                <span className="flex justify-between text-[11px]">
                  <span>Smaller file</span>
                  <span>Sharper picture</span>
                </span>
              </label>
              <div className="flex items-center justify-between gap-[10px] text-[13px] text-graphite">
                <span className="font-medium">Longest edge</span>
                <SelectField
                  label="Longest edge"
                  value={String(value.maxEdge)}
                  onChange={(edge) => set({ ...value, maxEdge: Number(edge) })}
                  options={EDGE_OPTIONS.map((edge) => ({ value: String(edge), label: `${edge}px` }))}
                />
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-graphite">{COMPRESSION_PRESETS[preset].note}</p>
          )}
          <p className="text-[12px] leading-[145%] text-graphite">
            {value.original
              ? "Files are stored exactly as uploaded — no resizing, full size and metadata kept. TIFF is still converted."
              : "Pictures are resized to fit the longest edge, then saved as WebP or JPEG, whichever is smaller. Videos and GIFs are never re-encoded."}{" "}
            Remembered in this browser; applies to every upload in the dashboard.
          </p>
        </div>
      )}
    </div>
  );
}

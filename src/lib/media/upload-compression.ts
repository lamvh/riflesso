/*
 * How hard an uploaded picture is compressed. Chosen in the dashboard, sent
 * with each upload as form fields, and clamped again on the server, so a
 * hand-made request can't ask for something absurd. Client-safe.
 */

export type UploadCompression = {
  /** Encoder quality for WebP/JPEG, 1–100. */
  quality: number;
  /** Longest edge kept, in pixels. */
  maxEdge: number;
  /** Store the file exactly as it arrived: no resize, no re-encode. */
  original: boolean;
};

export const QUALITY_RANGE = { min: 40, max: 100 } as const;
export const EDGE_OPTIONS = [1600, 2000, 2400, 3200, 4000] as const;

export const COMPRESSION_PRESETS = {
  smaller: { label: "Smaller files", note: "Quality 70 · 2000px", value: { quality: 70, maxEdge: 2000, original: false } },
  balanced: { label: "Balanced", note: "Quality 80 · 2400px", value: { quality: 80, maxEdge: 2400, original: false } },
  high: { label: "High quality", note: "Quality 90 · 3200px", value: { quality: 90, maxEdge: 3200, original: false } },
  original: { label: "Original", note: "Stored as uploaded", value: { quality: 100, maxEdge: 4000, original: true } },
} satisfies Record<string, { label: string; note: string; value: UploadCompression }>;

export type CompressionPreset = keyof typeof COMPRESSION_PRESETS;

export const DEFAULT_COMPRESSION: UploadCompression = COMPRESSION_PRESETS.balanced.value;

/** The preset a setting matches, or "custom". */
export function presetOf(value: UploadCompression): CompressionPreset | "custom" {
  const hit = (Object.keys(COMPRESSION_PRESETS) as CompressionPreset[]).find((key) => {
    const preset = COMPRESSION_PRESETS[key].value;
    return preset.original === value.original && (value.original || (preset.quality === value.quality && preset.maxEdge === value.maxEdge));
  });
  return hit ?? "custom";
}

/** Short description, e.g. "Balanced" or "Custom · quality 85 · 3200px". */
export function describeCompression(value: UploadCompression): string {
  const preset = presetOf(value);
  return preset === "custom" ? `Custom · quality ${value.quality} · ${value.maxEdge}px` : COMPRESSION_PRESETS[preset].label;
}

/** Anything (stored JSON, form fields) made into a valid setting; unknown parts fall back to the default. */
export function clampCompression(input: Partial<Record<keyof UploadCompression, unknown>> | null | undefined): UploadCompression {
  const quality = Number(input?.quality);
  const maxEdge = Number(input?.maxEdge);
  return {
    quality: Number.isFinite(quality)
      ? Math.round(Math.min(QUALITY_RANGE.max, Math.max(QUALITY_RANGE.min, quality)))
      : DEFAULT_COMPRESSION.quality,
    maxEdge: (EDGE_OPTIONS as readonly number[]).includes(maxEdge) ? maxEdge : DEFAULT_COMPRESSION.maxEdge,
    original: input?.original === true || input?.original === "true",
  };
}

/** Form fields the upload route reads back with `compressionFromForm`. */
export function appendCompression(form: FormData, value: UploadCompression) {
  form.append("quality", String(value.quality));
  form.append("maxEdge", String(value.maxEdge));
  form.append("original", String(value.original));
}

export function compressionFromForm(form: FormData): UploadCompression {
  return clampCompression({ quality: form.get("quality"), maxEdge: form.get("maxEdge"), original: form.get("original") });
}

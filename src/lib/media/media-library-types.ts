/*
 * Shape of the bucket listing the dashboard's Media screen shows. Kept free of
 * server imports so the client screen can use the types.
 */

export type MediaObject = {
  key: string;
  /** Public address the object is served from. */
  url: string;
  size: number;
  /** ISO timestamp of the upload, or null when the bucket does not say. */
  lastModified: string | null;
};

export type MediaLibraryReport =
  | { state: "unconfigured" }
  | { state: "error"; message: string }
  | {
      state: "ok";
      bucket: string;
      objects: MediaObject[];
      /** The listing stopped at its cap; the bucket holds more than shown. */
      truncated: boolean;
      listedAt: string;
    };

export type MediaDeleteReport =
  | { state: "error"; message: string }
  | {
      state: "ok";
      deleted: string[];
      /** Keys left in place, each with why. */
      skipped: { key: string; reason: string }[];
    };

const UNITS = ["B", "KB", "MB", "GB", "TB"];

/** 1536 → "1.5 KB". Binary multiples, the way the R2 dashboard counts. */
export function formatBytes(bytes: number): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const digits = unit === 0 || value >= 100 ? 0 : 1;
  return `${value.toFixed(digits)} ${UNITS[unit]}`;
}

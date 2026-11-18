import type { CSSProperties } from "react";

/**
 * Inline style that staggers an `rfl-intro` item: the nth item of a list
 * starts 60ms after the one before (capped in globals.css). `delay` shifts the
 * whole list, in seconds, so it can follow another block on the page.
 */
export function staggerStyle(index: number, delay = 0): CSSProperties {
  return { "--rfl-i": index, ...(delay ? { "--rfl-delay": `${delay}s` } : {}) } as CSSProperties;
}

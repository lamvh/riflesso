"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  clampCompression,
  DEFAULT_COMPRESSION,
  type UploadCompression,
} from "@/lib/media/upload-compression";

/*
 * The compression every dashboard upload uses, remembered in this browser.
 * It is an editor's working preference, not site content, so it isn't
 * published. Every control and upload in the tab sees a change at once; a
 * blocked or empty storage just means the default.
 */

const STORAGE_KEY = "riflesso:upload-compression";
const CHANGE_EVENT = "riflesso:upload-compression-change";

let memo: { raw: string | null; value: UploadCompression } = { raw: null, value: DEFAULT_COMPRESSION };

function read(): UploadCompression {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    /* Storage blocked: the default stands. */
  }
  /* useSyncExternalStore needs the same object back while nothing changed. */
  if (raw !== memo.raw) {
    let parsed: unknown = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = null;
    }
    memo = { raw, value: parsed ? clampCompression(parsed as Partial<UploadCompression>) : DEFAULT_COMPRESSION };
  }
  return memo.value;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** Current setting for code outside React (the upload call itself). */
export const currentUploadCompression = (): UploadCompression =>
  typeof window === "undefined" ? DEFAULT_COMPRESSION : read();

export function useUploadCompression() {
  const value = useSyncExternalStore(subscribe, read, () => DEFAULT_COMPRESSION);

  const set = useCallback((next: UploadCompression) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clampCompression(next)));
    } catch {
      /* Not remembered, but this tab still uses it below. */
      memo = { raw: memo.raw, value: clampCompression(next) };
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return [value, set] as const;
}

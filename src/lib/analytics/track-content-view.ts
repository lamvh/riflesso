"use client";

import type { ContentViewKind } from "./content-view-types";

/** Albums and artists count once per visit, however often they are reopened. */
const SEEN_KEY = "riflesso.views.seen";

function seenBefore(key: string): boolean {
  try {
    const seen = new Set<string>(JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? "[]"));
    if (seen.has(key)) return true;
    seen.add(key);
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-300)));
    return false;
  } catch {
    return false;
  }
}

/**
 * Fire-and-forget: sendBeacon survives the page being left, and nothing here
 * can throw into the page that called it.
 */
export function trackContentView(kind: ContentViewKind, ref: string) {
  try {
    if (kind !== "page" && seenBefore(`${kind}:${ref}`)) return;
    const body = JSON.stringify({ kind, ref });
    const sent = navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }));
    if (!sent) void fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
  } catch {
    /* Analytics never breaks the page. */
  }
}

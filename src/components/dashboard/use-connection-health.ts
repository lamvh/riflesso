"use client";

import { useEffect, useSyncExternalStore } from "react";

import { checkExternalConnections } from "@/lib/dashboard/check-external-connections";
import type { ConnectionReport, ConnectionState } from "@/lib/dashboard/external-connection-types";

/*
 * One shared connection report for the whole dashboard: the sidebar dot, the
 * Overview strip and the Status screen all read it, so the services are probed
 * once rather than by each. It goes stale after a few minutes and is re-probed
 * by the next reader that mounts, or on demand.
 */

const STALE_MS = 5 * 60 * 1000;

type Health = {
  report: ConnectionReport | null;
  checking: boolean;
  failure: string | null;
  /** When the last probe finished (ms), 0 before the first. */
  at: number;
};

let health: Health = { report: null, checking: false, failure: null, at: 0 };
const listeners = new Set<() => void>();

const set = (patch: Partial<Health>) => {
  health = { ...health, ...patch };
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export async function refreshConnectionHealth() {
  if (health.checking) return;
  set({ checking: true });
  try {
    set({ report: await checkExternalConnections(), failure: null, checking: false, at: Date.now() });
  } catch (error) {
    set({
      failure: error instanceof Error ? error.message : "The check could not run",
      checking: false,
      at: Date.now(),
    });
  }
}

const RANK: Record<ConnectionState, number> = { ok: 0, unconfigured: 1, warning: 2, error: 3 };

/** The worst state across every service, or null before the first report. */
export const overallState = (report: ConnectionReport | null): ConnectionState | null =>
  report
    ? report.connections.reduce<ConnectionState>(
        (worst, connection) => (RANK[connection.state] > RANK[worst] ? connection.state : worst),
        "ok",
      )
    : null;

/** `maxAgeMs` — how old a report may be before mounting re-probes. */
export function useConnectionHealth(maxAgeMs = STALE_MS) {
  const snapshot = useSyncExternalStore(subscribe, () => health, () => health);

  useEffect(() => {
    if (Date.now() - health.at > maxAgeMs) void refreshConnectionHealth();
  }, [maxAgeMs]);

  return { ...snapshot, refresh: refreshConnectionHealth, overall: overallState(snapshot.report) };
}

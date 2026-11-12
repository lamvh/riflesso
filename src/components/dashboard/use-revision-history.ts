"use client";

import { useEffect, useState } from "react";

import { listContentRevisions } from "@/lib/dashboard/content-history-actions";
import type { RevisionList } from "@/lib/dashboard/content-history-types";

import { useAdmin } from "./admin-store";

const read = (): Promise<RevisionList> =>
  listContentRevisions().catch((error: unknown) => ({
    state: "error" as const,
    message: error instanceof Error ? error.message : "History could not be read",
  }));

/**
 * The edit history from the database, re-read after every save so a new or
 * grown entry shows up without a reload. `null` until the first read lands.
 */
export function useRevisionHistory() {
  const { state } = useAdmin();
  const [list, setList] = useState<RevisionList | null>(null);
  const configured = state.source !== "unconfigured";

  useEffect(() => {
    if (!configured) return;
    let live = true;
    void read().then((next) => {
      if (live) setList(next);
    });
    return () => {
      live = false;
    };
  }, [configured, state.revision]);

  return { list: configured ? list : ({ state: "unconfigured" } as const) };
}

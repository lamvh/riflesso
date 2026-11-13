"use server";

import { loadDashboardContent } from "@/lib/content/load-dashboard-content";
import { forgetMediaLabels } from "@/lib/media/media-label-store";
import { DELETE_BATCH_LIMIT, deleteObjects, r2Config } from "@/lib/media/r2-storage";
import type { MediaDeleteReport } from "@/lib/media/media-library-types";

import { placesByKey } from "./media-usage";

const TIMEOUT_MS = 15000;

/** Only dashboard uploads may be deleted; anything else in the bucket is left alone. */
const DELETABLE = /^uploads\/[^\s]+$/;

/**
 * Server action behind the Media screen's Delete buttons. Never throws.
 *
 * There is no sign-in yet, so this runs for anyone who can reach the
 * dashboard. It therefore re-checks every key against the content in the
 * database itself — drafts included — and refuses any file a record still
 * points at. The worst a stray call can do is remove a file nothing uses.
 * When the database cannot be read, nothing is deleted.
 *
 * Unpublished browser drafts are invisible here; the screen only offers
 * Delete for files its own draft does not use either.
 */
export async function deleteMediaObjects(keys: string[]): Promise<MediaDeleteReport> {
  try {
    const config = r2Config();
    if (!config) return { state: "error", message: "Storage is not configured." };

    if (!Array.isArray(keys) || keys.length === 0) {
      return { state: "error", message: "Choose at least one file." };
    }
    if (keys.length > DELETE_BATCH_LIMIT) {
      return { state: "error", message: `Delete at most ${DELETE_BATCH_LIMIT} files at a time.` };
    }

    const loaded = await loadDashboardContent();
    if (loaded.source === "unreachable") {
      return {
        state: "error",
        message: "The database is not answering, so usage cannot be confirmed. Nothing was deleted.",
      };
    }
    const referenced = placesByKey(loaded.content);

    const skipped: { key: string; reason: string }[] = [];
    const deletable: string[] = [];
    for (const key of new Set(keys)) {
      if (typeof key !== "string" || !DELETABLE.test(key) || key.includes("..")) {
        skipped.push({ key: String(key), reason: "Not a dashboard upload" });
      } else if (referenced.has(key)) {
        skipped.push({ key, reason: `Still used by ${[...referenced.get(key)!].join(", ")}` });
      } else {
        deletable.push(key);
      }
    }

    if (deletable.length === 0) return { state: "ok", deleted: [], skipped };

    const result = await deleteObjects(config, deletable, AbortSignal.timeout(TIMEOUT_MS));
    /* The files are gone; their folder and tags go with them. */
    await forgetMediaLabels(result.deleted);
    return { state: "ok", deleted: result.deleted, skipped: [...skipped, ...result.failed] };
  } catch (error) {
    const timedOut =
      error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
    return {
      state: "error",
      message: timedOut
        ? `The bucket did not answer within ${TIMEOUT_MS / 1000}s. Refresh to see what was removed.`
        : error instanceof Error
          ? error.message
          : String(error),
    };
  }
}

"use client";

import { useTransition, type Dispatch } from "react";

import type { AdminAction } from "@/lib/dashboard/admin-actions";
import { plural } from "@/lib/dashboard/admin-changes";
import { deleteMediaObjects } from "@/lib/dashboard/delete-media-objects";
import type { MediaDeleteReport } from "@/lib/media/media-library-types";

/**
 * Confirm, then delete files from R2. The server re-checks every key against
 * the database and keeps any file a record still uses; `onDeleted` receives
 * only the keys the bucket confirmed gone. Outcomes are reported as toasts.
 */
export function useDeleteMediaFiles(
  dispatch: Dispatch<AdminAction>,
  onDeleted: (keys: Set<string>) => void,
) {
  const [deleting, startDeleting] = useTransition();

  const remove = (keys: string[], what: string) => {
    if (!window.confirm(`Delete ${what} from R2? This can't be undone.`)) return;
    startDeleting(async () => {
      let result: MediaDeleteReport;
      try {
        result = await deleteMediaObjects(keys);
      } catch (error) {
        result = { state: "error", message: error instanceof Error ? error.message : "The delete could not run" };
      }
      if (result.state === "error") {
        dispatch({ type: "toast", message: result.message, tone: "error" });
        return;
      }

      const gone = new Set(result.deleted);
      onDeleted(gone);
      const [first] = result.skipped;
      dispatch(
        first
          ? {
              type: "toast",
              tone: "error",
              message: `Deleted ${plural(gone.size, "file")}; kept ${plural(result.skipped.length, "file")} — ${first.reason}`,
            }
          : { type: "toast", message: `Deleted ${plural(gone.size, "file")}` },
      );
    });
  };

  return [deleting, remove] as const;
}

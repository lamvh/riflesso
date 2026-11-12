"use server";

import { listObjects, r2Config } from "@/lib/media/r2-storage";
import type { MediaLibraryReport } from "@/lib/media/media-library-types";

const TIMEOUT_MS = 15000;

/**
 * Server action behind the Media screen: every object in the R2 bucket with
 * its size and public address. Read-only — it never writes or deletes.
 *
 * There is no sign-in yet, so anyone who can reach the dashboard can run it.
 * It reveals object keys and the bucket name, never credentials.
 */
export async function listMediaLibrary(): Promise<MediaLibraryReport> {
  /* Never throws: a malformed endpoint, bad credentials or a dead bucket all
     come back as an `error` report the screen can show. */
  try {
    const config = r2Config();
    if (!config) return { state: "unconfigured" };

    const { objects, truncated } = await listObjects(config, AbortSignal.timeout(TIMEOUT_MS));
    return {
      state: "ok",
      bucket: config.bucket,
      objects: objects.map((object) => ({
        ...object,
        url: `${config.publicBaseUrl}/${object.key}`,
      })),
      truncated,
      listedAt: new Date().toISOString(),
    };
  } catch (error) {
    const timedOut =
      error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
    return {
      state: "error",
      message: timedOut
        ? `The bucket did not answer within ${TIMEOUT_MS / 1000}s`
        : error instanceof Error
          ? error.message
          : String(error),
    };
  }
}

"use server";

import type { ConnectionReport } from "./external-connection-types";
import { checkAllConnections } from "./external-connection-checks";

/**
 * Server action behind the Settings → Connections panel. Read-only: it probes
 * each service and reports, it never writes.
 *
 * There is no sign-in yet, so anyone who can reach the dashboard can run it.
 * It reveals hosts and missing variable names, never keys.
 */
export async function checkExternalConnections(): Promise<ConnectionReport> {
  return checkAllConnections();
}

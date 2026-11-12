/*
 * Shape of the health report the Settings screen shows for each external
 * service the site depends on. Kept free of server imports so the client panel
 * can use the types.
 */

export type ConnectionId = "database" | "public-read" | "storage" | "media-cdn";

/**
 * `ok` — answered as expected. `warning` — answered, but something needs
 * attention (schema missing, nothing published). `error` — configured but not
 * answering. `unconfigured` — the environment variables are not set.
 */
export type ConnectionState = "ok" | "warning" | "error" | "unconfigured";

export type ConnectionStatus = {
  id: ConnectionId;
  label: string;
  /** What the service is used for, in one line. */
  purpose: string;
  state: ConnectionState;
  /** Human-readable result; never contains a secret. */
  detail: string;
  /** Host the check talked to, when configured. */
  target: string | null;
  /** Round trip of the check, when a request was made. */
  latencyMs: number | null;
  /** Names of required environment variables that are not set. */
  missingEnv: string[];
};

export type ConnectionReport = {
  checkedAt: string;
  connections: ConnectionStatus[];
};

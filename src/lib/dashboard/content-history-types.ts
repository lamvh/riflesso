/*
 * Shapes shared by the history server actions and the dashboard screens that
 * read them. Free of server imports so client components can use them.
 */

/**
 * `snapshot` — the content as found before an edit session began.
 * `edit` — after a save; saves close together share one entry.
 * `restore` — after an earlier entry was restored.
 */
export type RevisionKind = "snapshot" | "edit" | "restore";

export type RevisionEntry = {
  id: number;
  revision: number;
  kind: RevisionKind;
  /** What happened, newest first. */
  summary: string[];
  createdAt: string;
  updatedAt: string;
};

/** `missing` — the history migration has not been run yet. */
export type RevisionList =
  | { state: "ok"; entries: RevisionEntry[] }
  | { state: "missing" }
  | { state: "unconfigured" }
  | { state: "error"; message: string };

/** What a save tells the history about itself. */
export type SaveLog = {
  summary: string[];
  /** The save puts back an earlier entry rather than new edits. */
  restore: boolean;
};

/** A table the migration adds is not there yet (Postgres or PostgREST code). */
export const isMissingTable = (error: { code?: string; message?: string }) =>
  error.code === "42P01" ||
  error.code === "PGRST205" ||
  /does not exist|could not find the table/i.test(error.message ?? "");

/** What a view counts against. See the content_views migration. */
export type ContentViewKind = "page" | "album" | "artist";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The site's public pages. A 404 under any other path is not counted, so
    stray URLs cannot fill the table. */
const PUBLIC_PATHS = new Set(["/", "/artists", "/about", "/contact"]);
const isPublicPath = (ref: string) => PUBLIC_PATHS.has(ref);

/** Accept only refs that can be real, so the table cannot be filled with junk. */
export function validView(kind: unknown, ref: unknown): { kind: ContentViewKind; ref: string } | null {
  if (typeof ref !== "string") return null;
  const value = ref.trim();
  if (kind === "page" && isPublicPath(value)) return { kind, ref: value };
  if (kind === "album" && UUID.test(value)) return { kind, ref: value.toLowerCase() };
  if (kind === "artist" && value.length > 0 && value.length <= 120) return { kind, ref: value };
  return null;
}

export type ViewCount = { ref: string; views: number };

export type ContentViewReport =
  | {
      state: "ok";
      days: number;
      /** Page views per day, oldest first, one entry per day in the window. */
      daily: { day: string; views: number }[];
      total: number;
      /** The same length of time before the window, for the trend. */
      previousTotal: number;
      pages: ViewCount[];
      albums: ViewCount[];
      artists: ViewCount[];
    }
  | { state: "missing" }
  | { state: "unconfigured" }
  | { state: "error"; message: string };

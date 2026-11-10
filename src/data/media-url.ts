/**
 * Imagery that ships with the repo — the design references these as
 * `./assets/<name>`, and they live in `public/assets/`. Anything uploaded from
 * the dashboard is served from R2 instead (`NEXT_PUBLIC_MEDIA_BASE_URL`).
 */
export const siteAsset = (name: string) => `/assets/${name}`;

/**
 * Credit and title for studio frames that don't belong to a named shoot.
 * Placeholder until exact credits are set from the dashboard.
 */
export const STUDIO_CREDIT = [["Bincio", "Photography"]] as const;
export const STUDIO_TITLE = "Riflesso Studio";

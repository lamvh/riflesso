/*
 * The repo ships no imagery: every picture is uploaded from the dashboard and
 * served from R2 (`NEXT_PUBLIC_MEDIA_BASE_URL`). The seed content keeps its
 * records and credits with empty image fields, to be filled from there.
 */

/**
 * Credit and title for studio frames that don't belong to a named shoot.
 * Placeholder until exact credits are set from the dashboard.
 */
export const STUDIO_CREDIT = [["Bincio", "Photography"]] as const;
export const STUDIO_TITLE = "Riflesso Studio";

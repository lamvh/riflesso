/** Offices an artist is represented out of. Mirrors the `territories` table. */
export const TERRITORIES = ["US", "EUROPE"] as const;
export type Territory = (typeof TERRITORIES)[number];

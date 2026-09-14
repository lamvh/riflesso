import {
  pickSiteContent,
  type LoadedSiteContent,
  type SiteContent,
  type SiteContentSource,
} from "@/lib/content/site-content-types";

import type { Activity, AdminArtist, Album, Credit } from "./admin-types";

/** A frame inside the album drawer's image grid. The first one is the cover. */
export type Shot = { src: string; pos: string };

export type ArtistDraft = AdminArtist;
export type AlbumDraft = Album & { shots: Shot[] };

export type Drawer =
  | { kind: "artist"; index: number; draft: ArtistDraft }
  | { kind: "album"; index: number; draft: AlbumDraft }
  | null;

/** Errors stay up longer and read as alerts. */
export type ToastTone = "info" | "error";

export type AdminState = SiteContent & {
  activity: Activity;
  /** Which hero slide the homepage screen is editing. */
  slide: number;
  /** Pending name in the categories screen's add field, so the page header's
      primary action can commit the same value the field holds. */
  newCat: string;
  drawer: Drawer;
  toast: string;
  toastTone: ToastTone;
  /**
   * False until the stored draft has been read. The first paint has to render
   * the server's content so server and client agree, which means the persist
   * effect would otherwise write that content over the draft it is about to load.
   */
  hydrated: boolean;
  /** Database revision the content was loaded at, or last published as. */
  revision: number;
  /** The content as loaded or last published, serialised. Anything that
      serialises differently is unpublished. */
  baseline: string;
  source: SiteContentSource;
};

export const serializeContent = (content: SiteContent) =>
  JSON.stringify(pickSiteContent(content));

export const initialAdminState = ({
  content,
  revision,
  source,
}: LoadedSiteContent): AdminState => ({
  ...pickSiteContent(content),
  activity: [],
  slide: 0,
  newCat: "",
  drawer: null,
  toast: "",
  toastTone: "info",
  hydrated: false,
  revision,
  baseline: serializeContent(content),
  source,
});

/** Records created in the browser get their permanent uuid straight away. */
export function newId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  /* randomUUID needs a secure context; plain-http LAN previews fall back here. */
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** A blank record for the "new" case of each drawer. */
export const blankArtist = (): ArtistDraft => ({
  id: newId(),
  name: "",
  categoryIds: [],
  territory: "US",
  image: "",
  pos: "50% 18%",
  live: false,
  bio: "",
});

export const blankAlbum = (): AlbumDraft => ({
  id: newId(),
  title: "",
  kind: "Editorial",
  frames: [],
  cover: "",
  pos: "50% 18%",
  live: false,
  home: false,
  credits: [{ name: "", role: "" }],
  shots: [],
});

export const toArtistDraft = (artist: AdminArtist): ArtistDraft => ({
  ...artist,
  categoryIds: [...artist.categoryIds],
});

/**
 * The drawer edits the set as a grid of frames. The cover keeps the album's
 * hand-chosen crop; the rest take the default, which is all the site ever
 * applies to a frame that is not fronting anything.
 */
export const toAlbumDraft = (album: Album): AlbumDraft => ({
  ...album,
  credits: album.credits.map((credit) => ({ ...credit })),
  shots: album.frames.map((src, index) => ({
    src,
    pos: index === 0 ? album.pos : "50% 18%",
  })),
});

export const creditsLine = (credits: Credit[]) =>
  credits
    .filter((credit) => credit.name.trim())
    .map((credit) => `${credit.name} — ${credit.role}`)
    .join(", ");

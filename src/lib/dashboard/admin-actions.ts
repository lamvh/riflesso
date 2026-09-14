import type {
  ContactCardRecord,
  SiteContent,
  SiteSettings,
  SocialLink,
} from "@/lib/content/site-content-types";

import type { AlbumDraft, ArtistDraft, ToastTone } from "./admin-state";
import type { Activity, Credit, Slide } from "./admin-types";

/** Edits to an artist or an album, including everything the drawer touches. */
export type RecordAction =
  | { type: "artist/open"; index: number }
  | { type: "artist/toggleLive"; index: number }
  | { type: "artist/save" }
  | { type: "artist/delete" }
  | { type: "album/open"; index: number }
  | { type: "album/toggleHome"; index: number }
  | { type: "album/save" }
  | { type: "album/delete" }
  | { type: "draft/set"; patch: Partial<ArtistDraft & AlbumDraft> }
  | { type: "draft/toggleCat"; id: string }
  | { type: "draft/addCredit" }
  | { type: "draft/setCredit"; index: number; patch: Partial<Credit> }
  | { type: "draft/removeCredit"; index: number }
  | { type: "draft/addShot" }
  | { type: "draft/removeShot"; index: number }
  | { type: "drawer/close" };

/** Edits to how the site is arranged rather than to what it holds. */
export type SiteAction =
  | { type: "cat/setNew"; name: string }
  | { type: "cat/add" }
  | { type: "cat/rename"; index: number; name: string }
  | { type: "cat/toggle"; index: number }
  | { type: "cat/move"; index: number; delta: number }
  | { type: "cat/remove"; index: number }
  | { type: "slide/add" }
  | { type: "slide/select"; index: number }
  | { type: "slide/set"; patch: Partial<Slide> }
  | { type: "slide/move"; delta: number }
  | { type: "slide/remove" }
  | { type: "block/toggle"; index: number }
  | { type: "block/move"; index: number; delta: number };

/** Site-wide settings: brand, SEO, About copy, contact cards, footer links. */
export type SettingsAction =
  | { type: "settings/set"; patch: Partial<SiteSettings> }
  | { type: "contact/add" }
  | { type: "contact/set"; index: number; patch: Partial<ContactCardRecord> }
  | { type: "contact/move"; index: number; delta: number }
  | { type: "contact/remove"; index: number }
  | { type: "social/add" }
  | { type: "social/set"; index: number; patch: Partial<SocialLink> }
  | { type: "social/remove"; index: number };

/** Session furniture: the toast, the stored draft, publishing. */
export type SessionAction =
  | { type: "toast"; message: string; tone?: ToastTone }
  | { type: "restore"; content: SiteContent; activity: Activity }
  | { type: "hydrated" }
  /** Throw away unpublished edits and go back to the last published content. */
  | { type: "discard" }
  | { type: "published"; revision: number; baseline: string };

export type AdminAction = RecordAction | SiteAction | SettingsAction | SessionAction;

const RECORD_PREFIXES = ["artist/", "album/", "draft/", "drawer/"];
const SETTINGS_PREFIXES = ["settings/", "contact/", "social/"];

export const isRecordAction = (action: AdminAction): action is RecordAction =>
  RECORD_PREFIXES.some((prefix) => action.type.startsWith(prefix));

export const isSettingsAction = (action: AdminAction): action is SettingsAction =>
  SETTINGS_PREFIXES.some((prefix) => action.type.startsWith(prefix));

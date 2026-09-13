import {
  ALBUM_KINDS,
  BLOCK_KINDS,
  TERRITORIES,
} from "@/lib/dashboard/admin-types";
import { isPublishableSrc } from "@/lib/media-src";

/*
 * The publish action receives whatever a POST sends, so the document is
 * checked here before it reaches the database. Constraints in the schema are
 * the backstop; these checks exist to turn the likely mistakes into a sentence
 * an editor can act on.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LIST_KEYS = ["contacts", "artists", "albums", "cats", "slides", "blocks"] as const;

type Row = Record<string, unknown>;

const isRow = (value: unknown): value is Row =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const isStringList = (value: unknown) =>
  Array.isArray(value) && value.every((entry) => typeof entry === "string");
const oneOf = (list: readonly string[], value: unknown) =>
  typeof value === "string" && list.includes(value);

const BLOB_MESSAGE =
  "An uploaded file is only a local preview — storage isn't connected yet, so paste an image URL before publishing.";

function checkIds(rows: Row[], label: string): string | null {
  const ids = rows.map((row) => row.id);
  if (!ids.every((id) => typeof id === "string" && UUID.test(id))) {
    return `Every ${label} needs a valid id — reload the dashboard`;
  }
  return new Set(ids).size === ids.length ? null : `Two ${label}s share an id`;
}

export function findPublishProblem(input: unknown): string | null {
  if (!isRow(input) || !isRow(input.settings)) return "Malformed content";
  for (const key of LIST_KEYS) {
    const list = input[key];
    if (!Array.isArray(list) || !list.every(isRow)) return `Malformed ${key}`;
  }
  if (JSON.stringify(input).includes('"blob:')) return BLOB_MESSAGE;

  const settings = input.settings;
  if (!text(settings.brandName)) return "Brand name is required";
  if (!text(settings.metaTitle)) return "Site title is required";
  if (!isStringList(settings.aboutParagraphs)) return "Malformed About copy";
  if (!Array.isArray(settings.socialLinks) || !settings.socialLinks.every(isRow)) {
    return "Malformed social links";
  }

  const [contacts, artists, albums, cats, slides, blocks] = LIST_KEYS.map(
    (key) => input[key] as Row[],
  );

  const idProblem =
    checkIds(contacts, "contact card") ??
    checkIds(artists, "artist") ??
    checkIds(albums, "album") ??
    checkIds(cats, "category") ??
    checkIds(slides, "hero slide") ??
    checkIds(blocks, "section");
  if (idProblem) return idProblem;

  if (contacts.some((card) => !text(card.heading) || !isStringList(card.address))) {
    return "Every contact card needs a heading";
  }

  const names = cats.map((cat) => text(cat.name));
  if (names.some((name) => !name)) return "Every category needs a name";
  if (new Set(names).size !== names.length) return "Category names must be unique";

  for (const artist of artists) {
    if (!text(artist.name)) return "Every artist needs a name";
    if (!oneOf(TERRITORIES, artist.territory)) return `${text(artist.name)}: unknown territory`;
    if (!isStringList(artist.categoryIds)) return `${text(artist.name)}: malformed categories`;
  }

  for (const album of albums) {
    if (!text(album.title)) return "Every album needs a title";
    if (!oneOf(ALBUM_KINDS, album.kind)) return `${text(album.title)}: unknown album type`;
    if (!isStringList(album.frames)) return `${text(album.title)}: malformed images`;
    if (!Array.isArray(album.credits) || !album.credits.every(isRow)) {
      return `${text(album.title)}: malformed credits`;
    }
  }

  if (slides.some((slide) => !text(slide.pub))) return "Every hero slide needs a publication";

  for (const block of blocks) {
    if (!oneOf(BLOCK_KINDS, block.kind) || !oneOf(ALBUM_KINDS, block.source)) {
      return `${text(block.label)}: unknown section layout`;
    }
    if (block.albumId !== null && !(typeof block.albumId === "string" && UUID.test(block.albumId))) {
      return `${text(block.label)}: malformed album reference`;
    }
  }

  const sources = [
    settings.logoUrl,
    ...artists.map((artist) => artist.image),
    ...albums.flatMap((album) => album.frames as string[]),
    ...slides.map((slide) => slide.src),
    ...blocks.map((block) => block.image),
  ];
  const unusable = sources.find((src) => text(src) && !isPublishableSrc(text(src)));
  if (unusable) return `Not a usable image address: "${text(unusable)}" — use /assets/… or https://…`;

  return null;
}

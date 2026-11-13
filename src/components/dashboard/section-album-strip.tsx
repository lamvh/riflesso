"use client";

import type { AdminAction } from "@/lib/dashboard/admin-reducer";
import type { Album, Block } from "@/lib/dashboard/admin-types";

import { CoverImage } from "./cover-image";
import { MediaDropZone } from "./ui/media-drop-zone";
import { MediaLibraryButton } from "./ui/media-library-picker";
import { UploadButton } from "./ui/upload-button";

/** What the homepage can show: the same filter the public page applies. */
export const onHomepage = (album: Album) => album.live && album.home && Boolean(album.cover);

/** The albums a section paints, in page order — every one, not a sample. */
export function sectionAlbums(block: Block, albums: Album[]): Album[] {
  const shown = albums.filter(onHomepage);
  if (block.kind === "Scroll row") return shown.filter((album) => album.kind === block.source);
  if (block.kind === "Full-bleed") {
    const featured =
      shown.find((album) => album.id === block.albumId) ?? shown.find((album) => album.kind === block.source);
    return featured ? [featured] : [];
  }
  return [];
}

const SHOT_TYPES = "image/*,video/mp4,video/webm";
const OVERLAY_BUTTON =
  "flex-1 cursor-pointer py-[5px] text-center text-[10px] leading-none font-bold text-ink hover:bg-paper";

/**
 * Every picture a section shows, each one replaceable on the spot: drop a
 * file on it, upload, choose from the library, or open the album behind it.
 * A picture here is an album's cover, so replacing it changes that album's
 * cover everywhere it appears.
 */
export function SectionAlbumStrip({
  albums,
  allAlbums,
  dim,
  dispatch,
}: {
  albums: Album[];
  allAlbums: Album[];
  dim: boolean;
  dispatch: (action: AdminAction) => void;
}) {
  if (albums.length === 0) {
    return <p className="mt-[8px] font-sans text-[12px] text-draft">No live homepage albums of this type yet.</p>;
  }

  return (
    <ul className="mt-[10px] flex gap-[8px] overflow-x-auto pb-[4px] [scrollbar-width:thin]">
      {albums.map((album) => {
        const setCover = (src: string) => dispatch({ type: "album/setCover", id: album.id, src });
        const name = album.title || "Untitled album";
        return (
          <li key={album.id} className="w-[72px] shrink-0">
            <MediaDropZone
              accept={SHOT_TYPES}
              label="Drop"
              onUploaded={([src]) => setCover(src)}
              className="group relative aspect-3/4 overflow-hidden rounded-[5px] bg-well"
            >
              <CoverImage src={album.cover} pos={album.pos} video={album.video} dim={dim ? 0.4 : 1} />
              <div className="absolute inset-x-0 bottom-0 z-[2] flex flex-col divide-y divide-line bg-paper/90 font-sans opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100">
                <UploadButton accept={SHOT_TYPES} onUploaded={setCover} className={OVERLAY_BUTTON}>
                  Upload
                </UploadButton>
                <MediaLibraryButton videos onPick={setCover} className={OVERLAY_BUTTON}>
                  Library
                </MediaLibraryButton>
                <button
                  type="button"
                  className={OVERLAY_BUTTON}
                  onClick={() => dispatch({ type: "album/open", index: allAlbums.indexOf(album) })}
                >
                  Edit album
                </button>
              </div>
            </MediaDropZone>
            <p className="mt-[4px] truncate font-sans text-[11px] text-graphite" title={name}>
              {name}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

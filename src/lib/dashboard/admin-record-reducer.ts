import type { RecordAction } from "./admin-actions";
import {
  blankAlbum,
  blankArtist,
  toAlbumDraft,
  toArtistDraft,
  type AdminState,
  type AlbumDraft,
  type ArtistDraft,
  type Shot,
} from "./admin-state";
import { dropAt, fromDraft, note, patchAt, withDraft } from "./admin-helpers";
import type { AdminArtist } from "./admin-types";

/** Everything that edits an artist or an album, drawer included. */
export function recordReducer(state: AdminState, action: RecordAction): AdminState {
  switch (action.type) {
    case "artist/open": {
      const artist = state.artists[action.index];
      return {
        ...state,
        drawer: {
          kind: "artist",
          index: action.index,
          draft: artist ? toArtistDraft(artist) : blankArtist(),
        },
      };
    }

    case "artist/toggleLive": {
      const artist = state.artists[action.index];
      const artists = patchAt(state.artists, action.index, { live: !artist.live });
      return note(
        { ...state, artists },
        `${artist.name} is now ${artist.live ? "a draft" : "live"}`,
      );
    }

    case "artist/save": {
      if (state.drawer?.kind !== "artist") return state;
      const { draft, index } = state.drawer;
      if (!draft.name.trim()) {
        return { ...state, toast: "Add the artist's name to save", toastTone: "error" };
      }
      const record: AdminArtist = {
        id: draft.id,
        name: draft.name.trim(),
        categoryIds: draft.categoryIds,
        territory: draft.territory,
        image: draft.image.trim(),
        pos: draft.pos,
        live: draft.live,
        bio: draft.bio,
      };
      const artists =
        index >= 0 ? patchAt(state.artists, index, record) : [record, ...state.artists];
      return note({ ...state, artists, drawer: null }, `Saved ${record.name}`);
    }

    case "artist/delete": {
      if (state.drawer?.kind !== "artist" || state.drawer.index < 0) return state;
      const { name } = state.artists[state.drawer.index];
      return note(
        { ...state, artists: dropAt(state.artists, state.drawer.index), drawer: null },
        `Deleted ${name}`,
      );
    }

    case "album/open": {
      const album = state.albums[action.index];
      return {
        ...state,
        drawer: {
          kind: "album",
          index: action.index,
          draft: album ? toAlbumDraft(album) : blankAlbum(),
        },
      };
    }

    case "album/toggleHome": {
      const album = state.albums[action.index];
      const albums = patchAt(state.albums, action.index, { home: !album.home });
      return note(
        { ...state, albums },
        album.home
          ? `${album.title} removed from the homepage`
          : `${album.title} featured on the homepage`,
      );
    }

    case "album/save": {
      if (state.drawer?.kind !== "album") return state;
      const { draft, index } = state.drawer;
      if (!draft.title.trim()) {
        return { ...state, toast: "Add an album title to save", toastTone: "error" };
      }
      const record = fromDraft(draft);
      const albums =
        index >= 0 ? patchAt(state.albums, index, record) : [record, ...state.albums];
      return note({ ...state, albums, drawer: null }, `Saved ${record.title}`);
    }

    case "album/delete": {
      if (state.drawer?.kind !== "album" || state.drawer.index < 0) return state;
      const { title } = state.albums[state.drawer.index];
      return note(
        { ...state, albums: dropAt(state.albums, state.drawer.index), drawer: null },
        `Deleted ${title}`,
      );
    }

    case "draft/set":
      return withDraft(state, () => action.patch);

    case "draft/toggleCat":
      return withDraft(state, (draft: ArtistDraft) => ({
        categoryIds: draft.categoryIds.includes(action.id)
          ? draft.categoryIds.filter((id) => id !== action.id)
          : [...draft.categoryIds, action.id],
      }));

    case "draft/addCredit":
      return withDraft(state, (draft: AlbumDraft) => ({
        credits: [...draft.credits, { name: "", role: "" }],
      }));

    case "draft/setCredit":
      return withDraft(state, (draft: AlbumDraft) => ({
        credits: patchAt(draft.credits, action.index, action.patch),
      }));

    case "draft/removeCredit":
      return withDraft(state, (draft: AlbumDraft) => ({
        credits: dropAt(draft.credits, action.index),
      }));

    case "draft/addShot":
      return withDraft(state, (draft: AlbumDraft) => ({
        shots: [...draft.shots, { src: "", pos: "50% 18%" } as Shot],
      }));

    case "draft/removeShot":
      return withDraft(state, (draft: AlbumDraft) => ({
        shots: dropAt(draft.shots, action.index),
      }));

    case "drawer/close":
      return { ...state, drawer: null };
  }
}

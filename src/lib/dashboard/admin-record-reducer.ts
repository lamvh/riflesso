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
import { plural } from "./admin-changes";
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
        `${artist.name} is now ${artist.live ? "hidden" : "visible"}`,
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

    case "draft/appendShots":
      return withDraft(state, (draft: AlbumDraft) => {
        /* Fill empty frames first, then add new ones. */
        const queue = [...action.srcs];
        const shots = draft.shots.map((shot) =>
          !shot.src.trim() && queue.length ? { ...shot, src: queue.shift()! } : shot,
        );
        return { shots: [...shots, ...queue.map((src): Shot => ({ src, pos: "50% 18%" }))] };
      });

    case "artist/bulkLive": {
      const ids = new Set(action.ids);
      const artists = state.artists.map((artist) =>
        ids.has(artist.id) ? { ...artist, live: action.live } : artist,
      );
      return note(
        { ...state, artists, drawer: null },
        `${plural(ids.size, "artist")} ${action.live ? "shown in" : "hidden from"} the directory`,
      );
    }

    case "artist/bulkCategory": {
      const ids = new Set(action.ids);
      const cat = state.cats.find((entry) => entry.id === action.catId);
      if (!cat) return state;
      const artists = state.artists.map((artist) => {
        if (!ids.has(artist.id)) return artist;
        const has = artist.categoryIds.includes(cat.id);
        if (has === action.add) return artist;
        return {
          ...artist,
          categoryIds: action.add
            ? [...artist.categoryIds, cat.id]
            : artist.categoryIds.filter((id) => id !== cat.id),
        };
      });
      return note(
        { ...state, artists, drawer: null },
        `${cat.name} ${action.add ? "added to" : "removed from"} ${plural(ids.size, "artist")}`,
      );
    }

    case "artist/bulkDelete": {
      const ids = new Set(action.ids);
      return note(
        { ...state, artists: state.artists.filter((artist) => !ids.has(artist.id)), drawer: null },
        `Deleted ${plural(ids.size, "artist")}`,
      );
    }

    case "album/bulkSet": {
      const ids = new Set(action.ids);
      const albums = state.albums.map((album) =>
        ids.has(album.id) ? { ...album, ...action.patch } : album,
      );
      const { live, home } = action.patch;
      const what =
        live !== undefined
          ? live
            ? "published"
            : "moved to draft"
          : home
            ? "featured on the homepage"
            : "removed from the homepage";
      return note({ ...state, albums, drawer: null }, `${plural(ids.size, "album")} ${what}`);
    }

    case "album/bulkDelete": {
      const ids = new Set(action.ids);
      return note(
        { ...state, albums: state.albums.filter((album) => !ids.has(album.id)), drawer: null },
        `Deleted ${plural(ids.size, "album")}`,
      );
    }
  }
}

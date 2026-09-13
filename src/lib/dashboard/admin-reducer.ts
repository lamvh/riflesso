import {
  pickSiteContent,
  type SiteContent,
} from "@/lib/content/site-content-types";

import { isRecordAction, isSettingsAction, type AdminAction } from "./admin-actions";
import { dropAt, note, patchAt, swap } from "./admin-helpers";
import { recordReducer } from "./admin-record-reducer";
import { settingsReducer } from "./admin-settings-reducer";
import { newId, type AdminState } from "./admin-state";
import type { Block, CategoryRow } from "./admin-types";

export type { AdminAction } from "./admin-actions";

/**
 * Records and site settings are edited in their own reducers; everything left
 * here is how the site is arranged — the directory's disciplines, the banner,
 * the sections — plus the session's own furniture.
 */
export function adminReducer(state: AdminState, action: AdminAction): AdminState {
  if (isRecordAction(action)) return recordReducer(state, action);
  if (isSettingsAction(action)) return settingsReducer(state, action);

  switch (action.type) {
    case "cat/setNew":
      return { ...state, newCat: action.name };

    case "cat/add": {
      const name = state.newCat.trim();
      if (!name) return { ...state, toast: "Type a category name first" };
      const cats: CategoryRow[] = [...state.cats, { id: newId(), name, visible: true }];
      return note({ ...state, cats, newCat: "" }, `Added ${name}`);
    }

    case "cat/rename":
      return {
        ...state,
        cats: patchAt(state.cats, action.index, { name: action.name }),
      };

    case "cat/toggle": {
      const cat = state.cats[action.index];
      const cats = patchAt(state.cats, action.index, { visible: !cat.visible });
      return note(
        { ...state, cats },
        cat.visible
          ? `${cat.name} hidden from the directory`
          : `${cat.name} shown in the directory`,
      );
    }

    case "cat/move":
      return { ...state, cats: swap(state.cats, action.index, action.delta) };

    case "cat/remove": {
      const removed = state.cats[action.index];
      /* The link table cascades in the database; mirror that here. */
      const artists = state.artists.map((artist) =>
        artist.categoryIds.includes(removed.id)
          ? { ...artist, categoryIds: artist.categoryIds.filter((id) => id !== removed.id) }
          : artist,
      );
      return note(
        { ...state, artists, cats: dropAt(state.cats, action.index) },
        `Removed ${removed.name}`,
      );
    }

    case "slide/add":
      return note(
        {
          ...state,
          slides: [
            ...state.slides,
            {
              id: newId(),
              pub: "Untitled",
              credit: "Artist — Role",
              src: "",
              pos: "50% 18%",
              ink: "#fff",
            },
          ],
          slide: state.slides.length,
        },
        "Slide added to the banner",
      );

    case "slide/select":
      return { ...state, slide: action.index };

    case "slide/set":
      return { ...state, slides: patchAt(state.slides, state.slide, action.patch) };

    case "slide/move": {
      const slides = swap(state.slides, state.slide, action.delta);
      if (slides === state.slides) return state;
      return { ...state, slides, slide: state.slide + action.delta };
    }

    case "slide/remove":
      return note(
        {
          ...state,
          slides: dropAt(state.slides, state.slide),
          slide: Math.max(0, state.slide - 1),
        },
        "Slide removed from the banner",
      );

    case "block/toggle": {
      const block: Block = state.blocks[action.index];
      const blocks = patchAt(state.blocks, action.index, { on: !block.on });
      return note(
        { ...state, blocks },
        `${block.label} ${block.on ? "hidden" : "shown"} on the homepage`,
      );
    }

    case "block/move":
      return { ...state, blocks: swap(state.blocks, action.index, action.delta) };

    case "toast":
      return { ...state, toast: action.message };

    case "restore":
      return {
        ...state,
        ...pickSiteContent(action.content),
        activity: action.activity,
        hydrated: true,
      };

    case "hydrated":
      return { ...state, hydrated: true };

    case "discard":
      return note(
        {
          ...state,
          ...(JSON.parse(state.baseline) as SiteContent),
          drawer: null,
          slide: 0,
        },
        "Unpublished changes discarded",
      );

    case "published":
      return note(
        {
          ...state,
          revision: action.revision,
          baseline: action.baseline,
          source: "database",
        },
        "Published to the live site",
      );
  }
}

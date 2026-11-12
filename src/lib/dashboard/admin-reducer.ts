import { pickSiteContent } from "@/lib/content/site-content-types";
import { withVisibilityDefaults } from "@/lib/content/site-visibility";

import { isRecordAction, isSettingsAction, type AdminAction } from "./admin-actions";
import { dropAt, moveItem, note, patchAt, swap } from "./admin-helpers";
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
      if (!name) {
        return { ...state, toast: "Type a category name first", toastTone: "error" };
      }
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
              hidden: false,
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

    case "list/reorder": {
      const { from, to } = action;
      switch (action.list) {
        case "cats":
          return { ...state, cats: moveItem(state.cats, from, to) };
        case "blocks":
          return { ...state, blocks: moveItem(state.blocks, from, to) };
        case "contacts":
          return { ...state, contacts: moveItem(state.contacts, from, to) };
        case "slides": {
          /* The slide being edited stays selected wherever it lands. */
          const selected = state.slides[state.slide]?.id;
          const slides = moveItem(state.slides, from, to);
          return {
            ...state,
            slides,
            slide: Math.max(0, slides.findIndex((slide) => slide.id === selected)),
          };
        }
      }
      return state;
    }

    case "block/move":
      return { ...state, blocks: swap(state.blocks, action.index, action.delta) };

    case "toast":
      return { ...state, toast: action.message, toastTone: action.tone ?? "info" };

    case "restore":
      return {
        ...state,
        /* A draft stored before the visibility flags existed lacks them. */
        ...pickSiteContent(withVisibilityDefaults(action.content)),
        activity: action.activity,
        hydrated: true,
      };

    case "hydrated":
      return { ...state, hydrated: true };

    /* Silent: saves happen after every edit, so the activity feed records the
       edits themselves, not each save. */
    case "saved":
      return {
        ...state,
        revision: action.revision,
        baseline: action.baseline,
        source: "database",
        /* Lines logged while the save was in flight belong to the next one. */
        unsavedActivity: state.unsavedActivity.slice(
          0,
          Math.max(0, state.unsavedActivity.length - action.sentActivity),
        ),
        restoring: false,
      };

    case "history/restore":
      return {
        ...note(
          {
            ...state,
            ...pickSiteContent(withVisibilityDefaults(action.content)),
            drawer: null,
            slide: 0,
            /* The restore is the whole story of the next save. */
            unsavedActivity: [],
          },
          `Restored the site as of ${action.label}`,
        ),
        restoring: true,
      };

    case "autosave/pause":
      return {
        ...state,
        autosavePaused: action.paused,
        toast: action.paused
          ? "Auto-save paused — edits stay here until you save"
          : "Auto-save is back on",
        toastTone: "info",
      };
  }
}

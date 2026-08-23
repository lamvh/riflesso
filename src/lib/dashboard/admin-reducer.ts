import { isRecordAction, type AdminAction } from "./admin-actions";
import { dropAt, note, patchAt, swap } from "./admin-helpers";
import { recordReducer } from "./admin-record-reducer";
import { initialAdminState, type AdminState } from "./admin-state";
import type { Block, CategoryRow } from "./admin-types";

export type { AdminAction } from "./admin-actions";

/**
 * Records are edited in their own reducer; everything left here is how the
 * site is arranged — the directory's disciplines, the banner, the sections —
 * plus the session's own furniture.
 */
export function adminReducer(state: AdminState, action: AdminAction): AdminState {
  if (isRecordAction(action)) return recordReducer(state, action);

  switch (action.type) {
    case "cat/setNew":
      return { ...state, newCat: action.name };

    case "cat/add": {
      const name = state.newCat.trim();
      if (!name) return { ...state, toast: "Type a category name first" };
      const cats: CategoryRow[] = [...state.cats, { name, visible: true }];
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

    case "cat/remove":
      return note(
        { ...state, cats: dropAt(state.cats, action.index) },
        `Removed ${state.cats[action.index].name}`,
      );

    case "slide/add":
      return note(
        {
          ...state,
          slides: [
            ...state.slides,
            {
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
      return { ...initialAdminState(), ...action.state, hydrated: true };

    case "hydrated":
      return { ...state, hydrated: true };

    case "reset":
      return initialAdminState();
  }
}

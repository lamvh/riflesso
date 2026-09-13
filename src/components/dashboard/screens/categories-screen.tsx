"use client";

import { useAdmin } from "../admin-store";
import { OutlineButton, SolidButton, Switch } from "../ui/controls";
import { ColumnHead } from "../ui/fields";

const GRID = "grid grid-cols-[32px_1.6fr_90px_150px_120px] gap-[16px]";

export function CategoriesScreen() {
  const { state, dispatch } = useAdmin();

  /** How many artists carry a discipline. Linked by id, so a rename keeps the count. */
  const countFor = (id: string) =>
    state.artists.filter((artist) => artist.categoryIds.includes(id)).length;

  return (
    <section className="max-w-[900px] px-[28px] pt-[24px] pb-[60px]">
      <div className="flex items-center gap-[10px] border-b border-ink pb-[20px]">
        <label htmlFor="new-cat" className="sr-only">
          New category name
        </label>
        <input
          id="new-cat"
          type="text"
          value={state.newCat}
          placeholder="New category name..."
          onChange={(event) =>
            dispatch({ type: "cat/setNew", name: event.target.value })
          }
          className="min-w-0 flex-1 border border-ink bg-paper px-[11px] py-[10px] font-serif text-[15px] leading-none"
        />
        <SolidButton onClick={() => dispatch({ type: "cat/add" })}>Add</SolidButton>
      </div>

      <div className={`${GRID} border-b border-ink px-[2px] py-[12px]`}>
        <ColumnHead>#</ColumnHead>
        <ColumnHead>Category</ColumnHead>
        <ColumnHead>Artists</ColumnHead>
        <ColumnHead>Show in directory</ColumnHead>
        <ColumnHead align="right">Order</ColumnHead>
      </div>

      {state.cats.map((cat, index) => (
        <div
          key={cat.id}
          className={`${GRID} items-center border-b border-rule px-[2px] py-[9px]`}
        >
          <span className="font-sans text-[12px] leading-none font-bold text-dim">
            {index + 1}
          </span>

          <input
            type="text"
            value={cat.name}
            aria-label={`Rename ${cat.name}`}
            onChange={(event) =>
              dispatch({ type: "cat/rename", index, name: event.target.value })
            }
            className="w-full border border-transparent bg-paper px-[8px] py-[7px] font-sans text-[15px] leading-none font-bold tracking-[-0.6px] focus:border-ink"
          />

          <span className="font-serif text-[15px] leading-none">
            {countFor(cat.id)}
          </span>

          <span className="justify-self-start">
            <Switch
              on={cat.visible}
              label={`Toggle ${cat.name}`}
              onClick={() => dispatch({ type: "cat/toggle", index })}
            />
          </span>

          <div className="flex justify-self-end gap-[6px]">
            <OutlineButton small onClick={() => dispatch({ type: "cat/move", index, delta: -1 })}>
              ↑
            </OutlineButton>
            <OutlineButton small onClick={() => dispatch({ type: "cat/move", index, delta: 1 })}>
              ↓
            </OutlineButton>
            <OutlineButton small onClick={() => dispatch({ type: "cat/remove", index })}>
              ✕
            </OutlineButton>
          </div>
        </div>
      ))}
    </section>
  );
}

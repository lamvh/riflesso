"use client";

import { plural } from "@/lib/dashboard/admin-changes";

import { useAdmin } from "../admin-store";
import { Button, IconButton, Switch } from "../ui/controls";
import { NameInput } from "../ui/fields";
import { ArrowDownIcon, ArrowUpIcon, CrossIcon } from "../ui/icons";
import { Panel } from "../ui/panel";

export function CategoriesScreen() {
  const { state, dispatch } = useAdmin();

  /** Linked by id, so a rename keeps the count. */
  const countFor = (id: string) =>
    state.artists.filter((artist) => artist.categoryIds.includes(id)).length;

  const remove = (index: number) => {
    const cat = state.cats[index];
    const count = countFor(cat.id);
    if (
      count === 0 ||
      window.confirm(`Remove ${cat.name}? It is taken off ${plural(count, "artist")}.`)
    ) {
      dispatch({ type: "cat/remove", index });
    }
  };

  return (
    <div className="max-w-[820px]">
      <Panel
        title="Directory categories"
        description="The filter lists them in this order. A hidden category stays on artists but leaves the filter."
        bodyClassName=""
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            dispatch({ type: "cat/add" });
          }}
          className="flex gap-[8px] border-b border-line px-[16px] py-[14px]"
        >
          <label htmlFor="new-cat" className="sr-only">
            New category name
          </label>
          <div className="min-w-0 flex-1">
            <NameInput
              id="new-cat"
              size={15}
              value={state.newCat}
              placeholder="New category name"
              onChange={(name) => dispatch({ type: "cat/setNew", name })}
            />
          </div>
          <Button type="submit" variant="primary" className="h-[40px]">
            Add
          </Button>
        </form>

        <ul>
          {state.cats.map((cat, index) => {
            const count = countFor(cat.id);
            return (
              <li
                key={cat.id}
                className="flex items-center gap-[10px] border-b border-line px-[16px] py-[8px] last:border-b-0"
              >
                <span className="w-[20px] shrink-0 text-right font-sans text-[12px] text-graphite tabular-nums">
                  {index + 1}
                </span>

                <input
                  type="text"
                  value={cat.name}
                  aria-label={`Name of category ${index + 1}`}
                  onChange={(event) =>
                    dispatch({ type: "cat/rename", index, name: event.target.value })
                  }
                  className={`min-w-0 flex-1 rounded-[2px] border border-transparent bg-transparent px-[8px] py-[7px] font-sans text-[15px] font-bold tracking-[-0.3px] transition-colors hover:border-line focus:border-ink focus:bg-paper focus:outline-none ${
                    cat.visible ? "text-ink" : "text-graphite"
                  }`}
                />

                <span className="hidden w-[84px] shrink-0 font-sans text-[13px] text-graphite tabular-nums sm:block">
                  {plural(count, "artist")}
                </span>

                <span className="hidden w-[56px] shrink-0 text-right font-sans text-[13px] text-graphite sm:block">
                  {cat.visible ? "In filter" : "Hidden"}
                </span>
                <Switch
                  on={cat.visible}
                  label={`Show ${cat.name} in the directory filter`}
                  onClick={() => dispatch({ type: "cat/toggle", index })}
                />

                <div className="ml-[6px] flex shrink-0">
                  <IconButton
                    label={`Move ${cat.name} up`}
                    disabled={index === 0}
                    onClick={() => dispatch({ type: "cat/move", index, delta: -1 })}
                  >
                    <ArrowUpIcon />
                  </IconButton>
                  <IconButton
                    label={`Move ${cat.name} down`}
                    disabled={index === state.cats.length - 1}
                    onClick={() => dispatch({ type: "cat/move", index, delta: 1 })}
                  >
                    <ArrowDownIcon />
                  </IconButton>
                  <IconButton label={`Remove ${cat.name}`} tone="danger" onClick={() => remove(index)}>
                    <CrossIcon />
                  </IconButton>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}

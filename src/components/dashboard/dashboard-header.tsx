"use client";

import { usePathname } from "next/navigation";

import type { AdminAction } from "@/lib/dashboard/admin-actions";
import {
  adminTotals,
  pageTitle,
  viewFromPath,
  type View,
} from "@/lib/dashboard/admin-views";

import { useAdmin } from "./admin-store";
import { SaveStatusIndicator } from "./save-status";
import { Button, buttonClass } from "./ui/controls";
import { openCommandPalette } from "./command-palette-events";
import { ExternalIcon, PlusIcon, SearchMarkIcon } from "./ui/icons";
import { useContentPreview } from "./use-content-preview";

/** The sidebar group each screen sits in, repeated above its title. */
const EYEBROW: Record<View, string> = {
  overview: "Riflesso Studio",
  artists: "Library",
  albums: "Library",
  cats: "Library",
  media: "Library",
  home: "Site",
  settings: "Site",
  history: "System",
  status: "System",
};

/**
 * The add action each screen offers from its header. Media has none: a file
 * uploaded there would belong to no record, which is the waste it exists to find.
 */
function addActionFor(view: View): [string, AdminAction] | null {
  switch (view) {
    case "artists":
      return ["New artist", { type: "artist/open", index: -1 }];
    case "cats":
      return ["Add category", { type: "cat/add" }];
    case "home":
      return ["Add slide", { type: "slide/add" }];
    case "settings":
      return ["Add contact card", { type: "contact/add" }];
    case "media":
    case "status":
    case "history":
      return null;
    case "albums":
    case "overview":
      return ["New album", { type: "album/open", index: -1 }];
  }
}

export function DashboardHeader() {
  const { state, dispatch } = useAdmin();
  const view = viewFromPath(usePathname());
  const [title, note] = pageTitle(view, adminTotals(state));
  const add = addActionFor(view);
  const { openPreview, opening } = useContentPreview();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-seamless/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-x-6 gap-y-3 px-[16px] pt-[20px] pb-[16px] sm:px-[28px]">
        <div className="min-w-0">
          <p className="font-sans text-[11px] leading-none font-bold tracking-[0.12em] text-graphite uppercase">
            {EYEBROW[view]}
          </p>
          <h1 className="mt-[8px] font-serif text-[32px] leading-[105%] tracking-[-0.6px] sm:text-[36px]">
            {title}
          </h1>
          <p className="mt-[6px] font-sans text-[14px] leading-[140%] text-graphite">{note}</p>
        </div>

        <div className="flex flex-wrap items-center gap-[8px]">
          <button
            type="button"
            onClick={openCommandPalette}
            className={`${buttonClass("secondary")} w-[200px] justify-start text-graphite max-sm:w-auto`}
          >
            <SearchMarkIcon size={14} />
            <span className="flex-1 text-left max-sm:hidden">Search…</span>
            <kbd className="rounded-[4px] border border-line bg-hover px-[5px] py-[2px] font-sans text-[11px] text-graphite max-sm:hidden">
              ⌘K
            </kbd>
          </button>
          <Button
            variant="ghost"
            disabled={opening}
            title="Open the site with the edits made here, saved or not"
            onClick={() => openPreview("/")}
          >
            {opening ? "Opening…" : "Preview"}
          </Button>
          <a href="/" target="_blank" rel="noreferrer" className={buttonClass("ghost")}>
            View site
            <ExternalIcon size={13} />
          </a>
          {add && (
            <Button onClick={() => dispatch(add[1])}>
              <PlusIcon />
              {add[0]}
            </Button>
          )}
          <SaveStatusIndicator />
        </div>
      </div>
    </header>
  );
}

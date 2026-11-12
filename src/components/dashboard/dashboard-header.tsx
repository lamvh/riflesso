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
    <header className="z-10 border-b border-line bg-seamless/90 backdrop-blur-md lg:sticky lg:top-0">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-x-[12px] gap-y-3 px-[16px] pt-[12px] pb-[12px] sm:flex-wrap sm:px-[28px] lg:items-end lg:gap-x-6 lg:pt-[20px] lg:pb-[16px]">
        <div className="min-w-0 flex-1 lg:flex-none">
          <p className="hidden font-sans text-[11px] leading-none font-bold tracking-[0.12em] text-graphite uppercase lg:block">
            {EYEBROW[view]}
          </p>
          <h1 className="truncate font-serif text-[24px] leading-[110%] tracking-[-0.4px] lg:mt-[8px] lg:text-[36px] lg:leading-[105%] lg:tracking-[-0.6px]">
            {title}
          </h1>
          <p className="mt-[3px] truncate font-sans text-[13px] leading-[140%] text-graphite lg:mt-[6px] lg:text-[14px] lg:whitespace-normal">
            {note}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-[8px] sm:flex-wrap">
          <button
            type="button"
            onClick={openCommandPalette}
            className={`${buttonClass("secondary")} w-[200px] justify-start text-graphite max-lg:hidden`}
          >
            <SearchMarkIcon size={14} />
            <span className="flex-1 text-left max-sm:hidden">Search…</span>
            <kbd className="rounded-[4px] border border-line bg-hover px-[5px] py-[2px] font-sans text-[11px] text-graphite max-sm:hidden">
              ⌘K
            </kbd>
          </button>
          <Button
            variant="ghost"
            className="max-sm:hidden"
            disabled={opening}
            title="Open the site with the edits made here, saved or not"
            onClick={() => openPreview("/")}
          >
            {opening ? "Opening…" : "Preview"}
          </Button>
          <a href="/" target="_blank" rel="noreferrer" className={`${buttonClass("ghost")} max-sm:hidden`}>
            View site
            <ExternalIcon size={13} />
          </a>
          {add && (
            <Button onClick={() => dispatch(add[1])} title={add[0]}>
              <PlusIcon />
              {/* On a phone the plus alone stands for "New …". */}
              <span className="max-sm:hidden">{add[0]}</span>
              <span className="sr-only sm:hidden">{add[0]}</span>
            </Button>
          )}
          <div className="max-lg:hidden">
            <SaveStatusIndicator />
          </div>
        </div>
      </div>
    </header>
  );
}

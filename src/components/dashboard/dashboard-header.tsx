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
import { PublishTray } from "./publish-tray";
import { Button, buttonClass } from "./ui/controls";
import { PlusIcon } from "./ui/icons";

/** The add action each screen offers from its header. */
function addActionFor(view: View): [string, AdminAction] {
  switch (view) {
    case "artists":
      return ["New artist", { type: "artist/open", index: -1 }];
    case "cats":
      return ["Add category", { type: "cat/add" }];
    case "home":
      return ["Add slide", { type: "slide/add" }];
    case "settings":
      return ["Add contact card", { type: "contact/add" }];
    case "albums":
    case "overview":
      return ["New album", { type: "album/open", index: -1 }];
  }
}

export function DashboardHeader() {
  const { state, dispatch } = useAdmin();
  const view = viewFromPath(usePathname());
  const [title, note] = pageTitle(view, adminTotals(state));
  const [label, action] = addActionFor(view);

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-seamless/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-x-6 gap-y-3 px-[16px] py-[16px] sm:px-[28px]">
        <div className="min-w-0">
          <h1 className="font-sans text-[28px] leading-[110%] font-bold tracking-[-1px]">
            {title}
          </h1>
          <p className="mt-[5px] font-sans text-[14px] leading-[140%] text-graphite">{note}</p>
        </div>

        <div className="flex flex-wrap items-center gap-[8px]">
          <a href="/" target="_blank" rel="noreferrer" className={buttonClass("ghost")}>
            View site
          </a>
          <Button onClick={() => dispatch(action)}>
            <PlusIcon />
            {label}
          </Button>
          <PublishTray />
        </div>
      </div>
    </header>
  );
}

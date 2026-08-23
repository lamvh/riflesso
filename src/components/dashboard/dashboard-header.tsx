"use client";

import { usePathname } from "next/navigation";

import { adminTotals, pageTitle, viewFromPath } from "@/lib/dashboard/admin-views";

import { useAdmin } from "./admin-store";
import { SolidButton } from "./ui/controls";

/** Label and action of the header's primary button, per screen. */
function primaryFor(view: ReturnType<typeof viewFromPath>) {
  switch (view) {
    case "artists":
      return ["+ New artist", { type: "artist/open", index: -1 }] as const;
    case "cats":
      return ["+ Category", { type: "cat/add" }] as const;
    case "home":
      return ["+ Hero slide", { type: "slide/add" }] as const;
    case "albums":
      return ["+ New album", { type: "album/open", index: -1 }] as const;
    case "overview":
      return ["+ New content", { type: "album/open", index: -1 }] as const;
  }
}

export function DashboardHeader() {
  const { state, dispatch } = useAdmin();
  const view = viewFromPath(usePathname());
  const [title, note] = pageTitle(view, adminTotals(state));
  const [label, action] = primaryFor(view);

  return (
    <header className="sticky top-0 z-[4] flex items-end justify-between gap-6 border-b border-ink bg-paper px-[28px] py-[20px]">
      <div>
        <h1 className="font-sans text-[34px] leading-[95%] font-bold tracking-[-2px]">
          {title}
        </h1>
        <p className="mt-[8px] font-serif text-[15px] leading-none text-dim">{note}</p>
      </div>

      <div className="flex items-center gap-[10px]">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="border border-ink px-[15px] py-[10px] font-sans text-[13px] leading-none font-bold tracking-[-0.4px]"
        >
          View site
        </a>
        <SolidButton onClick={() => dispatch(action)}>{label}</SolidButton>
      </div>
    </header>
  );
}

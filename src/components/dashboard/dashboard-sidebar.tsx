"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { DEFAULT_LOGO_URL } from "@/lib/content/site-content-types";
import { plural, type ChangeArea } from "@/lib/dashboard/admin-changes";
import {
  VIEW_HREF,
  VIEW_LABEL,
  adminTotals,
  navCount,
  viewFromPath,
  type View,
} from "@/lib/dashboard/admin-views";
import { canOptimizeImage, isPublishableSrc } from "@/lib/media-src";

import { useAdmin } from "./admin-store";

/**
 * The wordmark renders at the site's locked dimensions. Its file comes from
 * Site settings, so an edit to the logo previews here before it is published.
 */
const WORDMARK_WIDTH = 116;
const WORDMARK_HEIGHT = 20;

/** Library holds the records; Site holds how they are arranged and framed. */
const GROUPS: { label?: string; views: View[] }[] = [
  { views: ["overview"] },
  { label: "Library", views: ["artists", "albums", "cats"] },
  { label: "Site", views: ["home", "settings"] },
];

export function DashboardSidebar() {
  const { state, changes } = useAdmin();
  const current = viewFromPath(usePathname());
  const totals = adminTotals(state);
  const typed = state.settings.logoUrl.trim();
  const logo = isPublishableSrc(typed) ? typed : DEFAULT_LOGO_URL;

  return (
    <aside className="border-b border-line bg-seamless lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-[232px] lg:flex-col lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-4 px-[20px] pt-[18px] pb-[12px] lg:block lg:pt-[24px] lg:pb-[24px]">
        <Link href="/dashboard" className="flex w-fit">
          <Image
            src={logo}
            alt={state.settings.logoAlt || "Riflesso"}
            width={WORDMARK_WIDTH}
            height={WORDMARK_HEIGHT}
            priority
            unoptimized={!canOptimizeImage(logo)}
            className="h-[20px] w-auto"
          />
        </Link>
        <p className="font-sans text-[13px] leading-none text-graphite lg:mt-[10px]">
          Content admin
        </p>
      </div>

      <nav
        aria-label="Dashboard"
        className="flex gap-[2px] overflow-x-auto px-[12px] pb-[12px] [scrollbar-width:none] lg:flex-1 lg:flex-col lg:gap-[20px] lg:overflow-y-auto lg:pb-[20px]"
      >
        {GROUPS.map((group) => (
          <div key={group.label ?? "top"} className="flex gap-[2px] lg:flex-col">
            {group.label && (
              <p className="hidden px-[10px] pb-[6px] font-sans text-[12px] leading-none font-medium text-graphite lg:block">
                {group.label}
              </p>
            )}
            {group.views.map((view) => {
              const active = view === current;
              const count = navCount(view, totals);
              const pending = view === "overview" ? 0 : changes[view as ChangeArea];
              return (
                <Link
                  key={view}
                  href={VIEW_HREF[view]}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-[34px] shrink-0 items-center gap-[10px] rounded-[2px] px-[10px] font-sans text-[14px] leading-none whitespace-nowrap transition-colors ${
                    active
                      ? "bg-paper font-bold text-ink shadow-[inset_0_0_0_1px_var(--color-line)]"
                      : "font-medium text-[#3d3d3b] hover:bg-[#dcdcd9]"
                  }`}
                >
                  <span className="flex-1">{VIEW_LABEL[view]}</span>
                  {pending > 0 && (
                    <span
                      title={`${plural(pending, "unpublished change")}`}
                      className="h-[7px] w-[7px] rounded-full bg-draft"
                    >
                      <span className="sr-only">{plural(pending, "unpublished change")}</span>
                    </span>
                  )}
                  {count !== null && (
                    <span className="font-sans text-[12px] font-medium text-graphite tabular-nums">
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="hidden border-t border-line px-[20px] py-[16px] lg:block">
        <p className="font-sans text-[13px] leading-none font-bold">Diego Nguyen</p>
        <p className="mt-[6px] font-sans text-[12px] leading-none text-graphite">
          Editor, Ho Chi Minh City
        </p>
      </div>
    </aside>
  );
}

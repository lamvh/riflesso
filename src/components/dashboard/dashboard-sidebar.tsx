"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { DEFAULT_LOGO_URL } from "@/lib/content/site-content-types";
import { CHANGE_AREAS, plural, type ChangeArea } from "@/lib/dashboard/admin-changes";
import {
  VIEW_HREF,
  VIEW_LABEL,
  adminTotals,
  navCount,
  viewFromPath,
  type View,
} from "@/lib/dashboard/admin-views";
import { canOptimizeImage, isPublishableSrc } from "@/lib/media-src";
import {
  HIDEABLE_PARTS,
  isPartShown,
  toggledParts,
  type HideablePart,
} from "@/lib/content/site-visibility";

import { useAdmin } from "./admin-store";
import {
  AlbumIcon,
  EyeIcon,
  EyeOffIcon,
  GearIcon,
  HomeIcon,
  OverviewIcon,
  PersonIcon,
  PulseIcon,
  StackIcon,
  TagIcon,
} from "./ui/icons";

/**
 * The wordmark renders at the site's locked dimensions. Its file comes from
 * Site settings, so an edit to the logo previews here as it is typed.
 */
const WORDMARK_WIDTH = 116;
const WORDMARK_HEIGHT = 20;

/** Library holds the records; Site holds how they are arranged and framed. */
const GROUPS: { label?: string; views: View[] }[] = [
  { views: ["overview"] },
  { label: "Library", views: ["artists", "albums", "cats", "media"] },
  { label: "Site", views: ["home", "settings"] },
  { label: "System", views: ["status"] },
];

/**
 * Menu items that double as a quick switch for the public page they manage, so
 * hiding it does not mean a trip to Site settings → Visibility.
 */
const QUICK_HIDE: Partial<Record<View, HideablePart>> = {
  artists: "page:artists",
};

const VIEW_ICON: Record<View, (props: { size?: number }) => ReactNode> = {
  overview: OverviewIcon,
  artists: PersonIcon,
  albums: AlbumIcon,
  cats: TagIcon,
  media: StackIcon,
  home: HomeIcon,
  settings: GearIcon,
  status: PulseIcon,
};

export function DashboardSidebar() {
  const { state, dispatch, changes } = useAdmin();

  const togglePart = (part: HideablePart) => {
    const label = HIDEABLE_PARTS.find((entry) => entry.key === part)?.label ?? "Page";
    const willHide = isPartShown(state.settings, part);
    dispatch({
      type: "settings/set",
      patch: { hiddenParts: toggledParts(state.settings, part) },
    });
    dispatch({
      type: "toast",
      message: willHide ? `${label} hidden from visitors` : `${label} is back on the site`,
    });
  };
  const current = viewFromPath(usePathname());
  const totals = adminTotals(state);
  const typed = state.settings.logoUrl.trim();
  const logo = isPublishableSrc(typed) ? typed : DEFAULT_LOGO_URL;

  return (
    <aside className="border-b border-line bg-paper lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-[232px] lg:flex-col lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-4 px-[20px] pt-[18px] pb-[12px] lg:block lg:border-b lg:border-line lg:pt-[26px] lg:pb-[22px]">
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
        <p className="font-serif text-[14px] leading-none text-graphite italic lg:mt-[12px]">
          Content admin
        </p>
      </div>

      <nav
        aria-label="Dashboard"
        className="flex gap-[2px] overflow-x-auto px-[12px] pb-[12px] [scrollbar-width:none] lg:flex-1 lg:flex-col lg:gap-[22px] lg:overflow-y-auto lg:pt-[18px] lg:pb-[20px]"
      >
        {GROUPS.map((group) => (
          <div key={group.label ?? "top"} className="flex gap-[2px] lg:flex-col">
            {group.label && (
              <p className="hidden px-[10px] pb-[8px] font-sans text-[11px] leading-none font-bold tracking-[0.12em] text-graphite uppercase lg:block">
                {group.label}
              </p>
            )}
            {group.views.map((view) => {
              const active = view === current;
              const count = navCount(view, totals);
              /* Overview and Media hold nothing publishable of their own. */
              const pending = CHANGE_AREAS.includes(view as ChangeArea)
                ? changes[view as ChangeArea]
                : 0;
              const quickPart = QUICK_HIDE[view];
              const pageShown = !quickPart || isPartShown(state.settings, quickPart);
              const Icon = VIEW_ICON[view];
              return (
                <div key={view} className="relative flex shrink-0">
                  <Link
                    href={VIEW_HREF[view]}
                    aria-current={active ? "page" : undefined}
                    className={`group/nav relative flex h-[36px] flex-1 items-center gap-[10px] rounded-[8px] px-[10px] font-sans text-[14px] leading-none whitespace-nowrap transition-colors ${
                      quickPart ? "pr-[40px]" : ""
                    } ${
                      active
                        ? "bg-seamless font-bold text-ink"
                        : "font-medium text-body hover:bg-hover hover:text-ink"
                    }`}
                  >
                    {/* The active screen is marked by a short ink rule at the
                        sidebar edge, like a ribbon in a book. */}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute top-[9px] bottom-[9px] -left-[12px] hidden w-[3px] rounded-r-full bg-ink lg:block"
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className={active ? "text-ink" : "text-graphite group-hover/nav:text-ink"}
                    >
                      <Icon size={16} />
                    </span>
                    <span
                      className={`flex-1 ${pageShown ? "" : "text-graphite line-through decoration-1"}`}
                    >
                      {VIEW_LABEL[view]}
                    </span>
                    {pending > 0 && (
                      <span
                        title={`${plural(pending, "unsaved change")}`}
                        className="h-[7px] w-[7px] rounded-full bg-draft"
                      >
                        <span className="sr-only">{plural(pending, "unsaved change")}</span>
                      </span>
                    )}
                    {count !== null && (
                      <span
                        className={`min-w-[22px] rounded-full px-[6px] py-[3px] text-center font-sans text-[11px] font-bold tabular-nums ${
                          active ? "bg-paper text-ink" : "bg-seamless text-graphite"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </Link>
                  {/* Beside the link, not inside it: a button inside <a> is invalid. */}
                  {quickPart && (
                    <button
                      type="button"
                      aria-pressed={!pageShown}
                      aria-label={
                        pageShown
                          ? `Hide the ${VIEW_LABEL[view]} page from visitors`
                          : `Show the ${VIEW_LABEL[view]} page to visitors`
                      }
                      title={
                        pageShown
                          ? "Visible on the site — click to hide"
                          : "Hidden from visitors — click to show"
                      }
                      onClick={() => togglePart(quickPart)}
                      className={`absolute top-1/2 right-[5px] flex h-[26px] w-[26px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-[6px] transition-colors hover:bg-paper ${
                        pageShown ? "text-graphite hover:text-ink" : "text-draft"
                      }`}
                    >
                      {pageShown ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="hidden items-center gap-[10px] border-t border-line px-[20px] py-[16px] lg:flex">
        <span
          aria-hidden="true"
          className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-ink font-serif text-[14px] text-paper"
        >
          DN
        </span>
        <div className="min-w-0">
          <p className="font-sans text-[13px] leading-none font-bold">Diego Nguyen</p>
          <p className="mt-[5px] truncate font-sans text-[12px] leading-none text-graphite">
            Editor, Ho Chi Minh City
          </p>
        </div>
      </div>
    </aside>
  );
}

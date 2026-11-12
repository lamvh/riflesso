"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { CHANGE_AREAS, type ChangeArea } from "@/lib/dashboard/admin-changes";
import { VIEW_HREF, VIEW_LABEL, viewFromPath, type View } from "@/lib/dashboard/admin-views";

import { useAdmin } from "./admin-store";
import { openCommandPalette } from "./command-palette-events";
import { GROUPS, HEALTH_DOT, VIEW_ICON } from "./dashboard-nav-config";
import { ExternalIcon, MenuIcon, SearchMarkIcon } from "./ui/icons";
import { ThemeToggle } from "./ui/theme-toggle";
import { useConnectionHealth } from "./use-connection-health";
import { useContentPreview } from "./use-content-preview";

/** The screens worth one thumb-tap; everything else is under More. */
const TABS: View[] = ["overview", "artists", "albums", "home"];

/**
 * Below the desktop breakpoint the sidebar gives way to a bottom tab bar —
 * where a thumb already is — and a More sheet with every other screen and the
 * header's secondary actions.
 */
export function DashboardMobileNav() {
  const { changes } = useAdmin();
  const pathname = usePathname();
  const current = viewFromPath(pathname);
  const [sheet, setSheet] = useState(false);
  const closeSheet = useCallback(() => setSheet(false), [setSheet]);
  const { overall } = useConnectionHealth();
  const moreActive = !TABS.includes(current);

  const pendingIn = (view: View) =>
    CHANGE_AREAS.includes(view as ChangeArea) ? changes[view as ChangeArea] : 0;

  return (
    <>
      <nav
        aria-label="Dashboard"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {TABS.map((view) => (
            <li key={view}>
              <TabLink
                href={VIEW_HREF[view]}
                label={view === "home" ? "Homepage" : VIEW_LABEL[view]}
                view={view}
                active={view === current}
                pending={pendingIn(view) > 0}
              />
            </li>
          ))}
          <li>
            <button
              type="button"
              aria-expanded={sheet}
              onClick={() => setSheet(true)}
              className={`flex h-[58px] w-full cursor-pointer flex-col items-center justify-center gap-[4px] font-sans text-[11px] font-medium ${
                moreActive ? "text-ink" : "text-graphite"
              }`}
            >
              <span className="relative">
                <MenuIcon size={19} />
                {overall && overall !== "ok" && (
                  <span
                    className={`absolute -top-[2px] -right-[4px] h-[7px] w-[7px] rounded-full ${HEALTH_DOT[overall][0]}`}
                  />
                )}
              </span>
              More
            </button>
          </li>
        </ul>
      </nav>

      {sheet && <MoreSheet current={current} onClose={closeSheet} pendingIn={pendingIn} />}
    </>
  );
}

function TabLink({
  href,
  label,
  view,
  active,
  pending,
}: {
  href: string;
  label: string;
  view: View;
  active: boolean;
  pending: boolean;
}) {
  const Icon = VIEW_ICON[view];
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative flex h-[58px] flex-col items-center justify-center gap-[4px] font-sans text-[11px] font-medium ${
        active ? "text-ink" : "text-graphite"
      }`}
    >
      {active && <span aria-hidden="true" className="absolute top-0 h-[2px] w-[28px] rounded-b-full bg-ink" />}
      <span className="relative">
        <Icon size={19} />
        {pending && <span className="absolute -top-[2px] -right-[4px] h-[7px] w-[7px] rounded-full bg-draft" />}
      </span>
      {label}
    </Link>
  );
}

function MoreSheet({
  current,
  onClose,
  pendingIn,
}: {
  current: View;
  onClose: () => void;
  pendingIn: (view: View) => number;
}) {
  const pathname = usePathname();
  const { openPreview } = useContentPreview();
  const { overall } = useConnectionHealth();
  const [openedAt] = useState(pathname);

  /* Picking a screen navigates; the sheet closes once the route changes. */
  useEffect(() => {
    if (pathname !== openedAt) onClose();
  }, [pathname, openedAt, onClose]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const run = (action: () => void) => () => {
    onClose();
    action();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end lg:hidden">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#1c1810]/35 backdrop-blur-[2px] motion-safe:animate-scrim-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="All screens"
        className="relative max-h-[85svh] w-full overflow-y-auto rounded-t-[18px] bg-paper px-[16px] pt-[10px] pb-[calc(20px+env(safe-area-inset-bottom))] font-sans shadow-[0_-16px_48px_rgba(28,24,16,0.25)] motion-safe:animate-scrim-in"
      >
        <span aria-hidden="true" className="mx-auto mb-[12px] block h-[4px] w-[40px] rounded-full bg-line-strong" />

        <div className="mb-[14px] grid grid-cols-3 gap-[8px]">
          <SheetAction label="Search" onClick={run(openCommandPalette)} icon={<SearchMarkIcon size={16} />} />
          <SheetAction label="Preview" onClick={run(() => openPreview("/"))} />
          <SheetAction
            label="View site"
            icon={<ExternalIcon size={14} />}
            onClick={run(() => window.open("/", "_blank", "noopener"))}
          />
        </div>

        {GROUPS.map((group) => (
          <div key={group.label ?? "top"} className="mb-[10px]">
            {group.label && (
              <p className="px-[8px] pt-[6px] pb-[6px] text-[11px] leading-none font-bold tracking-[0.12em] text-graphite uppercase">
                {group.label}
              </p>
            )}
            {group.views.map((view) => {
              const Icon = VIEW_ICON[view];
              const active = view === current;
              return (
                <Link
                  key={view}
                  href={VIEW_HREF[view]}
                  onClick={() => view === current && onClose()}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-[46px] items-center gap-[12px] rounded-[10px] px-[10px] text-[15px] ${
                    active ? "bg-seamless font-bold text-ink" : "font-medium text-body"
                  }`}
                >
                  <span className="text-graphite">
                    <Icon size={17} />
                  </span>
                  <span className="flex-1">{VIEW_LABEL[view]}</span>
                  {pendingIn(view) > 0 && <span className="h-[7px] w-[7px] rounded-full bg-draft" />}
                  {view === "status" && overall && (
                    <span className={`h-[8px] w-[8px] rounded-full ${HEALTH_DOT[overall][0]}`} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="mt-[6px] flex items-center justify-between border-t border-line px-[8px] pt-[14px]">
          <span className="text-[13px] font-medium text-graphite">Theme</span>
          <ThemeToggle withLabels />
        </div>
      </div>
    </div>
  );
}

function SheetAction({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[44px] cursor-pointer items-center justify-center gap-[6px] rounded-[10px] bg-seamless text-[14px] font-medium text-ink"
    >
      {icon}
      {label}
    </button>
  );
}

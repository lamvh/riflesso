"use client";

import Link from "next/link";

import {
  CHANGE_AREA_LABEL,
  changedAreas,
  plural,
} from "@/lib/dashboard/admin-changes";
import { VIEW_HREF, adminTotals } from "@/lib/dashboard/admin-views";
import { formatRelativeTime } from "@/lib/dashboard/format-relative-time";

import { useAdmin } from "../admin-store";
import { StatusPill } from "../ui/controls";
import { Panel } from "../ui/panel";
import { useConnectionHealth } from "../use-connection-health";
import { useRevisionHistory } from "../use-revision-history";

type AttentionItem = {
  key: string;
  count: number;
  /** Edits still saving are amber; gaps in the content are grey. */
  pending: boolean;
  text: string;
  href: string;
};

export function OverviewScreen() {
  const { state, changes } = useAdmin();
  const totals = adminTotals(state);

  const draftArtists = totals.artists - totals.liveArtists;
  const draftAlbums = totals.albums - totals.liveAlbums;
  const noPortrait = state.artists.filter((artist) => !artist.image).length;
  const noImages = state.albums.filter((album) => album.frames.length === 0).length;
  const noCredits = state.albums.filter((album) => album.credits.length === 0).length;
  const sectionsOff = totals.blocks - totals.liveBlocks;

  const stats = [
    { label: "Artists", value: totals.artists, note: `${totals.liveArtists} in the directory`, href: VIEW_HREF.artists },
    { label: "Albums", value: totals.albums, note: `${totals.homeAlbums} on the homepage`, href: VIEW_HREF.albums },
    { label: "Images", value: totals.images, note: "Across all albums", href: VIEW_HREF.albums },
    {
      label: "Drafts",
      value: totals.drafts,
      note: totals.drafts ? "Hidden from visitors" : "Nothing hidden",
      href: VIEW_HREF.artists,
    },
  ];

  /* Only what needs doing. A row that would read "0 …" is not a task. */
  const attention: AttentionItem[] = [
    ...changedAreas(changes).map((area) => ({
      key: `changes-${area}`,
      count: changes[area],
      pending: true,
      text: `${plural(changes[area], "unsaved change")} in ${CHANGE_AREA_LABEL[area]}`,
      href: VIEW_HREF[area],
    })),
    { key: "draft-artists", count: draftArtists, pending: false, text: `${plural(draftArtists, "artist")} in draft`, href: VIEW_HREF.artists },
    { key: "draft-albums", count: draftAlbums, pending: false, text: `${plural(draftAlbums, "album")} in draft`, href: VIEW_HREF.albums },
    { key: "no-portrait", count: noPortrait, pending: false, text: `${plural(noPortrait, "artist")} without a portrait`, href: VIEW_HREF.artists },
    { key: "no-images", count: noImages, pending: false, text: `${plural(noImages, "album")} without images`, href: VIEW_HREF.albums },
    { key: "no-credits", count: noCredits, pending: false, text: `${plural(noCredits, "album")} without credits`, href: VIEW_HREF.albums },
    { key: "sections-off", count: sectionsOff, pending: false, text: `${plural(sectionsOff, "homepage section")} switched off`, href: VIEW_HREF.home },
  ].filter((item) => item.count > 0);

  return (
    <div className="flex flex-col gap-[16px]">
      <Panel bodyClassName="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group flex flex-col gap-[12px] bg-paper px-[22px] pt-[20px] pb-[18px] transition-colors hover:bg-hover"
          >
            <span className="flex items-center justify-between font-sans text-[11px] leading-none font-bold tracking-[0.12em] text-graphite uppercase">
              {stat.label}
              <span
                aria-hidden="true"
                className="text-[14px] tracking-normal opacity-0 transition-opacity group-hover:opacity-100"
              >
                →
              </span>
            </span>
            <span className="font-serif text-[46px] leading-[0.9] tracking-[-1px] tabular-nums">
              {stat.value}
            </span>
            <span className="font-sans text-[13px] leading-none text-graphite">{stat.note}</span>
          </Link>
        ))}
      </Panel>

      <div className="grid items-start gap-[16px] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Panel
          title="Needs attention"
          description={attention.length ? "Open an item to deal with it" : undefined}
          bodyClassName=""
        >
          {attention.length > 0 ? (
            <ul>
              {attention.map((item) => (
                <li key={item.key} className="border-b border-line last:border-b-0">
                  <Link
                    href={item.href}
                    className="flex items-center gap-[12px] px-[20px] py-[13px] transition-colors hover:bg-hover"
                  >
                    <span
                      aria-hidden="true"
                      className={`h-[8px] w-[8px] shrink-0 rounded-full ${item.pending ? "bg-draft shadow-[0_0_0_3px_var(--color-draft-soft)]" : "bg-line-strong"}`}
                    />
                    <span className="flex-1 font-sans text-[14px] leading-[140%]">{item.text}</span>
                    <span className="font-sans text-[13px] font-medium text-graphite">Review →</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-[20px] py-[18px] font-sans text-[14px] leading-[150%] text-graphite">
              Nothing needs attention. Every artist and album is published, pictured and
              credited, and all changes are live.
            </p>
          )}
        </Panel>

        <div className="flex flex-col gap-[16px]">
          <ServicesStrip />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}

const HEALTH_LINE = {
  ok: ["live", "All connected", "Database, storage and media delivery are answering"],
  unconfigured: ["neutral", "Not configured", "Some services have no keys yet"],
  warning: ["draft", "Needs attention", "A service answered with a problem"],
  error: ["danger", "Service down", "A service is not answering — saving or images may fail"],
} as const;

/** One line on whether the services behind the site are up, linking to Status. */
function ServicesStrip() {
  const { overall, checking } = useConnectionHealth();
  const [tone, label, note] = overall
    ? HEALTH_LINE[overall]
    : (["neutral", checking ? "Checking…" : "Not checked", "Database, storage and media delivery"] as const);

  return (
    <Link
      href={VIEW_HREF.status}
      className="flex items-center justify-between gap-[12px] rounded-[10px] border border-line bg-paper px-[20px] py-[14px] shadow-sheet transition-colors hover:bg-hover"
    >
      <div className="min-w-0">
        <p className="font-sans text-[16px] leading-[120%] font-bold tracking-[-0.3px]">Services</p>
        <p className="mt-[3px] truncate font-sans text-[13px] leading-[140%] text-graphite">{note}</p>
      </div>
      <StatusPill tone={tone}>{label}</StatusPill>
    </Link>
  );
}

const FEED_LIMIT = 8;

/**
 * What happened lately: edits not saved yet, then saves from the edit history
 * — from every session, not just this one, with when they happened.
 */
function RecentActivity() {
  const { state } = useAdmin();
  const { list } = useRevisionHistory();

  const pending = state.unsavedActivity.map((text) => ({ text, when: "Not saved yet" }));
  const saved =
    list?.state === "ok"
      ? list.entries.flatMap((entry) =>
          entry.summary.map((text) => ({ text, when: formatRelativeTime(entry.updatedAt) })),
        )
      : state.activity.map((text) => ({ text, when: "This session" }));
  const feed = [...pending, ...saved].slice(0, FEED_LIMIT);

  return (
    <Panel
      title="Recent activity"
      description={list?.state === "ok" ? "Across every session" : "Edits made in this session"}
      action={
        <Link href={VIEW_HREF.history} className="font-sans text-[13px] font-medium text-graphite hover:text-ink">
          History →
        </Link>
      }
      bodyClassName=""
    >
      {feed.length > 0 ? (
        <ol>
          {feed.map((entry, index) => (
            <li
              key={`${entry.text}-${index}`}
              className="flex gap-[14px] border-b border-line px-[20px] py-[12px] last:border-b-0"
            >
              <span
                className={`w-[84px] shrink-0 font-sans text-[12px] leading-[150%] font-medium ${
                  entry.when === "Not saved yet" ? "text-draft" : "text-graphite"
                }`}
              >
                {entry.when}
              </span>
              <span className="min-w-0 font-sans text-[14px] leading-[140%]">{entry.text}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-[20px] py-[18px] font-sans text-[14px] leading-[150%] text-graphite">
          Nothing edited yet. Saves are listed here as they happen.
        </p>
      )}
    </Panel>
  );
}

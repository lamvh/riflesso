"use client";

import Link from "next/link";

import {
  CHANGE_AREA_LABEL,
  changedAreas,
  plural,
} from "@/lib/dashboard/admin-changes";
import { VIEW_HREF, adminTotals } from "@/lib/dashboard/admin-views";

import { useAdmin } from "../admin-store";
import { Panel } from "../ui/panel";

type AttentionItem = {
  key: string;
  count: number;
  /** Unpublished work is amber; gaps in the content are grey. */
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
      text: `${plural(changes[area], "unpublished change")} in ${CHANGE_AREA_LABEL[area]}`,
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
            className="flex flex-col gap-[10px] bg-paper px-[20px] py-[18px] transition-colors hover:bg-hover"
          >
            <span className="font-sans text-[13px] leading-none font-medium text-graphite">
              {stat.label}
            </span>
            <span className="font-sans text-[36px] leading-none font-bold tracking-[-1.5px] tabular-nums">
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
                      className={`h-[7px] w-[7px] shrink-0 rounded-full ${item.pending ? "bg-draft" : "bg-graphite"}`}
                    />
                    <span className="flex-1 font-sans text-[14px] leading-[140%]">{item.text}</span>
                    <span className="font-sans text-[13px] font-medium text-graphite">Review</span>
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

        <Panel title="Recent activity" description="Edits made in this session" bodyClassName="">
          {state.activity.length > 0 ? (
            <ol>
              {state.activity.map((entry, index) => (
                <li
                  key={`${entry}-${index}`}
                  className="flex gap-[14px] border-b border-line px-[20px] py-[12px] last:border-b-0"
                >
                  <span className="w-[64px] shrink-0 font-sans text-[12px] leading-[150%] font-medium text-graphite">
                    {index === 0 ? "Just now" : "Earlier"}
                  </span>
                  <span className="font-sans text-[14px] leading-[140%]">{entry}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="px-[20px] py-[18px] font-sans text-[14px] leading-[150%] text-graphite">
              Nothing edited yet. Edits you make in this session are listed here.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

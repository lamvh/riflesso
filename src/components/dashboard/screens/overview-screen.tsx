"use client";

import Link from "next/link";

import { adminTotals } from "@/lib/dashboard/admin-views";

import { useAdmin } from "../admin-store";

function Stat({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="border-r border-rule px-[20px] py-[22px]">
      <p className="font-sans text-[11px] leading-none font-bold tracking-[0.08em] text-dim uppercase">
        {label}
      </p>
      <p className="mt-[14px] font-sans text-[44px] leading-[90%] font-bold tracking-[-2.5px] tabular-nums">
        {value}
      </p>
      <p className="mt-[10px] font-serif text-[14px] leading-[110%] text-dim">{note}</p>
    </div>
  );
}

function PanelHeading({ children }: { children: string }) {
  return (
    <h2 className="font-sans text-[22px] leading-[95%] font-bold tracking-[-1.1px]">
      {children}
    </h2>
  );
}

export function OverviewScreen() {
  const { state } = useAdmin();
  const totals = adminTotals(state);

  const draftArtists = totals.artists - totals.liveArtists;
  const draftAlbums = totals.albums - totals.liveAlbums;
  const noPortrait = state.artists.filter((artist) => !artist.image).length;
  const noCredits = state.albums.filter((album) => album.credits.length === 0).length;
  const blocksOff = totals.blocks - totals.liveBlocks;

  const gaps = [
    {
      text: `${draftArtists} artists still in draft`,
      action: "Open list",
      href: "/dashboard/artists",
    },
    {
      text: `${draftAlbums} albums not published`,
      action: "Open albums",
      href: "/dashboard/albums",
    },
    {
      text: `${noPortrait || "No"} artists missing a portrait`,
      action: "Review",
      href: "/dashboard/artists",
    },
    {
      text: `${noCredits || "No"} albums missing artist credits`,
      action: "Review",
      href: "/dashboard/albums",
    },
    {
      text: `${blocksOff} homepage sections switched off`,
      action: "Open homepage",
      href: "/dashboard/homepage",
    },
  ];

  return (
    <section className="p-[28px]">
      <div className="grid grid-cols-4 border border-ink">
        <Stat label="Artists" value={totals.artists} note={`${totals.liveArtists} live`} />
        <Stat
          label="Albums"
          value={totals.albums}
          note={`${totals.homeAlbums} on the homepage`}
        />
        <Stat label="Images" value={totals.images} note="Across every album" />
        <Stat label="Drafts" value={totals.drafts} note="Waiting to publish" />
      </div>

      <div className="mt-[34px] grid grid-cols-[1.15fr_1fr] items-start gap-[34px]">
        <div>
          <PanelHeading>Needs attention</PanelHeading>
          <div className="mt-[14px] border-t border-ink">
            {gaps.map((gap) => (
              <Link
                key={gap.text}
                href={gap.href}
                className="flex items-center justify-between gap-4 border-b border-rule px-[2px] py-[14px]"
              >
                <span className="font-serif text-[16px] leading-[110%]">{gap.text}</span>
                <span className="shrink-0 border border-ink px-[8px] py-[4px] font-sans text-[11px] leading-none font-bold">
                  {gap.action}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <PanelHeading>Recent activity</PanelHeading>
          <div className="mt-[14px] border-t border-ink">
            {state.activity.map((entry, index) => (
              <div
                key={`${entry}-${index}`}
                className="flex gap-[14px] border-b border-rule px-[2px] py-[13px]"
              >
                <span className="shrink-0 basis-[68px] font-sans text-[11px] leading-[130%] font-bold text-dim">
                  {index === 0 ? "Just now" : "Earlier"}
                </span>
                <span className="font-serif text-[15px] leading-[120%]">{entry}</span>
              </div>
            ))}

            {state.activity.length === 0 && (
              <p className="px-[2px] py-[16px] font-serif text-[15px] leading-[120%] text-dim">
                Nothing edited yet this session. There is no history behind the
                dashboard to read, so this feed starts with your first change.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

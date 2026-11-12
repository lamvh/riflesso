"use client";

import { useState, useTransition, type ReactNode } from "react";

import { plural } from "@/lib/dashboard/admin-changes";
import { loadContentRevision } from "@/lib/dashboard/content-history-actions";
import type { RevisionEntry, RevisionKind } from "@/lib/dashboard/content-history-types";
import { formatDateTime, formatRelativeTime } from "@/lib/dashboard/format-relative-time";

import { useAdmin } from "../admin-store";
import { Button, StatusPill, type Tone } from "../ui/controls";
import { Panel } from "../ui/panel";
import { useContentPreview } from "../use-content-preview";
import { useRevisionHistory } from "../use-revision-history";

const KIND: Record<RevisionKind, [Tone, string]> = {
  edit: ["live", "Saved"],
  snapshot: ["neutral", "Before edits"],
  restore: ["draft", "Restored"],
};

/** Lines shown before an entry folds the rest away. */
const FOLD = 4;

const dayOf = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

export function HistoryScreen() {
  const { state, dispatch } = useAdmin();
  const { list } = useRevisionHistory();
  const { openPreview, opening } = useContentPreview();
  const [restoring, startRestoring] = useTransition();
  const [open, setOpen] = useState<Set<number>>(new Set());

  if (!list) {
    return <Notice>Reading the history…</Notice>;
  }
  if (list.state === "unconfigured") {
    return <Notice>History needs Supabase. Add the keys, then every save is kept here.</Notice>;
  }
  if (list.state === "missing") {
    return (
      <Notice>
        History needs the database migration{" "}
        <code className="rounded-[4px] bg-hover px-[4px] font-mono text-[12px]">
          20261113013000_add_revisions_and_previews.sql
        </code>
        . Back up the database, run it, and every save from then on is kept here.
      </Notice>
    );
  }
  if (list.state === "error") {
    return <Notice tone="danger">History could not be read: {list.message}</Notice>;
  }
  if (list.entries.length === 0) {
    return <Notice>No saves yet. The next edit you make is filed here, with a way back.</Notice>;
  }

  const load = async (entry: RevisionEntry) => {
    const result = await loadContentRevision(entry.id);
    if (!result.ok) throw new Error(result.error);
    return result.content;
  };

  const restore = (entry: RevisionEntry) => {
    const label = formatDateTime(entry.updatedAt);
    const message = state.autosavePaused
      ? `Load the site as of ${label}? It stays here until you save.`
      : `Restore the site as of ${label}? It goes live right away, as a new save — nothing in the history is lost.`;
    if (!window.confirm(message)) return;
    startRestoring(async () => {
      try {
        dispatch({ type: "history/restore", content: await load(entry), label });
      } catch (error) {
        dispatch({
          type: "toast",
          message: error instanceof Error ? error.message : "Restore failed",
          tone: "error",
        });
      }
    });
  };

  /* Group by calendar day, newest first. */
  const days: [string, RevisionEntry[]][] = [];
  for (const entry of list.entries) {
    const day = dayOf(entry.updatedAt);
    const last = days.at(-1);
    if (last && last[0] === day) last[1].push(entry);
    else days.push([day, [entry]]);
  }

  return (
    <div className="flex flex-col gap-[20px]">
      {days.map(([day, entries]) => (
        <section key={day} className="flex flex-col gap-[8px]">
          <h2 className="px-[2px] font-sans text-[11px] leading-none font-bold tracking-[0.12em] text-graphite uppercase">
            {day}
          </h2>
          <Panel bodyClassName="">
            <ol>
              {entries.map((entry) => {
                const current = entry.revision === state.revision && entry === list.entries[0];
                const [tone, kind] = KIND[entry.kind];
                const expanded = open.has(entry.id);
                const lines = expanded ? entry.summary : entry.summary.slice(0, FOLD);
                const hidden = entry.summary.length - lines.length;
                return (
                  <li
                    key={entry.id}
                    className="grid gap-x-[16px] gap-y-[10px] border-b border-line px-[20px] py-[14px] last:border-b-0 md:grid-cols-[120px_minmax(0,1fr)_auto]"
                  >
                    <div className="flex flex-row items-baseline gap-[8px] md:flex-col md:gap-[5px]">
                      <span className="font-serif text-[20px] leading-none tabular-nums">
                        {new Date(entry.updatedAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="font-sans text-[12px] leading-none text-graphite">
                        {formatRelativeTime(entry.updatedAt)}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-[8px]">
                        <StatusPill tone={tone}>{kind}</StatusPill>
                        <span className="font-sans text-[12px] text-graphite tabular-nums">
                          Revision {entry.revision}
                        </span>
                        {current && (
                          <span className="font-sans text-[12px] font-bold text-live">On the site now</span>
                        )}
                      </div>
                      <ul className="mt-[8px] flex flex-col gap-[4px]">
                        {lines.map((line, index) => (
                          <li key={index} className="font-sans text-[14px] leading-[140%]">
                            {line}
                          </li>
                        ))}
                        {entry.summary.length === 0 && (
                          <li className="font-sans text-[14px] text-graphite">Content saved</li>
                        )}
                      </ul>
                      {(hidden > 0 || expanded) && entry.summary.length > FOLD && (
                        <button
                          type="button"
                          onClick={() =>
                            setOpen((previous) => {
                              const next = new Set(previous);
                              if (next.has(entry.id)) next.delete(entry.id);
                              else next.add(entry.id);
                              return next;
                            })
                          }
                          className="mt-[6px] cursor-pointer font-sans text-[13px] font-medium text-graphite underline-offset-2 hover:text-ink hover:underline"
                        >
                          {expanded ? "Show less" : `${plural(hidden, "more change")}`}
                        </button>
                      )}
                    </div>

                    <div className="flex items-start gap-[6px]">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={opening}
                        onClick={() => openPreview("/", () => load(entry))}
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        disabled={current || restoring || state.source !== "database"}
                        title={current ? "This is what the site shows now" : undefined}
                        onClick={() => restore(entry)}
                      >
                        Restore
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>
        </section>
      ))}
      <p className="px-[2px] font-sans text-[13px] leading-[150%] text-graphite">
        The latest {plural(list.entries.length, "entry", "entries")} are shown. Saves a couple of
        minutes apart share one entry. Restoring brings back records and settings — files deleted
        from Media stay deleted.
      </p>
    </div>
  );
}

function Notice({ children, tone }: { children: ReactNode; tone?: "danger" }) {
  return (
    <div
      className={`rounded-[10px] border border-line bg-paper px-[20px] py-[18px] font-sans text-[14px] leading-[150%] shadow-sheet ${
        tone === "danger" ? "text-danger" : "text-body"
      }`}
    >
      {children}
    </div>
  );
}

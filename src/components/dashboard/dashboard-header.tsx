"use client";

import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { pickSiteContent } from "@/lib/content/site-content-types";
import type { AdminAction } from "@/lib/dashboard/admin-actions";
import { serializeContent, type AdminState } from "@/lib/dashboard/admin-state";
import {
  adminTotals,
  pageTitle,
  viewFromPath,
  type View,
} from "@/lib/dashboard/admin-views";
import { publishSiteContent } from "@/lib/dashboard/publish-site-content";

import { useAdmin } from "./admin-store";
import { OutlineButton, SolidButton, UnderlineButton } from "./ui/controls";

/** Label and action of the header's add button, per screen. */
function primaryFor(view: View): [string, AdminAction] {
  switch (view) {
    case "artists":
      return ["+ New artist", { type: "artist/open", index: -1 }];
    case "cats":
      return ["+ Category", { type: "cat/add" }];
    case "home":
      return ["+ Hero slide", { type: "slide/add" }];
    case "albums":
      return ["+ New album", { type: "album/open", index: -1 }];
    case "settings":
      return ["+ Contact card", { type: "contact/add" }];
    case "overview":
      return ["+ New content", { type: "album/open", index: -1 }];
  }
}

function publishStatus(state: AdminState, dirty: boolean, publishing: boolean) {
  if (state.source === "unconfigured") return "Supabase not configured";
  if (publishing) return "Publishing…";
  if (dirty) return "Unpublished changes";
  if (state.source === "seed") return "Built-in content · not in the database yet";
  return "Everything is live";
}

export function DashboardHeader() {
  const { state, dispatch, dirty } = useAdmin();
  const view = viewFromPath(usePathname());
  const [title, note] = pageTitle(view, adminTotals(state));
  const [label, action] = primaryFor(view);
  const [publishing, startPublishing] = useTransition();

  /* The first publish is allowed with no edits: it seeds the database. */
  const canPublish =
    state.source !== "unconfigured" && !publishing && (dirty || state.source === "seed");

  const publish = () =>
    startPublishing(async () => {
      const content = pickSiteContent(state);
      try {
        const result = await publishSiteContent(content, state.revision);
        dispatch(
          result.ok
            ? { type: "published", revision: result.revision, baseline: serializeContent(content) }
            : { type: "toast", message: result.error },
        );
      } catch {
        dispatch({ type: "toast", message: "Publish failed — check the connection and try again" });
      }
    });

  return (
    <header className="sticky top-0 z-[4] flex items-end justify-between gap-6 border-b border-ink bg-paper px-[28px] py-[20px]">
      <div>
        <h1 className="font-sans text-[34px] leading-[95%] font-bold tracking-[-2px]">
          {title}
        </h1>
        <p className="mt-[8px] font-serif text-[15px] leading-none text-dim">{note}</p>
      </div>

      <div className="flex items-center gap-[10px]">
        <p role="status" className="font-serif text-[14px] leading-none text-dim">
          {publishStatus(state, dirty, publishing)}
        </p>
        {dirty && !publishing && (
          <UnderlineButton muted onClick={() => dispatch({ type: "discard" })}>
            Discard
          </UnderlineButton>
        )}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="border border-ink px-[15px] py-[10px] font-sans text-[13px] leading-none font-bold tracking-[-0.4px]"
        >
          View site
        </a>
        <OutlineButton onClick={() => dispatch(action)}>{label}</OutlineButton>
        <SolidButton onClick={publish} disabled={!canPublish}>
          Publish
        </SolidButton>
      </div>
    </header>
  );
}

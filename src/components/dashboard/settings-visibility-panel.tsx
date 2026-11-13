"use client";

import type { Dispatch } from "react";

import type { SiteSettings } from "@/lib/content/site-content-types";
import { HIDEABLE_PARTS, isPartShown, toggledParts } from "@/lib/content/site-visibility";
import { plural } from "@/lib/dashboard/admin-changes";
import type { AdminAction } from "@/lib/dashboard/admin-reducer";

import { Panel } from "./ui/panel";
import { SwitchRow } from "./ui/switch-row";

const GROUPS = [...new Set(HIDEABLE_PARTS.map((part) => part.group))];

/**
 * Pages and fixed page parts, switched off instead of deleted. Their content
 * stays in the dashboard and comes back with the switch. Rows inside a part —
 * slides, cards, links, sections — have their own switches where they are edited.
 */
export function SettingsVisibilityPanel({
  settings,
  dispatch,
}: {
  settings: SiteSettings;
  dispatch: Dispatch<AdminAction>;
}) {
  const hidden = HIDEABLE_PARTS.filter((part) => !isPartShown(settings, part.key)).length;

  return (
    <Panel
      title="Visibility"
      description={
        hidden
          ? `${plural(hidden, "part")} hidden from visitors — nothing is deleted`
          : "Switch a page or section off to hide it without deleting it"
      }
      bodyClassName="gap-[18px] p-[20px] md:columns-2"
    >
      {GROUPS.map((group) => (
        <div key={group} className="mb-[18px] flex break-inside-avoid flex-col gap-[8px] last:mb-0">
          <p className="font-sans text-[12px] leading-none font-medium text-graphite">{group}</p>
          {HIDEABLE_PARTS.filter((part) => part.group === group).map((part) => {
            const shown = isPartShown(settings, part.key);
            return (
              <SwitchRow
                key={part.key}
                title={part.label}
                note={shown ? part.note : `Hidden — ${part.note.charAt(0).toLowerCase()}${part.note.slice(1)}`}
                on={shown}
                onToggle={() =>
                  dispatch({
                    type: "settings/set",
                    patch: { hiddenParts: toggledParts(settings, part.key) },
                  })
                }
              />
            );
          })}
        </div>
      ))}
    </Panel>
  );
}

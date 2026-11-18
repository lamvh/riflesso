"use client";

import { useMemo } from "react";

import { PolicyMarkdown } from "@/components/policy-markdown";
import { parsePolicyMarkdown, policySections } from "@/lib/content/policy-markdown";
import { DEFAULT_POLICY, formatPolicyDate, withPolicyDefaults, type SitePolicy } from "@/lib/content/site-policy";
import { isPartShown, toggledParts } from "@/lib/content/site-visibility";
import { plural } from "@/lib/dashboard/admin-changes";

import { useAdmin } from "../admin-store";
import { Button, Switch, buttonClass } from "../ui/controls";
import { CodeTextarea, DateInput, LabelledField, NameInput } from "../ui/fields";
import { ExternalIcon } from "../ui/icons";
import { Panel } from "../ui/panel";

/** The markup the editor accepts, shown beside the text area. */
const CHEATSHEET: [string, string][] = [
  ["## Heading", "New section (listed beside the text, linkable as /policy#heading)"],
  ["### Smaller heading", "Sub-heading inside a section"],
  ["Blank line", "Starts a new paragraph"],
  ["- item", "Bulleted list (1. item for numbered)"],
  ["**bold**  *italic*", "Emphasis"],
  ["[label](https://…)", "Link — also /contact, mailto:, tel:"],
];

/** Today in the editor's own time zone, as YYYY-MM-DD. */
const today = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

/**
 * Site → Policy: the /policy page (privacy, cookies, terms) written in simple
 * markdown, with the page rendered live beside the text exactly as visitors
 * will read it. Saved with the rest of the content by autosave.
 */
export function PolicyScreen() {
  const { state, dispatch } = useAdmin();
  const policy = withPolicyDefaults(state.settings.policy);
  const shown = isPartShown(state.settings, "page:policy");
  const set = (patch: Partial<SitePolicy>) =>
    dispatch({ type: "settings/set", patch: { policy: { ...policy, ...patch } } });

  const blocks = useMemo(() => parsePolicyMarkdown(policy.body), [policy.body]);
  const sections = policySections(blocks);
  const date = formatPolicyDate(policy.updated);

  const restore = () => {
    if (window.confirm("Replace the policy text with the built-in version? Your current text will be lost (History can bring it back).")) {
      set({ title: DEFAULT_POLICY.title, body: DEFAULT_POLICY.body, updated: today() });
    }
  };

  return (
    <Panel
      title="Policy page"
      description={
        shown
          ? `${plural(sections.length, "section")} on /policy, linked from the footer`
          : "Hidden — /policy answers 404 and its footer links are gone"
      }
      action={
        <div className="flex items-center gap-[10px]">
          <span className="flex items-center gap-[8px] font-sans text-[13px] text-graphite">
            Show page
            <Switch
              on={shown}
              label="Show the policy page"
              onClick={() =>
                dispatch({ type: "settings/set", patch: { hiddenParts: toggledParts(state.settings, "page:policy") } })
              }
            />
          </span>
          <a href="/policy" target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "sm")}>
            View page
            <ExternalIcon />
          </a>
        </div>
      }
      bodyClassName="flex flex-col gap-[20px] p-[20px]"
    >
      <div className="grid items-end gap-[16px] md:grid-cols-[minmax(0,1fr)_auto]">
        <LabelledField label="Title" hint="The page heading and its browser tab label">
          <NameInput value={policy.title} placeholder="Policy" onChange={(title) => set({ title })} />
        </LabelledField>
        <LabelledField label="Last updated" hint="Shown under the title; clear it to hide the line">
          <div className="flex items-center gap-[6px]">
            <DateInput value={policy.updated} onChange={(updated) => set({ updated })} />
            <Button size="sm" variant="ghost" onClick={() => set({ updated: today() })}>
              Today
            </Button>
          </div>
        </LabelledField>
      </div>

      <div className="grid items-start gap-[20px] xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-[10px]">
          <div className="flex items-center justify-between gap-[10px]">
            <span className="font-sans text-[13px] font-medium text-body">Text</span>
            <Button size="sm" variant="ghost" onClick={restore}>
              Restore built-in text
            </Button>
          </div>
          <CodeTextarea label="Policy text (markdown)" rows={28} value={policy.body} onChange={(body) => set({ body })} />
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-[14px] gap-y-[6px] rounded-[8px] bg-sink px-[12px] py-[10px] font-sans text-[12px] leading-[140%]">
            {CHEATSHEET.map(([mark, meaning]) => (
              <div key={mark} className="contents">
                <dt className="font-mono whitespace-nowrap text-ink">{mark}</dt>
                <dd className="text-graphite">{meaning}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The page as visitors read it, scrolling on its own beside the text. */}
        <div className="flex min-w-0 flex-col gap-[10px] xl:sticky xl:top-[100px]">
          <span className="font-sans text-[13px] font-medium text-body">Preview</span>
          <div className="max-h-[720px] overflow-y-auto rounded-[8px] border border-line bg-white px-[28px] py-[30px] text-black">
            <h1 className="font-sans text-[40px] leading-[94%] font-bold tracking-[-0.05em]">
              {policy.title.trim() || "Policy"}
            </h1>
            {date && (
              <p className="mt-[12px] font-sans text-[13px] leading-[94%] font-bold tracking-[-0.5px] text-black/50">
                Last updated {date}
              </p>
            )}
            <div className="mt-[34px]">
              {blocks.length ? (
                <PolicyMarkdown blocks={blocks} />
              ) : (
                <p className="font-sans text-[13px] text-black/50">Nothing written yet — the page shows only its title.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

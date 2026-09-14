"use client";

/* eslint-disable @next/next/no-img-element */
/* The logo preview takes whatever address is typed, allow-listed host or not. */

import { DEFAULT_LOGO_URL, type SiteSettings } from "@/lib/content/site-content-types";
import { plural } from "@/lib/dashboard/admin-changes";
import type { AdminAction } from "@/lib/dashboard/admin-reducer";
import { isPublishableSrc } from "@/lib/media-src";

import { Button, IconButton } from "./ui/controls";
import { FieldLabel, LabelledField, NameInput, ProseInput, ProseTextarea } from "./ui/fields";
import { CrossIcon, PlusIcon } from "./ui/icons";
import { Panel } from "./ui/panel";

/** About copy is edited as one block of text; a blank line starts a paragraph. */
const PARAGRAPH_BREAK = /\n\s*\n/;

/** Search engines cut descriptions off at roughly this length. */
const DESCRIPTION_TARGET = 155;

export function SettingsBrandPanel({
  settings,
  dispatch,
}: {
  settings: SiteSettings;
  dispatch: (action: AdminAction) => void;
}) {
  const set = (patch: Partial<SiteSettings>) => dispatch({ type: "settings/set", patch });
  const typed = settings.logoUrl.trim();
  const logo = isPublishableSrc(typed) ? typed : DEFAULT_LOGO_URL;
  const paragraphs = settings.aboutParagraphs.filter((paragraph) => paragraph.trim()).length;
  const descriptionLength = settings.metaDescription.trim().length;

  return (
    <div className="flex min-w-0 flex-col gap-[16px]">
      <Panel title="Brand" description="The wordmark in the site masthead and this sidebar">
        <div className="flex flex-col gap-[16px]">
          <div className="flex h-[88px] items-center justify-center rounded-[2px] bg-hover px-[20px]">
            <img src={logo} alt={settings.logoAlt} className="block h-[24px] w-auto max-w-full" />
          </div>
          <LabelledField label="Logo address" hint="A file under /public, like /riflesso.png, or an https:// link">
            <ProseInput value={settings.logoUrl} onChange={(logoUrl) => set({ logoUrl })} />
          </LabelledField>
          <div className="grid gap-[16px] sm:grid-cols-2">
            <LabelledField label="Brand name">
              <NameInput
                value={settings.brandName}
                placeholder="Riflesso Studio"
                onChange={(brandName) => set({ brandName })}
              />
            </LabelledField>
            <LabelledField label="Logo alt text">
              <ProseInput
                value={settings.logoAlt}
                placeholder="Riflesso"
                onChange={(logoAlt) => set({ logoAlt })}
              />
            </LabelledField>
          </div>
        </div>
      </Panel>

      <Panel title="Search listing" description="The title and description search engines show">
        <div className="flex flex-col gap-[16px]">
          <LabelledField label="Site title">
            <NameInput
              value={settings.metaTitle}
              placeholder="Riflesso"
              onChange={(metaTitle) => set({ metaTitle })}
            />
          </LabelledField>
          <LabelledField
            label="Description"
            hint={`${descriptionLength} characters. About ${DESCRIPTION_TARGET} shows in full.`}
          >
            <ProseTextarea
              rows={3}
              value={settings.metaDescription}
              onChange={(metaDescription) => set({ metaDescription })}
            />
          </LabelledField>
        </div>
      </Panel>

      <Panel
        title="About page"
        description={`${plural(paragraphs, "paragraph")}. Leave a blank line to start a new one.`}
      >
        <div className="flex flex-col">
          <ProseTextarea
            rows={12}
            value={settings.aboutParagraphs.join("\n\n")}
            onChange={(text) => set({ aboutParagraphs: text.split(PARAGRAPH_BREAK) })}
          />
        </div>
      </Panel>

      <Panel
        title="Footer"
        description="Social links and the copyright line"
        action={
          <Button size="sm" onClick={() => dispatch({ type: "social/add" })}>
            <PlusIcon />
            Add link
          </Button>
        }
      >
        <div className="flex flex-col gap-[16px]">
          {settings.socialLinks.length > 0 && (
            <div className="flex flex-col gap-[8px]">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_28px] gap-[8px]">
                <FieldLabel>Label</FieldLabel>
                <FieldLabel>Link</FieldLabel>
              </div>
              {settings.socialLinks.map((link, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_28px] items-center gap-[8px]"
                >
                  <NameInput
                    size={15}
                    value={link.label}
                    placeholder="Instagram"
                    onChange={(label) => dispatch({ type: "social/set", index, patch: { label } })}
                  />
                  <ProseInput
                    value={link.href}
                    placeholder="https://…"
                    onChange={(href) => dispatch({ type: "social/set", index, patch: { href } })}
                  />
                  <IconButton
                    label={`Remove ${link.label || "this link"}`}
                    tone="danger"
                    onClick={() => dispatch({ type: "social/remove", index })}
                  >
                    <CrossIcon />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
          <LabelledField label="Copyright line">
            <ProseInput
              value={settings.copyright}
              placeholder="Riflesso Studio ©2026"
              onChange={(copyright) => set({ copyright })}
            />
          </LabelledField>
        </div>
      </Panel>
    </div>
  );
}

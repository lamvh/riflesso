"use client";

/* eslint-disable @next/next/no-img-element */
/* The logo preview takes whatever address is typed, allow-listed host or not. */

import { DEFAULT_LOGO_URL, type SiteSettings } from "@/lib/content/site-content-types";
import type { AdminAction } from "@/lib/dashboard/admin-reducer";
import { isPublishableSrc } from "@/lib/media-src";

import { OutlineButton } from "./ui/controls";
import { LabelledField, NameInput, ProseInput, ProseTextarea } from "./ui/fields";
import { PanelHeading } from "./ui/panel-heading";

/** About copy is edited as one block of text; a blank line starts a paragraph. */
const PARAGRAPH_BREAK = /\n\s*\n/;

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

  return (
    <div className="flex min-w-0 flex-col gap-[38px]">
      <div>
        <PanelHeading title="Brand" note="Wordmark in the masthead and this sidebar" />
        <div className="mt-[18px] flex flex-col gap-[16px]">
          <div className="flex h-[96px] items-center justify-center border border-rule bg-shell px-[20px]">
            <img src={logo} alt={settings.logoAlt} className="block h-[24px] w-auto max-w-full" />
          </div>
          <LabelledField label="Brand name">
            <NameInput
              value={settings.brandName}
              placeholder="Riflesso Studio"
              onChange={(brandName) => set({ brandName })}
            />
          </LabelledField>
          <LabelledField label="Logo address">
            <ProseInput
              value={settings.logoUrl}
              placeholder="/riflesso.png or https://…"
              onChange={(logoUrl) => set({ logoUrl })}
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

      <div>
        <PanelHeading title="Search listing" note="The title and description search engines show" />
        <div className="mt-[18px] flex flex-col gap-[16px]">
          <LabelledField label="Site title">
            <NameInput
              size={16}
              value={settings.metaTitle}
              placeholder="Riflesso"
              onChange={(metaTitle) => set({ metaTitle })}
            />
          </LabelledField>
          <LabelledField label="Description">
            <ProseTextarea
              rows={3}
              value={settings.metaDescription}
              onChange={(metaDescription) => set({ metaDescription })}
            />
          </LabelledField>
        </div>
      </div>

      <div>
        <PanelHeading title="About page" note="Leave a blank line between paragraphs" />
        <div className="mt-[18px] flex flex-col">
          <ProseTextarea
            rows={12}
            value={settings.aboutParagraphs.join("\n\n")}
            onChange={(text) => set({ aboutParagraphs: text.split(PARAGRAPH_BREAK) })}
          />
        </div>
      </div>

      <div>
        <PanelHeading
          title="Footer"
          note="Social links and the copyright line"
          action={
            <OutlineButton onClick={() => dispatch({ type: "social/add" })}>
              + Add link
            </OutlineButton>
          }
        />
        <div className="mt-[18px] flex flex-col gap-[10px]">
          {settings.socialLinks.map((link, index) => (
            <div key={index} className="grid grid-cols-[1fr_1.4fr_32px] items-center gap-[8px]">
              <NameInput
                size={14}
                value={link.label}
                placeholder="Instagram"
                onChange={(label) => dispatch({ type: "social/set", index, patch: { label } })}
              />
              <ProseInput
                value={link.href}
                placeholder="https://…"
                onChange={(href) => dispatch({ type: "social/set", index, patch: { href } })}
              />
              <button
                type="button"
                aria-label={`Remove ${link.label || "link"}`}
                onClick={() => dispatch({ type: "social/remove", index })}
                className="flex h-[34px] cursor-pointer items-center justify-center border border-ink font-sans text-[11px] leading-none font-bold"
              >
                ✕
              </button>
            </div>
          ))}
          <LabelledField label="Copyright line">
            <ProseInput
              value={settings.copyright}
              placeholder="Riflesso Studio ©2026"
              onChange={(copyright) => set({ copyright })}
            />
          </LabelledField>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

import {
  DEFAULT_LOGO_URL,
  type SiteSettings,
} from "@/lib/content/site-content-types";
import {
  DESCRIPTION_TARGET,
  SEO_LOCALES,
  SEO_PAGES,
  TITLE_TARGET,
  type PageSeo,
  type SeoPageKey,
  type SiteSeo,
} from "@/lib/content/site-seo";
import type { AdminAction } from "@/lib/dashboard/admin-reducer";
import { isPublishableSrc } from "@/lib/media-src";
import { siteUrl } from "@/lib/seo/site-url";

import { SeoPreviewCards } from "./seo-preview-cards";
import { Segmented, buttonClass } from "./ui/controls";
import {
  LabelledField,
  ProseInput,
  ProseTextarea,
  SelectField,
} from "./ui/fields";
import { MediaDropZone } from "./ui/media-drop-zone";
import { Panel } from "./ui/panel";
import { SwitchRow } from "./ui/switch-row";
import { UploadButton } from "./ui/upload-button";
import { MediaLibraryButton } from "./ui/media-library-picker";

/** The public origin, for the previews. Resolved like the metadata itself. */
const SITE_URL = siteUrl().origin;

const PAGE_OPTIONS = SEO_PAGES.map(({ key, label }) => ({ value: key, label }));

/** "42 / 60", amber once past the length search engines show. */
function Counter({ length, target }: { length: number; target: number }) {
  return (
    <span
      className={`font-sans text-[12px] tabular-nums ${length > target ? "text-draft" : "text-graphite"}`}
    >
      {length} / {target}
    </span>
  );
}

/**
 * Site settings → SEO. Everything is optional: an empty field shows, as its
 * placeholder, the value the site derives on its own, and the previews show
 * what will actually be published.
 */
export function SettingsSeoPanel({
  settings,
  dispatch,
}: {
  settings: SiteSettings;
  dispatch: (action: AdminAction) => void;
}) {
  const [pageKey, setPageKey] = useState<SeoPageKey>("home");
  const seo = settings.seo;
  const page = seo.pages[pageKey];
  const meta = SEO_PAGES.find((entry) => entry.key === pageKey)!;

  const setSeo = (patch: Partial<SiteSeo>) =>
    dispatch({ type: "settings/set", patch: { seo: { ...seo, ...patch } } });
  const setPage = (patch: Partial<PageSeo>) =>
    setSeo({ pages: { ...seo.pages, [pageKey]: { ...page, ...patch } } });

  /* What the site uses when a field is left empty (mirrors share-metadata.ts). */
  const autoTitle =
    pageKey === "home"
      ? settings.metaTitle
      : `${settings.metaTitle} — ${meta.label}`;
  const autoDescription =
    pageKey === "about"
      ? settings.aboutParagraphs[0] || settings.metaDescription
      : settings.metaDescription;
  const title = page.title.trim() || autoTitle;
  const description = page.description.trim() || autoDescription;

  const pageImage = isPublishableSrc(page.image.trim())
    ? page.image.trim()
    : "";
  const defaultImage = isPublishableSrc(seo.shareImage.trim())
    ? seo.shareImage.trim()
    : "";
  const hasOwnPhoto = pageKey === "home" || pageKey === "artists";
  /* Last resort mirrors logoCardUrl(): the stock card for the built-in logo, else the logo on white. */
  const logo = isPublishableSrc(settings.logoUrl.trim())
    ? settings.logoUrl.trim()
    : DEFAULT_LOGO_URL;
  const fallsToLogo =
    !pageImage && !hasOwnPhoto && !defaultImage && logo !== DEFAULT_LOGO_URL;
  const previewImage =
    pageImage ||
    (hasOwnPhoto
      ? null
      : defaultImage || (fallsToLogo ? logo : "/share-default.jpg"));

  return (
    <Panel
      title="SEO & sharing"
      description="Search listings and link previews on Facebook, Messenger, Zalo and X. Empty fields use the value shown in grey."
    >
      <div className="flex flex-col gap-[22px]">
        <div className="flex flex-col gap-[14px]">
          <Segmented
            label="Page"
            options={PAGE_OPTIONS}
            value={pageKey}
            onChange={setPageKey}
          />

          <div className="grid gap-[16px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col gap-[16px]">
              <LabelledField
                label="Title"
                hint={`Shown as the search result heading and the link preview title`}
              >
                <ProseInput
                  value={page.title}
                  placeholder={autoTitle}
                  onChange={(value) => setPage({ title: value })}
                />
                <Counter length={title.length} target={TITLE_TARGET} />
              </LabelledField>

              <LabelledField
                label="Description"
                hint="The line or two under the title"
              >
                <ProseTextarea
                  rows={3}
                  value={page.description}
                  placeholder={autoDescription}
                  onChange={(value) => setPage({ description: value })}
                />
                <Counter
                  length={description.length}
                  target={DESCRIPTION_TARGET}
                />
              </LabelledField>

              <LabelledField
                label="Share picture"
                hint={
                  hasOwnPhoto
                    ? "Empty: cut from the page's own photo. Cropped to 1200×630 when shared."
                    : "Empty: the default share picture below. Cropped to 1200×630 when shared."
                }
              >
                <MediaDropZone
                  onUploaded={([image]) => setPage({ image })}
                  label="Drop picture"
                  className="rounded-[6px]"
                >
                  <ProseInput
                    value={page.image}
                    placeholder="/assets/… or https://…"
                    onChange={(image) => setPage({ image })}
                  />
                </MediaDropZone>
                <div className="flex flex-wrap gap-[6px]">
                  <UploadButton
                    onUploaded={(image) => setPage({ image })}
                    className={buttonClass("secondary", "sm")}
                  >
                    Upload a file
                  </UploadButton>
                  <MediaLibraryButton
                    onPick={(image) => setPage({ image })}
                    className={buttonClass("ghost", "sm")}
                  />
                </div>
              </LabelledField>

              <SwitchRow
                title="Hide from search engines"
                note={
                  page.noindex
                    ? "noindex — still reachable by link, left out of results and the sitemap"
                    : "Listed in search results and the sitemap"
                }
                on={page.noindex}
                onToggle={() => setPage({ noindex: !page.noindex })}
              />
            </div>

            {/* Previews stay in view while the longer form beside them scrolls. */}
            <div className="min-w-0 lg:sticky lg:top-[16px] lg:self-start">
              <SeoPreviewCards
                title={title}
                description={description}
                url={`${SITE_URL}${meta.path}`}
                image={previewImage}
                imageNote="Cut from the page's own photo when the link is shared"
                siteName={settings.brandName}
                logoCard={fallsToLogo}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[16px] border-t border-line pt-[20px]">
          <p className="font-sans text-[14px] font-bold">Whole site</p>
          <div className="grid gap-[16px] sm:grid-cols-2">
            <LabelledField
              label="Default share picture"
              hint="For pages without a photo of their own. Empty: the site logo on white, which is also used whenever a picture cannot be loaded."
            >
              <MediaDropZone
                onUploaded={([shareImage]) => setSeo({ shareImage })}
                label="Drop picture"
                className="rounded-[6px]"
              >
                <ProseInput
                  value={seo.shareImage}
                  placeholder="/share-default.jpg"
                  onChange={(shareImage) => setSeo({ shareImage })}
                />
              </MediaDropZone>
              <div className="flex flex-wrap gap-[6px]">
                <UploadButton
                  onUploaded={(shareImage) => setSeo({ shareImage })}
                  className={buttonClass("secondary", "sm")}
                >
                  Upload a file
                </UploadButton>
                <MediaLibraryButton
                  onPick={(shareImage) => setSeo({ shareImage })}
                  className={buttonClass("ghost", "sm")}
                />
              </div>
            </LabelledField>

            <LabelledField
              label="Language"
              hint="og:locale — the language previews are labelled with"
            >
              <SelectField
                label="Language"
                value={seo.locale}
                onChange={(locale) => setSeo({ locale })}
                options={SEO_LOCALES.map((locale) => ({
                  value: locale.value,
                  label: locale.label,
                }))}
              />
            </LabelledField>

            <LabelledField
              label="Keywords"
              hint="Comma-separated. Google ignores them; Bing and others still read them."
            >
              <ProseInput
                value={seo.keywords}
                placeholder="hair, makeup, styling, artist agency"
                onChange={(keywords) => setSeo({ keywords })}
              />
            </LabelledField>

            <LabelledField
              label="X / Twitter account"
              hint="Credited on cards shared to X"
            >
              <ProseInput
                value={seo.twitterHandle}
                placeholder="@riflesso"
                onChange={(twitterHandle) => setSeo({ twitterHandle })}
              />
            </LabelledField>

            <LabelledField
              label="Facebook app ID"
              hint="Optional — enables Facebook's insights for shared links"
            >
              <ProseInput
                value={seo.facebookAppId}
                placeholder="1234567890"
                onChange={(facebookAppId) => setSeo({ facebookAppId })}
              />
            </LabelledField>

            <LabelledField
              label="Google Search Console"
              hint='Verification: paste only the content="…" value of the HTML tag'
            >
              <ProseInput
                value={seo.googleVerification}
                placeholder="abc123…"
                onChange={(googleVerification) =>
                  setSeo({ googleVerification })
                }
              />
            </LabelledField>

            <LabelledField
              label="Bing Webmaster Tools"
              hint="Verification: the content value of the msvalidate.01 tag"
            >
              <ProseInput
                value={seo.bingVerification}
                placeholder="ABC123…"
                onChange={(bingVerification) => setSeo({ bingVerification })}
              />
            </LabelledField>
          </div>

          <p className="font-sans text-[13px] leading-[150%] text-graphite">
            Also published automatically: canonical links,{" "}
            <code className="rounded-[4px] bg-hover px-[4px] font-mono text-[12px]">
              /sitemap.xml
            </code>
            ,{" "}
            <code className="rounded-[4px] bg-hover px-[4px] font-mono text-[12px]">
              /robots.txt
            </code>{" "}
            and the studio&apos;s structured data (name, logo, social profiles,
            contact emails). After changing a share picture, paste the link into
            Facebook&apos;s Sharing Debugger and press &ldquo;Scrape
            again&rdquo; to refresh its cache.
          </p>
        </div>
      </div>
    </Panel>
  );
}

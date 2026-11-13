"use client";

import { useAdmin } from "../admin-store";
import { SettingsAboutPanel, SettingsBrandPanel } from "../settings-brand-panel";
import { SettingsContactCards } from "../settings-contact-cards";
import { SettingsSeoPanel } from "../settings-seo-panel";
import { SettingsVisibilityPanel } from "../settings-visibility-panel";

/**
 * Site settings in three bands, so no half-width panel is left beside an
 * empty cell: Visibility across the top, then two independent columns that
 * stack on their own (identity and footer | page copy and contacts), then SEO
 * across the bottom, since its editor and previews need the full width.
 */
export function SettingsScreen() {
  const { state, dispatch } = useAdmin();

  return (
    <div className="flex flex-col gap-[16px]">
      <SettingsVisibilityPanel settings={state.settings} dispatch={dispatch} />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-[16px] xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-[16px]">
          <SettingsBrandPanel settings={state.settings} dispatch={dispatch} />
        </div>
        <div className="flex min-w-0 flex-col gap-[16px]">
          <SettingsAboutPanel settings={state.settings} dispatch={dispatch} />
          <SettingsContactCards contacts={state.contacts} dispatch={dispatch} />
        </div>
      </div>

      <SettingsSeoPanel settings={state.settings} dispatch={dispatch} />
    </div>
  );
}

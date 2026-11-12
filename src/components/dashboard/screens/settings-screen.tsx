"use client";

import { useAdmin } from "../admin-store";
import { SettingsBrandPanel } from "../settings-brand-panel";
import { SettingsContactCards } from "../settings-contact-cards";
import { SettingsVisibilityPanel } from "../settings-visibility-panel";

export function SettingsScreen() {
  const { state, dispatch } = useAdmin();

  return (
    <div className="grid items-start gap-[16px] xl:grid-cols-2">
      <SettingsVisibilityPanel settings={state.settings} dispatch={dispatch} />
      <SettingsBrandPanel settings={state.settings} dispatch={dispatch} />
      <SettingsContactCards contacts={state.contacts} dispatch={dispatch} />
    </div>
  );
}

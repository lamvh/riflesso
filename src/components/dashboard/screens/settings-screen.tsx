"use client";

import { useAdmin } from "../admin-store";
import { SettingsBrandPanel } from "../settings-brand-panel";
import { SettingsContactCards } from "../settings-contact-cards";

export function SettingsScreen() {
  const { state, dispatch } = useAdmin();

  return (
    <div className="grid items-start gap-[16px] xl:grid-cols-2">
      <SettingsBrandPanel settings={state.settings} dispatch={dispatch} />
      <SettingsContactCards contacts={state.contacts} dispatch={dispatch} />
    </div>
  );
}

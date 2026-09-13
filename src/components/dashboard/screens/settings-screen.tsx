"use client";

import { useAdmin } from "../admin-store";
import { SettingsBrandPanel } from "../settings-brand-panel";
import { SettingsContactCards } from "../settings-contact-cards";

export function SettingsScreen() {
  const { state, dispatch } = useAdmin();

  return (
    <section className="grid max-w-[1240px] grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] items-start gap-[40px] px-[28px] pt-[24px] pb-[60px]">
      <SettingsBrandPanel settings={state.settings} dispatch={dispatch} />
      <SettingsContactCards contacts={state.contacts} dispatch={dispatch} />
    </section>
  );
}

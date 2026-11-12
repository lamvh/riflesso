"use client";

import { useAdminTheme, type AdminThemeMode } from "../admin-theme";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";

const OPTIONS: { mode: AdminThemeMode; label: string; Icon: typeof SunIcon }[] = [
  { mode: "light", label: "Light", Icon: SunIcon },
  { mode: "dark", label: "Dark", Icon: MoonIcon },
  { mode: "system", label: "Match system", Icon: MonitorIcon },
];

/** Light / dark / follow the system, for the dashboard only. */
export function ThemeToggle({ withLabels = false }: { withLabels?: boolean }) {
  const { mode, setMode } = useAdminTheme();

  return (
    <div role="radiogroup" aria-label="Dashboard theme" className="inline-flex gap-[2px] rounded-[8px] bg-sink p-[3px]">
      {OPTIONS.map(({ mode: option, label, Icon }) => {
        const active = option === mode;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setMode(option)}
            className={`flex h-[26px] cursor-pointer items-center justify-center gap-[6px] rounded-[6px] px-[8px] font-sans text-[12px] font-medium transition-colors ${
              active ? "bg-paper text-ink shadow-[0_1px_2px_rgba(0,0,0,0.12)]" : "text-graphite hover:text-ink"
            }`}
          >
            <Icon size={13} />
            {withLabels && <span>{option === "system" ? "System" : label}</span>}
          </button>
        );
      })}
    </div>
  );
}

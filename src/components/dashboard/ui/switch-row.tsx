"use client";

import { Switch } from "./controls";

/** Label plus the switch that owns it, used twice at the foot of the drawer. */
export function SwitchRow({
  title,
  note,
  on,
  onToggle,
  bordered,
}: {
  title: string;
  note: string;
  on: boolean;
  onToggle: () => void;
  bordered: "top" | "bottom";
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        bordered === "top" ? "border-t border-rule pt-[14px]" : "border-b border-rule pb-[14px]"
      }`}
    >
      <div>
        <p className="font-sans text-[14px] leading-none font-bold tracking-[-0.5px]">
          {title}
        </p>
        <p className="mt-[5px] font-serif text-[14px] leading-none text-dim">{note}</p>
      </div>
      <Switch on={on} label={`Toggle ${title.toLowerCase()}`} onClick={onToggle} />
    </div>
  );
}

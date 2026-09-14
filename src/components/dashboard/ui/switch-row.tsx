"use client";

import { Switch } from "./controls";

/** A switch with the sentence that says what it controls and where things stand. */
export function SwitchRow({
  title,
  note,
  on,
  onToggle,
}: {
  title: string;
  note: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[2px] border border-line px-[14px] py-[12px]">
      <div className="min-w-0">
        <p className="font-sans text-[14px] leading-[120%] font-bold">{title}</p>
        <p className="mt-[3px] font-sans text-[13px] leading-[140%] text-graphite">{note}</p>
      </div>
      <Switch on={on} label={title} onClick={onToggle} />
    </div>
  );
}

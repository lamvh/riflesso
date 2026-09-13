"use client";

import type { ReactNode } from "react";

const BASE =
  "font-sans font-bold leading-none tracking-[-0.3px] border border-ink cursor-pointer";

/** Filter and multi-select chip: black when on, outlined when off. */
export function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`${BASE} px-[10px] py-[7px] text-[12px] ${
        active ? "bg-ink text-paper" : "bg-paper text-ink"
      }`}
    >
      {label}
    </button>
  );
}

/** The header's primary action. */
export function SolidButton({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${BASE} bg-ink px-[15px] py-[10px] text-[13px] tracking-[-0.4px] text-paper disabled:cursor-default disabled:opacity-35`}
    >
      {children}
    </button>
  );
}

export function OutlineButton({
  children,
  onClick,
  small = false,
}: {
  children: ReactNode;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${BASE} bg-paper text-ink ${
        small ? "px-[10px] py-[6px] text-[11px]" : "px-[14px] py-[9px] text-[12px]"
      }`}
    >
      {children}
    </button>
  );
}

/** Inline action set as underlined bold sans, the design's tertiary control. */
export function UnderlineButton({
  children,
  onClick,
  muted = false,
}: {
  children: ReactNode;
  onClick: () => void;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer border-b font-sans text-[12px] leading-none font-bold tracking-[-0.3px] ${
        muted ? "border-dim text-dim" : "border-ink text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/** A 38×20 track with a 14px knob — the only moving control in the design. */
export function Switch({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`flex h-[20px] w-[38px] shrink-0 cursor-pointer items-center border border-ink p-[2px] ${
        on ? "bg-ink" : "bg-paper"
      }`}
    >
      <span
        className={`h-[14px] w-[14px] transition-transform duration-[140ms] ease-out ${
          on ? "translate-x-[18px] bg-paper" : "translate-x-0 bg-ink"
        }`}
      />
    </button>
  );
}

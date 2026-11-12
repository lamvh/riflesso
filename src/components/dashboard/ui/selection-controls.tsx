"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { plural } from "@/lib/dashboard/admin-changes";

import { CrossIcon } from "./icons";

/** A row or card checkbox. `mixed` marks a select-all with some rows picked. */
export function SelectBox({
  checked,
  mixed = false,
  label,
  onChange,
  className = "",
}: {
  checked: boolean;
  mixed?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = mixed;
  }, [mixed]);

  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className={`relative z-[1] h-[16px] w-[16px] shrink-0 cursor-pointer accent-ink ${className}`}
    />
  );
}

/**
 * Stands in for the filter row while records are picked: how many, what can
 * be done to all of them at once, and a way out.
 */
export function BulkBar({
  count,
  noun,
  onClear,
  children,
}: {
  count: number;
  noun: string;
  onClear: () => void;
  children: ReactNode;
}) {
  /* Toasts step up above the bar while it is showing (see globals.css). */
  useEffect(() => {
    document.body.dataset.bulk = "";
    return () => {
      delete document.body.dataset.bulk;
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[20px] z-30 flex justify-center px-[16px] lg:pl-[248px]">
    <div
      role="toolbar"
      aria-label={`Actions for ${plural(count, noun)}`}
      className="pointer-events-auto flex max-w-full flex-wrap items-center gap-[6px] rounded-[12px] bg-ink py-[6px] pr-[6px] pl-[14px] font-sans text-paper shadow-[0_16px_40px_-8px_rgba(28,24,16,0.45)] motion-safe:animate-drawer-in"
    >
      <span className="mr-[6px] text-[13px] font-bold tabular-nums">{plural(count, noun)} selected</span>
      {children}
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear selection"
        title="Clear selection"
        className="ml-auto flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[6px] text-paper/70 transition-colors hover:bg-paper/10 hover:text-paper"
      >
        <CrossIcon size={14} />
      </button>
    </div>
    </div>
  );
}

/** A button styled for the dark bulk bar. */
export function BulkButton({
  children,
  onClick,
  danger = false,
}: {
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-[28px] cursor-pointer rounded-[6px] px-[10px] text-[13px] font-medium whitespace-nowrap transition-colors ${
        danger ? "text-[#ff9b8f] hover:bg-[#ff9b8f]/15" : "text-paper hover:bg-paper/12"
      }`}
    >
      {children}
    </button>
  );
}

/** A compact select on the dark bar; picking an option runs it and resets. */
export function BulkSelect({
  label,
  options,
  onPick,
}: {
  label: string;
  options: { value: string; label: string }[];
  onPick: (value: string) => void;
}) {
  return (
    <select
      aria-label={label}
      value=""
      onChange={(event) => event.target.value && onPick(event.target.value)}
      className="h-[28px] max-w-[180px] cursor-pointer rounded-[6px] border border-paper/20 bg-transparent px-[8px] text-[13px] font-medium text-paper hover:bg-paper/10 [&>option]:text-ink"
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** Selection state helpers over a set of ids. */
export function toggleId(set: Set<string>, id: string, on: boolean) {
  const next = new Set(set);
  if (on) next.add(id);
  else next.delete(id);
  return next;
}

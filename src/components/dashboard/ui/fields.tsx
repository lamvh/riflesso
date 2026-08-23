"use client";

import type { ReactNode } from "react";

/** Caps label sitting above every input in the design. */
export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-sans text-[11px] leading-none font-bold tracking-[0.08em] text-dim uppercase">
      {children}
    </span>
  );
}

const BOX = "border border-ink bg-paper p-[11px] rounded-none";

/** Bold sans input, used wherever the value is a name or a title. */
export function NameInput({
  value,
  onChange,
  placeholder,
  size = 17,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: number;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      style={{ fontSize: `${size}px` }}
      className={`${BOX} font-sans leading-none font-bold tracking-[-0.7px]`}
    />
  );
}

/** Serif input, used for prose-like values: credit lines, roles, addresses. */
export function ProseInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={`${BOX} font-serif text-[15px] leading-none`}
    />
  );
}

export function ProseTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={`${BOX} resize-y font-serif text-[15px] leading-[130%]`}
    />
  );
}

/** Label plus control, stacked — the drawer's only layout unit. */
export function LabelledField({
  label,
  gap = 7,
  children,
}: {
  label: string;
  gap?: number;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col" style={{ gap: `${gap}px` }}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

/** Caps column header for the table screens. */
export function ColumnHead({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <span
      className={`font-sans text-[11px] leading-none font-bold tracking-[0.08em] text-dim uppercase ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {children}
    </span>
  );
}

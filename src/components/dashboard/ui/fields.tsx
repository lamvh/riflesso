"use client";

import type { ReactNode } from "react";

import { SearchIcon } from "@/components/search-icon";

import { ChevronDownIcon } from "./icons";

/*
 * Interface text is sans. A field previews its value the way the site sets it:
 * names and titles in bold sans, prose (credits, addresses, bios) in serif.
 */

const BOX =
  "w-full rounded-[2px] border border-line bg-paper px-[11px] text-ink transition-colors hover:border-[#b5b5b2] focus:border-ink focus:shadow-[0_0_0_1px_var(--color-ink)] focus:outline-none";

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-sans text-[13px] leading-none font-medium text-[#3d3d3b]">
      {children}
    </span>
  );
}

/** Bold sans input, for names and titles. */
export function NameInput({
  value,
  onChange,
  placeholder,
  size = 16,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: number;
  id?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      style={{ fontSize: `${size}px` }}
      className={`${BOX} h-[40px] font-sans font-bold tracking-[-0.3px]`}
    />
  );
}

/** Serif input, for prose-like values: credit lines, roles, addresses. */
export function ProseInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={`${BOX} h-[40px] font-serif text-[16px]`}
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
      className={`${BOX} resize-y py-[9px] font-serif text-[16px] leading-[140%]`}
    />
  );
}

/** Label, optional hint, then the control. */
export function LabelledField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-[8px]">
      <div className="flex flex-col gap-[4px]">
        <FieldLabel>{label}</FieldLabel>
        {hint && (
          <span className="font-sans text-[12px] leading-[140%] text-graphite">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

export function ColumnHead({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`font-sans text-[12px] leading-none font-medium text-graphite ${className}`}>
      {children}
    </span>
  );
}

export function SearchField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block w-full sm:w-[260px]">
      <span className="sr-only">{label}</span>
      <span className="pointer-events-none absolute top-1/2 left-[11px] -translate-y-1/2 text-graphite">
        <SearchIcon size={14} />
      </span>
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`${BOX} h-[36px] pl-[32px] font-sans text-[14px]`}
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${BOX} h-[36px] cursor-pointer appearance-none pr-[32px] font-sans text-[14px] font-medium`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-[10px] -translate-y-1/2 text-graphite">
        <ChevronDownIcon />
      </span>
    </label>
  );
}

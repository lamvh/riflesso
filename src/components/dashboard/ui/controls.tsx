"use client";

import type { ReactNode } from "react";

/*
 * Buttons, chips and segments are square-cornered like the rest of the house.
 * Only things that report state — status pills and switches — are round.
 */

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const BUTTON_BASE =
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-[6px] rounded-[2px] border font-sans leading-none font-medium whitespace-nowrap transition-colors disabled:cursor-default";

const VARIANT: Record<Variant, string> = {
  primary:
    "border-ink bg-ink text-paper hover:bg-[#2b2b2a] disabled:border-line disabled:bg-hover disabled:text-subtle",
  secondary:
    "border-line bg-paper text-ink hover:border-ink disabled:text-subtle disabled:hover:border-line",
  ghost: "border-transparent bg-transparent text-graphite hover:bg-hover hover:text-ink",
  danger: "border-transparent bg-transparent text-danger hover:bg-danger-soft",
};

const SIZE: Record<Size, string> = {
  sm: "h-[28px] px-[10px] text-[13px]",
  md: "h-[36px] px-[14px] text-[14px]",
};

/** Class string for elements that must look like a button but are not one (links, file labels). */
export const buttonClass = (variant: Variant = "secondary", size: Size = "md") =>
  `${BUTTON_BASE} ${SIZE[size]} ${VARIANT[variant]}`;

export function Button({
  children,
  onClick,
  variant = "secondary",
  size = "md",
  type = "button",
  disabled = false,
  title,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  type?: "button" | "submit";
  disabled?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${buttonClass(variant, size)} ${className}`}
    >
      {children}
    </button>
  );
}

/** A 28px square icon action; the label is announced and shown on hover. */
export function IconButton({
  label,
  onClick,
  children,
  tone = "default",
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  tone?: "default" | "danger";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`relative z-[1] flex h-[28px] w-[28px] shrink-0 cursor-pointer items-center justify-center rounded-[2px] text-graphite transition-colors disabled:cursor-default disabled:opacity-30 ${
        tone === "danger"
          ? "hover:bg-danger-soft hover:text-danger disabled:hover:bg-transparent"
          : "hover:bg-hover hover:text-ink disabled:hover:bg-transparent"
      }`}
    >
      {children}
    </button>
  );
}

/** Multi-select toggle: filled when on, outlined when off. */
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
      className={`h-[30px] cursor-pointer rounded-[2px] border px-[11px] font-sans text-[13px] leading-none font-medium transition-colors ${
        active ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink hover:border-ink"
      }`}
    >
      {label}
    </button>
  );
}

/** Pick exactly one of a few options. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex max-w-full overflow-x-auto rounded-[2px] border border-line bg-paper p-[2px] [scrollbar-width:none]"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`h-[28px] shrink-0 cursor-pointer rounded-[1px] px-[10px] font-sans text-[13px] leading-none font-medium whitespace-nowrap transition-colors ${
              active ? "bg-ink text-paper" : "text-graphite hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

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
      className={`relative z-[1] inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150 ${
        on ? "bg-ink" : "bg-line"
      }`}
    >
      <span
        className={`h-[16px] w-[16px] rounded-full bg-paper shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-transform duration-150 ${
          on ? "translate-x-[18px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

export type Tone = "live" | "draft" | "neutral";

const PILL_TONE: Record<Tone, string> = {
  live: "bg-live-soft text-live",
  draft: "bg-draft-soft text-draft",
  neutral: "bg-hover text-graphite",
};

const DOT_TONE: Record<Tone, string> = {
  live: "bg-live",
  draft: "bg-draft",
  neutral: "bg-graphite",
};

export const liveTone = (live: boolean): Tone => (live ? "live" : "draft");

/** Publish state. Clickable when it doubles as the toggle for that state. */
export function StatusPill({
  tone,
  children,
  onClick,
  title,
}: {
  tone: Tone;
  children: ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  const className = `inline-flex h-[22px] items-center gap-[6px] rounded-full px-[9px] font-sans text-[12px] leading-none font-medium whitespace-nowrap ${PILL_TONE[tone]}`;
  const body = (
    <>
      <span aria-hidden="true" className={`h-[6px] w-[6px] rounded-full ${DOT_TONE[tone]}`} />
      {children}
    </>
  );

  if (!onClick) return <span className={className}>{body}</span>;

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`${className} relative z-[1] cursor-pointer hover:shadow-[inset_0_0_0_1px_currentColor]`}
    >
      {body}
    </button>
  );
}

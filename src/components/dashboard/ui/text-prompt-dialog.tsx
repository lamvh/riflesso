"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Button } from "./controls";

/**
 * A small modal asking for one line of text, with the values already in use
 * offered as suggestions (a native datalist, so typing filters them). Used
 * for naming folders and tags. Escape or the scrim cancels.
 */
export function TextPromptDialog({
  title,
  description,
  label,
  initial = "",
  placeholder,
  suggestions = [],
  confirm,
  allowEmpty = false,
  onSubmit,
  onClose,
}: {
  title: string;
  description?: string;
  label: string;
  initial?: string;
  placeholder?: string;
  suggestions?: string[];
  confirm: string;
  /** Accept an empty answer (e.g. "no folder"). */
  allowEmpty?: boolean;
  onSubmit: (value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initial);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    /* Capture phase, so Escape closes this dialog and not a drawer underneath. */
    window.addEventListener("keydown", onKeyDown, true);
    inputRef.current?.select();
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!allowEmpty && !value.trim()) return;
    onSubmit(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px]">
      <button
        type="button"
        aria-label="Cancel"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-[#1c1810]/35 backdrop-blur-[2px] motion-safe:animate-scrim-in"
      />
      <form
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onSubmit={submit}
        className="relative flex w-[420px] max-w-full flex-col gap-[14px] rounded-[12px] bg-paper px-[20px] py-[18px] font-sans shadow-[0_16px_48px_rgba(28,24,16,0.22)]"
      >
        <div>
          <h2 className="font-serif text-[22px] leading-[115%] tracking-[-0.3px]">{title}</h2>
          {description && <p className="mt-[6px] text-[13px] leading-[145%] text-graphite">{description}</p>}
        </div>
        <label className="flex flex-col gap-[6px]">
          <span className="text-[13px] font-medium text-graphite">{label}</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            list={suggestions.length ? listId : undefined}
            className="h-[36px] w-full rounded-[10px] border border-line bg-paper px-[11px] text-[14px] text-ink hover:border-line-strong focus:border-ink focus:shadow-[0_0_0_3px_rgba(28,24,16,0.08)] focus:outline-none"
          />
          {suggestions.length > 0 && (
            <datalist id={listId}>
              {suggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          )}
        </label>
        <div className="flex justify-end gap-[8px]">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit" disabled={!allowEmpty && !value.trim()}>
            {confirm}
          </Button>
        </div>
      </form>
    </div>
  );
}

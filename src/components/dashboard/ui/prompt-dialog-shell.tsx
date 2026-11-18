"use client";

import { useEffect, type FormEvent, type ReactNode } from "react";

import { Button } from "./controls";

/** Text input look shared by the small prompt dialogs. */
export const PROMPT_INPUT_CLASS =
  "h-[36px] w-full rounded-[10px] border border-line bg-paper px-[11px] text-[14px] text-ink hover:border-line-strong focus:border-ink focus:shadow-[0_0_0_3px_rgba(28,24,16,0.08)] focus:outline-none";

/**
 * The frame of a small modal form: scrim, title, description, fields, and
 * Cancel / confirm. Escape or the scrim cancels; Enter submits.
 */
export function PromptDialogShell({
  title,
  description,
  confirm,
  canSubmit = true,
  onSubmit,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  confirm: string;
  canSubmit?: boolean;
  onSubmit: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    /* Capture phase, so Escape closes this dialog and not a drawer underneath. */
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (canSubmit) onSubmit();
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
        className="relative flex max-h-full w-[420px] max-w-full flex-col gap-[14px] overflow-y-auto rounded-[12px] bg-paper px-[20px] py-[18px] font-sans shadow-[0_16px_48px_rgba(28,24,16,0.22)]"
      >
        <div>
          <h2 className="font-serif text-[22px] leading-[115%] tracking-[-0.3px]">{title}</h2>
          {description && <p className="mt-[6px] text-[13px] leading-[145%] text-graphite">{description}</p>}
        </div>
        {children}
        <div className="flex justify-end gap-[8px]">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit" disabled={!canSubmit}>
            {confirm}
          </Button>
        </div>
      </form>
    </div>
  );
}

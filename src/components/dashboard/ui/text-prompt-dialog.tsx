"use client";

import { useEffect, useId, useRef, useState } from "react";

import { PROMPT_INPUT_CLASS, PromptDialogShell } from "./prompt-dialog-shell";

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

  useEffect(() => inputRef.current?.select(), []);

  return (
    <PromptDialogShell
      title={title}
      description={description}
      confirm={confirm}
      canSubmit={allowEmpty || Boolean(value.trim())}
      onSubmit={() => onSubmit(value)}
      onClose={onClose}
    >
      <label className="flex flex-col gap-[6px]">
        <span className="text-[13px] font-medium text-graphite">{label}</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          list={suggestions.length ? listId : undefined}
          className={PROMPT_INPUT_CLASS}
        />
        {suggestions.length > 0 && (
          <datalist id={listId}>
            {suggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        )}
      </label>
    </PromptDialogShell>
  );
}

"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { LABEL_LIMITS, normalizeTag, sameTag, type MediaLabel, type MediaLabelChange } from "@/lib/media/media-label-types";

import { PROMPT_INPUT_CLASS, PromptDialogShell } from "./ui/prompt-dialog-shell";

const CHIP = "inline-flex h-[24px] items-center gap-[4px] rounded-[5px] px-[7px] text-[12px] font-medium";

/** The change that turns `current` into the edited folder and tags. */
function changeBetween(current: MediaLabel, folder: string, tags: string[]): MediaLabelChange {
  const change: MediaLabelChange = {};
  if (folder.trim() !== current.folder) change.folder = folder;
  const removeTags = current.tags.filter((tag) => !tags.some((kept) => sameTag(kept, tag)));
  const addTags = tags.filter((tag) => !current.tags.some((old) => sameTag(old, tag)));
  if (removeTags.length) change.removeTags = removeTags;
  if (addTags.length) change.addTags = addTags;
  return change;
}

/**
 * Folder and tags of one file, edited together from its card: type a folder
 * (or pick one in use), add tags with Enter or a comma, click an existing tag
 * to add it, × to drop one. Saves only what changed.
 */
export function MediaLabelEditDialog({
  name,
  label,
  folders,
  tags: knownTags,
  onSave,
  onClose,
}: {
  /** The file's display name. */
  name: string;
  label: MediaLabel;
  /** Every folder in use, for suggestions. */
  folders: string[];
  /** Every tag in use, offered as one-click additions. */
  tags: string[];
  onSave: (change: MediaLabelChange) => void;
  onClose: () => void;
}) {
  const [folder, setFolder] = useState(label.folder);
  const [tags, setTags] = useState(label.tags);
  const [draft, setDraft] = useState("");
  const folderRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => folderRef.current?.focus(), []);

  const full = tags.length >= LABEL_LIMITS.tagsPerFile;
  const add = (input: string) => {
    const next = [...tags];
    for (const part of input.split(",")) {
      const tag = normalizeTag(part);
      if (tag && next.length < LABEL_LIMITS.tagsPerFile && !next.some((kept) => sameTag(kept, tag))) next.push(tag);
    }
    setTags(next);
    setDraft("");
  };

  const onTagKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if ((event.key === "Enter" || event.key === ",") && draft.trim()) {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && !draft && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  /* A tag still being typed counts, so Save doesn't drop it. */
  const finalTags = () => {
    const pending = draft.trim() ? normalizeTag(draft) : null;
    return pending && !full && !tags.some((kept) => sameTag(kept, pending)) ? [...tags, pending] : tags;
  };

  const offered = knownTags.filter((tag) => !tags.some((kept) => sameTag(kept, tag)));

  return (
    <PromptDialogShell
      title="Folder and tags"
      description={`${name} · the file's address doesn't change.`}
      confirm="Save"
      onSubmit={() => {
        const change = changeBetween(label, folder, finalTags());
        if (Object.keys(change).length) onSave(change);
        onClose();
      }}
      onClose={onClose}
    >
      <label className="flex flex-col gap-[6px]">
        <span className="text-[13px] font-medium text-graphite">Folder</span>
        <input
          ref={folderRef}
          value={folder}
          onChange={(event) => setFolder(event.target.value)}
          placeholder="Unfiled · or e.g. Albums/Vogue Italia"
          list={folders.length ? listId : undefined}
          className={PROMPT_INPUT_CLASS}
        />
        {folders.length > 0 && (
          <datalist id={listId}>
            {folders.map((path) => (
              <option key={path} value={path} />
            ))}
          </datalist>
        )}
      </label>

      <div className="flex flex-col gap-[6px]">
        <label htmlFor={`${listId}-tag`} className="text-[13px] font-medium text-graphite">
          Tags <span className="font-normal text-subtle">· {tags.length}/{LABEL_LIMITS.tagsPerFile}</span>
        </label>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-[4px]">
            {tags.map((tag) => (
              <span key={tag} className={`${CHIP} bg-ink/8 text-ink`}>
                #{tag}
                <button
                  type="button"
                  aria-label={`Remove #${tag}`}
                  onClick={() => setTags(tags.filter((kept) => kept !== tag))}
                  className="cursor-pointer text-graphite hover:text-danger"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          id={`${listId}-tag`}
          value={draft}
          disabled={full}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onTagKey}
          placeholder={full ? "Tag limit reached" : "Type a tag, Enter to add"}
          className={PROMPT_INPUT_CLASS}
        />
        {offered.length > 0 && !full && (
          <div className="flex max-h-[96px] flex-wrap gap-[4px] overflow-y-auto">
            {offered.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => add(tag)}
                className={`${CHIP} cursor-pointer bg-sink text-graphite hover:text-ink`}
              >
                + #{tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </PromptDialogShell>
  );
}

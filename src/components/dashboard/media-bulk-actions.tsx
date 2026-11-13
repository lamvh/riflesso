"use client";

import { useState } from "react";

import { LABEL_LIMITS, type MediaLabel } from "@/lib/media/media-label-types";

import { BulkBar, BulkButton, BulkSelect } from "./ui/selection-controls";
import { TextPromptDialog } from "./ui/text-prompt-dialog";

/** Splits "bts, Thu 2026 , ss26" into tags. */
const splitTags = (input: string) =>
  input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

/**
 * The bar shown while files are picked on the Media screen: file them into a
 * folder (an existing one or a new name), add or remove tags, or delete the
 * picked files nothing uses.
 */
export function MediaBulkActions({
  keys,
  labelOf,
  folders,
  tags,
  unusedKeys,
  onMove,
  onAddTags,
  onRemoveTag,
  onDelete,
  onClear,
}: {
  keys: string[];
  labelOf: (key: string) => MediaLabel;
  /** Every folder in use, for suggestions. */
  folders: string[];
  /** Every tag in use, for suggestions. */
  tags: string[];
  /** The picked files nothing uses; Delete only touches these. */
  unusedKeys: string[];
  onMove: (folder: string) => void;
  onAddTags: (tags: string[]) => void;
  onRemoveTag: (tag: string) => void;
  onDelete: () => void;
  onClear: () => void;
}) {
  const [prompt, setPrompt] = useState<"move" | "tag" | null>(null);

  const pickedTags = [...new Set(keys.flatMap((key) => labelOf(key).tags))].sort((a, b) => a.localeCompare(b));
  const sharedFolder = new Set(keys.map((key) => labelOf(key).folder)).size === 1 ? labelOf(keys[0]).folder : "";

  return (
    <>
      <BulkBar count={keys.length} noun="file" onClear={onClear}>
        <BulkButton onClick={() => setPrompt("move")}>Move to folder…</BulkButton>
        <BulkButton onClick={() => setPrompt("tag")}>Add tag…</BulkButton>
        {pickedTags.length > 0 && (
          <BulkSelect
            label="Remove tag"
            options={pickedTags.map((tag) => ({ value: tag, label: `#${tag}` }))}
            onPick={onRemoveTag}
          />
        )}
        {unusedKeys.length > 0 && (
          <BulkButton danger onClick={onDelete}>
            {unusedKeys.length === keys.length ? "Delete" : `Delete ${unusedKeys.length} unused`}
          </BulkButton>
        )}
      </BulkBar>

      {prompt === "move" && (
        <TextPromptDialog
          title="Move to folder"
          description="Pick a folder or type a new name. Use / for a folder inside another, e.g. Albums/Vogue Italia. Leave it empty to unfile. The files' addresses don't change."
          label="Folder"
          initial={sharedFolder}
          placeholder="Albums/Vogue Italia"
          suggestions={folders}
          confirm="Move"
          allowEmpty
          onClose={() => setPrompt(null)}
          onSubmit={(folder) => {
            setPrompt(null);
            onMove(folder);
          }}
        />
      )}
      {prompt === "tag" && (
        <TextPromptDialog
          title="Add tags"
          description={`Separate tags with commas. Up to ${LABEL_LIMITS.tagsPerFile} a file, ${LABEL_LIMITS.tag} characters each.`}
          label="Tags"
          placeholder="BTS, SS26"
          suggestions={tags}
          confirm="Add"
          onClose={() => setPrompt(null)}
          onSubmit={(input) => {
            setPrompt(null);
            const added = splitTags(input);
            if (added.length) onAddTags(added);
          }}
        />
      )}
    </>
  );
}

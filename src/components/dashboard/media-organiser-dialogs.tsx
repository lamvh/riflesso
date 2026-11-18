"use client";

import { LABEL_LIMITS, type MediaLabel, type MediaLabelChange } from "@/lib/media/media-label-types";

import { MediaLabelEditDialog } from "./media-label-edit-dialog";
import { TextPromptDialog } from "./ui/text-prompt-dialog";

/** Which organising dialog the Media screen has open. */
export type OrganiserDialog =
  | { kind: "new-folder"; parent: string }
  | { kind: "rename-folder"; path: string }
  | { kind: "rename-tag"; tag: string }
  | { kind: "edit"; key: string }
  | null;

/**
 * The prompts behind folder and tag management on the Media screen. Each
 * hands its answer back; the screen runs the change and resets filters.
 */
export function MediaOrganiserDialogs({
  dialog,
  folders,
  tags,
  labelOf,
  onClose,
  onCreateFolder,
  onRenameFolder,
  onRenameTag,
  onEditFile,
}: {
  dialog: OrganiserDialog;
  folders: string[];
  tags: string[];
  labelOf: (key: string) => MediaLabel;
  onClose: () => void;
  onCreateFolder: (path: string) => void;
  onRenameFolder: (from: string, to: string) => void;
  onRenameTag: (from: string, to: string) => void;
  onEditFile: (key: string, change: MediaLabelChange) => void;
}) {
  if (!dialog) return null;

  if (dialog.kind === "new-folder") {
    return (
      <TextPromptDialog
        title="New folder"
        description="It stays in the sidebar, empty, until you move files in or remove it. Use / for a folder inside another."
        label="Folder"
        initial={dialog.parent ? `${dialog.parent}/` : ""}
        placeholder="Albums/Vogue Italia"
        suggestions={folders}
        confirm="Create"
        onClose={onClose}
        onSubmit={(path) => {
          onClose();
          onCreateFolder(path);
        }}
      />
    );
  }

  if (dialog.kind === "rename-folder") {
    return (
      <TextPromptDialog
        title="Rename folder"
        description="Folders inside it move along. Use / to move it under another folder."
        label="Folder"
        initial={dialog.path}
        suggestions={folders}
        confirm="Rename"
        onClose={onClose}
        onSubmit={(target) => {
          onClose();
          onRenameFolder(dialog.path, target);
        }}
      />
    );
  }

  if (dialog.kind === "rename-tag") {
    return (
      <TextPromptDialog
        title="Rename tag"
        description={`Renames #${dialog.tag} on every file. Pick an existing tag to merge the two. Up to ${LABEL_LIMITS.tag} characters.`}
        label="Tag"
        initial={dialog.tag}
        suggestions={tags.filter((tag) => tag !== dialog.tag)}
        confirm="Rename"
        onClose={onClose}
        onSubmit={(target) => {
          onClose();
          onRenameTag(dialog.tag, target);
        }}
      />
    );
  }

  const name = dialog.key.slice(dialog.key.lastIndexOf("/") + 1);
  return (
    <MediaLabelEditDialog
      name={name}
      label={labelOf(dialog.key)}
      folders={folders}
      tags={tags}
      onClose={onClose}
      onSave={(change) => onEditFile(dialog.key, change)}
    />
  );
}

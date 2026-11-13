"use client";

import { SelectField } from "./ui/fields";

/*
 * Folder navigation for the Media screen. Folders are labels kept in the
 * database, so one exists as long as a file is filed in it; a new folder is
 * made by moving files into it. Choosing a folder shows its nested folders'
 * files too.
 */

/** "all", "unfiled", or a folder path. */
export type FolderFilter = string;

export const ALL_FOLDERS = "all";
export const UNFILED = "unfiled";
/* Folder paths never start with ":", so these can't collide with one. */
const PATH_PREFIX = ":";

export const folderValue = (path: string) => `${PATH_PREFIX}${path}`;
export const folderPathOf = (filter: FolderFilter) =>
  filter.startsWith(PATH_PREFIX) ? filter.slice(PATH_PREFIX.length) : null;

const depthOf = (path: string) => path.split("/").length - 1;
const leafOf = (path: string) => path.slice(path.lastIndexOf("/") + 1);

type Props = {
  /** Every folder level in use, sorted (see `folderTree`). */
  folders: string[];
  /** Files in each folder, nested folders included. */
  counts: Map<string, number>;
  total: number;
  unfiled: number;
  value: FolderFilter;
  onChange: (value: FolderFilter) => void;
  /** Absent while folders can't be edited. */
  onRename?: (path: string) => void;
  onUnfile?: (path: string) => void;
};

/** Sidebar on wide screens. */
export function MediaFolderList({ folders, counts, total, unfiled, value, onChange, onRename, onUnfile }: Props) {
  const current = folderPathOf(value);
  const rows: { value: FolderFilter; label: string; count: number; depth: number }[] = [
    { value: ALL_FOLDERS, label: "All files", count: total, depth: 0 },
    { value: UNFILED, label: "Unfiled", count: unfiled, depth: 0 },
    ...folders.map((path) => ({ value: folderValue(path), label: leafOf(path), count: counts.get(path) ?? 0, depth: depthOf(path) })),
  ];

  return (
    <nav aria-label="Folders" className="flex flex-col gap-[2px] font-sans">
      <p className="px-[10px] pb-[6px] text-[12px] font-medium tracking-[0.2px] text-subtle uppercase">Folders</p>
      {rows.map((row) => {
        const active = row.value === value;
        return (
          <button
            key={row.value}
            type="button"
            aria-current={active ? "true" : undefined}
            onClick={() => onChange(row.value)}
            style={{ paddingLeft: 10 + row.depth * 14 }}
            className={`flex h-[32px] cursor-pointer items-center gap-[8px] rounded-[6px] pr-[10px] text-left text-[13px] transition-colors ${
              active ? "bg-ink text-paper" : "text-body hover:bg-hover hover:text-ink"
            }`}
          >
            <span className="min-w-0 flex-1 truncate font-medium">{row.label}</span>
            <span className={`tabular-nums ${active ? "text-paper/70" : "text-subtle"}`}>{row.count}</span>
          </button>
        );
      })}
      {folders.length === 0 && onRename && (
        <p className="px-[10px] pt-[6px] text-[12px] leading-[145%] text-graphite">
          Select files, then Move to folder to make one.
        </p>
      )}
      {current && onRename && onUnfile && (
        <div className="mt-[8px] flex flex-wrap gap-[4px] border-t border-line px-[6px] pt-[10px]">
          <button
            type="button"
            onClick={() => onRename(current)}
            className="h-[26px] cursor-pointer rounded-[6px] px-[8px] text-[12px] font-medium text-graphite hover:bg-hover hover:text-ink"
          >
            Rename
          </button>
          <button
            type="button"
            onClick={() => onUnfile(current)}
            className="h-[26px] cursor-pointer rounded-[6px] px-[8px] text-[12px] font-medium text-danger hover:bg-danger-soft"
          >
            Remove folder
          </button>
        </div>
      )}
    </nav>
  );
}

/** Compact select for narrow screens. */
export function MediaFolderSelect({ folders, counts, total, unfiled, value, onChange }: Props) {
  return (
    <SelectField
      label="Folder"
      value={value}
      onChange={onChange}
      options={[
        { value: ALL_FOLDERS, label: `All files (${total})` },
        { value: UNFILED, label: `Unfiled (${unfiled})` },
        ...folders.map((path) => ({
          value: folderValue(path),
          label: `${"— ".repeat(depthOf(path))}${leafOf(path)} (${counts.get(path) ?? 0})`,
        })),
      ]}
    />
  );
}

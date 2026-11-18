"use client";

import { useFolderDrop } from "./media-file-drag";
import { SelectField } from "./ui/fields";

/*
 * Folder navigation for the Media screen. Folders are labels kept in the
 * database: one exists while a file is filed in it, or once it is made with
 * New folder (then it stays, empty or not, until removed). Choosing a folder
 * shows its nested folders' files too. Folder rows and Unfiled take dropped
 * cards (see media-file-drag).
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
  /** Absent until the media_library_folders migration has run. */
  onCreate?: () => void;
};

type Row = { value: FolderFilter; label: string; count: number; depth: number; title?: string; drop?: string };

/** One sidebar row; folder rows and Unfiled accept dropped files while editing works. */
function FolderRow({ row, active, droppable, onChange }: { row: Row; active: boolean; droppable: boolean; onChange: (value: FolderFilter) => void }) {
  const { setNodeRef, isOver } = useFolderDrop(row.drop ?? "", !droppable || row.drop === undefined);
  return (
    <button
      ref={setNodeRef}
      type="button"
      aria-current={active ? "true" : undefined}
      title={row.title}
      onClick={() => onChange(row.value)}
      style={{ paddingLeft: 10 + row.depth * 14 }}
      className={`flex h-[32px] cursor-pointer items-center gap-[8px] rounded-[6px] pr-[10px] text-left text-[13px] transition-colors ${
        isOver
          ? "bg-ink/15 text-ink ring-1 ring-ink"
          : active
            ? "bg-ink text-paper"
            : "text-body hover:bg-hover hover:text-ink"
      }`}
    >
      <span className="min-w-0 flex-1 truncate font-medium">{row.label}</span>
      <span className={`tabular-nums ${active && !isOver ? "text-paper/70" : "text-subtle"}`}>{row.count}</span>
    </button>
  );
}

/** Sidebar on wide screens. */
export function MediaFolderList({ folders, counts, total, unfiled, value, onChange, onRename, onUnfile, onCreate }: Props) {
  const current = folderPathOf(value);
  const rows: Row[] = [
    { value: ALL_FOLDERS, label: "All files", count: total, depth: 0 },
    { value: UNFILED, label: "Unfiled", count: unfiled, depth: 0, drop: "" },
    ...folders.map((path) => ({
      value: folderValue(path),
      label: leafOf(path),
      count: counts.get(path) ?? 0,
      depth: depthOf(path),
      title: path,
      drop: path,
    })),
  ];

  return (
    <nav aria-label="Folders" className="flex flex-col gap-[2px] font-sans">
      <div className="flex items-center justify-between pb-[6px] pl-[10px]">
        <p className="text-[12px] font-medium tracking-[0.2px] text-subtle uppercase">Folders</p>
        {onCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="h-[24px] cursor-pointer rounded-[6px] px-[8px] text-[12px] font-medium text-graphite hover:bg-hover hover:text-ink"
          >
            + New
          </button>
        )}
      </div>
      {rows.map((row) => (
        <FolderRow key={row.value} row={row} active={row.value === value} droppable={Boolean(onRename)} onChange={onChange} />
      ))}
      {folders.length === 0 && onRename && (
        <p className="px-[10px] pt-[6px] text-[12px] leading-[145%] text-graphite">
          {onCreate ? "Make one with + New, or select files and Move to folder." : "Select files, then Move to folder to make one."}
        </p>
      )}
      {folders.length > 0 && onRename && (
        <p className="px-[10px] pt-[6px] text-[12px] leading-[145%] text-subtle">Drag files onto a folder to move them.</p>
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

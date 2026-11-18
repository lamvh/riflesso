"use client";

/*
 * Tag management in the Media sidebar: every tag in use with how many files
 * carry it. Clicking a tag filters the grid (again to clear); the open tag
 * can be renamed (onto another tag to merge them) or deleted from every file.
 */

const ROW =
  "flex h-[30px] cursor-pointer items-center gap-[8px] rounded-[6px] px-[10px] text-left text-[13px] transition-colors";
const ACTION = "h-[26px] cursor-pointer rounded-[6px] px-[8px] text-[12px] font-medium";

export function MediaTagList({
  tags,
  counts,
  active,
  onPick,
  onRename,
  onDelete,
}: {
  tags: string[];
  counts: Map<string, number>;
  /** The tag the grid is filtered by, if any. */
  active: string | null;
  /** The tag to filter by, or null to clear. */
  onPick: (tag: string | null) => void;
  /** Absent while tags can't be edited. */
  onRename?: (tag: string) => void;
  onDelete?: (tag: string) => void;
}) {
  return (
    <nav aria-label="Tags" className="flex flex-col gap-[2px] font-sans">
      <p className="px-[10px] pb-[6px] text-[12px] font-medium tracking-[0.2px] text-subtle uppercase">Tags</p>
      {tags.length === 0 && (
        <p className="px-[10px] text-[12px] leading-[145%] text-graphite">
          No tags yet. Select files and Add tag, or use Edit on a card.
        </p>
      )}
      <div className="flex max-h-[320px] flex-col gap-[2px] overflow-y-auto">
        {tags.map((tag) => {
          const on = active !== null && active.toLowerCase() === tag.toLowerCase();
          return (
            <button
              key={tag}
              type="button"
              aria-current={on ? "true" : undefined}
              onClick={() => onPick(on ? null : tag)}
              className={`${ROW} ${on ? "bg-ink text-paper" : "text-body hover:bg-hover hover:text-ink"}`}
            >
              <span className="min-w-0 flex-1 truncate font-medium">#{tag}</span>
              <span className={`tabular-nums ${on ? "text-paper/70" : "text-subtle"}`}>{counts.get(tag) ?? 0}</span>
            </button>
          );
        })}
      </div>
      {active && onRename && onDelete && (
        <div className="mt-[8px] flex flex-wrap gap-[4px] border-t border-line px-[6px] pt-[10px]">
          <button type="button" onClick={() => onRename(active)} className={`${ACTION} text-graphite hover:bg-hover hover:text-ink`}>
            Rename tag
          </button>
          <button type="button" onClick={() => onDelete(active)} className={`${ACTION} text-danger hover:bg-danger-soft`}>
            Delete tag
          </button>
        </div>
      )}
    </nav>
  );
}

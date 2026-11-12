"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

import { VIEWS, VIEW_HREF, VIEW_LABEL } from "@/lib/dashboard/admin-views";

import { useAdmin } from "./admin-store";
import { COMMAND_PALETTE_EVENT } from "./command-palette-events";
import { AlbumIcon, PersonIcon, PlusIcon, SearchMarkIcon, TagIcon } from "./ui/icons";
import { useContentPreview } from "./use-content-preview";

type Command = {
  id: string;
  group: "Go to" | "Actions" | "Artists" | "Albums" | "Categories";
  label: string;
  hint?: string;
  icon?: ReactNode;
  /** Extra text the query also matches, e.g. an artist's disciplines. */
  keywords?: string;
  run: () => void;
};

/** Rows per record group once a query is typed. */
const GROUP_LIMIT = 6;
const GROUP_ORDER: Command["group"][] = ["Go to", "Actions", "Artists", "Albums", "Categories"];

/**
 * ⌘K / Ctrl+K from anywhere in the dashboard: jump to a screen, run a common
 * action, or open any artist or album straight into its drawer.
 */
export function CommandPalette() {
  const { state, dispatch } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const { openPreview } = useContentPreview();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const show = () => {
      setQuery("");
      setActive(0);
      setOpen(true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) setOpen(false);
        else show();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(COMMAND_PALETTE_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(COMMAND_PALETTE_EVENT, show);
    };
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => {
      if (href !== pathname) router.push(href);
    };
    const catName = new Map(state.cats.map((cat) => [cat.id, cat.name]));

    return [
      ...VIEWS.map(
        (view): Command => ({
          id: `view-${view}`,
          group: "Go to",
          label: VIEW_LABEL[view],
          run: go(VIEW_HREF[view]),
        }),
      ),
      {
        id: "new-artist",
        group: "Actions",
        label: "New artist",
        icon: <PlusIcon />,
        run: () => dispatch({ type: "artist/open", index: -1 }),
      },
      {
        id: "new-album",
        group: "Actions",
        label: "New album",
        icon: <PlusIcon />,
        run: () => dispatch({ type: "album/open", index: -1 }),
      },
      {
        id: "preview",
        group: "Actions",
        label: "Preview the site with these edits",
        run: () => openPreview("/"),
      },
      {
        id: "pause",
        group: "Actions",
        label: state.autosavePaused ? "Resume auto-save" : "Pause auto-save",
        run: () => dispatch({ type: "autosave/pause", paused: !state.autosavePaused }),
      },
      {
        id: "view-site",
        group: "Actions",
        label: "Open the live site",
        run: () => window.open("/", "_blank", "noopener"),
      },
      ...state.artists.map(
        (artist, index): Command => ({
          id: `artist-${artist.id}`,
          group: "Artists",
          label: artist.name || "Untitled artist",
          hint: artist.live ? undefined : "Hidden",
          icon: <PersonIcon />,
          keywords: artist.categoryIds.map((id) => catName.get(id) ?? "").join(" "),
          run: () => dispatch({ type: "artist/open", index }),
        }),
      ),
      ...state.albums.map(
        (album, index): Command => ({
          id: `album-${album.id}`,
          group: "Albums",
          label: album.title || "Untitled album",
          hint: album.live ? album.kind : `${album.kind}, draft`,
          icon: <AlbumIcon />,
          keywords: album.credits.map((credit) => credit.name).join(" "),
          run: () => dispatch({ type: "album/open", index }),
        }),
      ),
      ...state.cats.map(
        (cat): Command => ({
          id: `cat-${cat.id}`,
          group: "Categories",
          label: cat.name,
          icon: <TagIcon />,
          run: go(VIEW_HREF.cats),
        }),
      ),
    ];
  }, [state.artists, state.albums, state.cats, state.autosavePaused, dispatch, router, pathname, openPreview]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    /* Empty query: screens and actions only — records are found by typing. */
    if (!needle) return commands.filter((command) => command.group === "Go to" || command.group === "Actions");

    const words = needle.split(/\s+/);
    const matches = commands.filter((command) => {
      const haystack = `${command.label} ${command.keywords ?? ""}`.toLowerCase();
      return words.every((word) => haystack.includes(word));
    });
    /* Names that start with the query lead their group. */
    const ranked = matches.sort(
      (a, b) =>
        Number(!a.label.toLowerCase().startsWith(needle)) -
        Number(!b.label.toLowerCase().startsWith(needle)),
    );
    return GROUP_ORDER.flatMap((group) =>
      ranked.filter((command) => command.group === group).slice(0, GROUP_LIMIT),
    );
  }, [commands, query]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const run = (command: Command | undefined) => {
    if (!command) return;
    setOpen(false);
    command.run();
  };

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(results.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      run(results[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-[16px] pt-[12vh]">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={() => setOpen(false)}
        className="absolute inset-0 cursor-default bg-[#1c1810]/35 backdrop-blur-[2px] motion-safe:animate-scrim-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the dashboard"
        className="relative flex max-h-[70vh] w-full max-w-[600px] flex-col overflow-hidden rounded-[14px] border border-line bg-paper font-sans shadow-[0_24px_64px_-12px_rgba(28,24,16,0.4)]"
      >
        <label className="flex items-center gap-[10px] border-b border-line px-[16px]">
          <SearchMarkIcon size={16} className="shrink-0 text-graphite" />
          <input
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls="command-results"
            aria-activedescendant={results[active] ? `command-${results[active].id}` : undefined}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search artists, albums, screens…"
            className="h-[52px] flex-1 bg-transparent text-[16px] outline-none"
          />
          <kbd className="rounded-[4px] border border-line px-[5px] py-[2px] text-[11px] text-graphite">Esc</kbd>
        </label>

        <ul id="command-results" ref={listRef} role="listbox" className="overflow-y-auto p-[6px]">
          {results.map((command, index) => {
            const heading = results[index - 1]?.group !== command.group ? command.group : null;
            return (
              <li key={command.id} role="presentation">
                {heading && (
                  <p className="px-[10px] pt-[10px] pb-[6px] text-[11px] leading-none font-bold tracking-[0.12em] text-graphite uppercase">
                    {heading}
                  </p>
                )}
                <div
                  id={`command-${command.id}`}
                  role="option"
                  aria-selected={index === active}
                  data-index={index}
                  onMouseMove={() => setActive(index)}
                  onClick={() => run(command)}
                  className={`flex h-[38px] cursor-pointer items-center gap-[10px] rounded-[8px] px-[10px] text-[14px] ${
                    index === active ? "bg-seamless text-ink" : "text-body"
                  }`}
                >
                  <span className="flex w-[16px] justify-center text-graphite">{command.icon}</span>
                  <span className="flex-1 truncate font-medium">{command.label}</span>
                  {command.hint && <span className="text-[12px] text-graphite">{command.hint}</span>}
                  {index === active && <span className="text-[12px] text-graphite">↵</span>}
                </div>
              </li>
            );
          })}
          {results.length === 0 && (
            <li className="px-[12px] py-[18px] text-[14px] text-graphite">Nothing matches “{query}”.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import type { SiteSearchIndex } from "@/lib/content/site-search-index";

import { CloseIcon } from "./close-icon";
import { SearchIcon } from "./search-icon";

type Result = {
  key: string;
  group: "Artists" | "Work" | "Pages";
  title: string;
  detail: string;
  image?: string;
  href: string;
};

/** Rows per group once something is typed. */
const LIMIT = 8;

/* Loaded once per visit, on first open, and shared by every page's masthead. */
let indexPromise: Promise<SiteSearchIndex> | null = null;
const loadIndex = () =>
  (indexPromise ??= fetch("/api/search-index")
    .then((response) => response.json() as Promise<SiteSearchIndex>)
    .catch(() => {
      indexPromise = null;
      return { artists: [], works: [], pages: [] };
    }));

const matches = (needle: string[], ...fields: string[]) => {
  const haystack = fields.join(" ").toLowerCase();
  return needle.every((word) => haystack.includes(word));
};

/**
 * Full-screen search over the roster, the work on the homepage and the pages.
 * An artist opens the directory filtered to them; a work opens its gallery on
 * the homepage. Arrow keys move, Enter opens, Escape closes.
 */
export function SiteSearch({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [index, setIndex] = useState<SiteSearchIndex | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    void loadIndex().then((loaded) => live && setIndex(loaded));
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      live = false;
      document.body.style.overflow = previous;
    };
  }, []);

  const results = useMemo<Result[]>(() => {
    if (!index) return [];
    const needle = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const pages = index.pages.map(
      (page): Result => ({ key: `page-${page.href}`, group: "Pages", title: page.label, detail: "", href: page.href }),
    );
    if (needle.length === 0) return pages;

    const artists = index.artists
      .filter((artist) => matches(needle, artist.name, artist.category))
      .slice(0, LIMIT)
      .map(
        (artist): Result => ({
          key: `artist-${artist.name}`,
          group: "Artists",
          title: artist.name,
          detail: artist.category,
          image: artist.image,
          href: `/artists?artist=${encodeURIComponent(artist.name)}`,
        }),
      );
    const works = index.works
      .filter((work) => matches(needle, work.title, work.credits, work.label))
      .slice(0, LIMIT)
      .map(
        (work): Result => ({
          key: `work-${work.id}`,
          group: "Work",
          title: work.title,
          detail: [work.label, work.credits].filter(Boolean).join(" — "),
          image: work.image,
          href: `/?work=${work.id}`,
        }),
      );
    return [...artists, ...works, ...pages.filter((page) => matches(needle, page.title))];
  }, [index, query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const open = (result: Result | undefined) => {
    if (!result) return;
    onClose();
    router.push(result.href, { scroll: !result.href.startsWith("/?work=") });
  };

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => Math.min(results.length - 1, current + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(0, current - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      open(results[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  const typed = query.trim().length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 z-50 flex flex-col bg-paper text-ink motion-safe:animate-[scrim-in_200ms_ease-out]"
    >
      <div className="flex h-[60px] shrink-0 items-center gap-[12px] border-b border-black/10 px-5">
        <SearchIcon size={17} />
        <input
          autoFocus
          role="combobox"
          aria-expanded="true"
          aria-controls="site-search-results"
          aria-activedescendant={results[active] ? `search-${results[active].key}` : undefined}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search artists and work"
          className="h-full min-w-0 flex-1 bg-transparent font-sans text-[18px] font-bold tracking-[-0.5px] outline-none placeholder:font-normal sm:text-[22px]"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="flex h-[36px] w-[36px] shrink-0 cursor-pointer items-center justify-center"
        >
          <CloseIcon />
        </button>
      </div>

      <div ref={listRef} id="site-search-results" role="listbox" className="flex-1 overflow-y-auto px-5 pt-[24px] pb-[60px]">
        {!index ? (
          <p className="font-serif text-[16px] text-muted">Loading…</p>
        ) : (
          <>
            {!typed && (
              <p className="mb-[28px] font-serif text-[16px] leading-[140%] text-muted">
                {index.artists.length} artists and {index.works.length} works. Type a name, a
                discipline, a publication or a credit.
              </p>
            )}
            {results.length === 0 && typed && (
              <p className="font-serif text-[16px] text-muted">Nothing matches “{query.trim()}”.</p>
            )}
            {results.map((result, position) => {
              const heading = results[position - 1]?.group !== result.group ? result.group : null;
              const selected = position === active;
              return (
                <div key={result.key}>
                  {heading && (
                    <p className="mt-[20px] mb-[10px] font-sans text-[13px] leading-none font-bold tracking-[-0.3px] text-muted first:mt-0">
                      {heading}
                    </p>
                  )}
                  <div
                    id={`search-${result.key}`}
                    role="option"
                    aria-selected={selected}
                    data-index={position}
                    onMouseMove={() => setActive(position)}
                    onClick={() => open(result)}
                    className={`-mx-[8px] flex cursor-pointer items-center gap-[14px] rounded-[2px] px-[8px] py-[8px] ${
                      selected ? "bg-black/[0.04]" : ""
                    }`}
                  >
                    {result.group !== "Pages" && (
                      <span className="h-[52px] w-[40px] shrink-0 overflow-hidden bg-black/[0.05]">
                        {result.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={result.image} alt="" loading="lazy" className="block h-full w-full object-cover" />
                        )}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate font-sans font-bold tracking-[-0.5px] ${
                          result.group === "Pages" ? "text-[20px]" : "text-[17px] sm:text-[20px]"
                        } ${selected ? "underline decoration-2 underline-offset-[3px]" : ""}`}
                      >
                        {result.title}
                      </span>
                      {result.detail && (
                        <span className="mt-[3px] block truncate font-serif text-[15px] leading-[130%] text-muted">
                          {result.detail}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

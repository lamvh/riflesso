import Link from "next/link";

import { SearchIcon } from "./search-icon";

/**
 * Fixed masthead. The wordmark is horizontally stretched (scaleX) rather than
 * set in a condensed face, matching the original mark.
 */
type SiteHeaderProps = {
  /** Underlines the matching nav item. The home page marks nothing active. */
  currentSection?: "artists";
};

export function SiteHeader({ currentSection }: SiteHeaderProps = {}) {
  const artistsActive = currentSection === "artists";

  return (
    <header className="fixed top-0 left-0 z-30 h-[60px] w-full bg-paper">
      <div className="relative flex h-full items-center justify-between px-5">
        <Link
          href="/artists"
          aria-current={artistsActive ? "page" : undefined}
          className={`font-sans text-[13px] leading-[94%] font-bold tracking-[-0.5px] sm:text-[15px] ${
            artistsActive
              ? "underline decoration-2 underline-offset-[3px]"
              : "no-underline"
          }`}
        >
          Artists
        </Link>

        <Link
          href="/"
          aria-label="Homepage"
          className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 scale-x-[1.3] flex-col items-center font-sans leading-[0.88] font-bold whitespace-nowrap uppercase"
        >
          <span className="text-[13px] tracking-[0.4px] sm:text-[17px]">The</span>
          <span className="text-[13px] tracking-[0.4px] sm:text-[17px]">Wall Group</span>
        </Link>

        <button
          type="button"
          className="flex items-center gap-[7px] font-sans text-[13px] leading-[94%] font-bold tracking-[-0.5px] sm:text-[15px]"
        >
          <span>Search</span>
          <SearchIcon size={17} />
        </button>
      </div>
    </header>
  );
}

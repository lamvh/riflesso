import Image from "next/image";
import Link from "next/link";

import { SearchIcon } from "./search-icon";

/**
 * Layout box for the wordmark at its largest rendered size, matching the
 * source file's 2233x384 ratio. Declaring the display size rather than the
 * intrinsic size keeps the generated srcset small (128w/256w instead of 3840w).
 */
const WORDMARK_WIDTH = 116;
const WORDMARK_HEIGHT = 20;

/** Fixed masthead carrying the centred Riflesso wordmark. */
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
          aria-label="Riflesso homepage"
          className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center"
        >
          <Image
            src="/riflesso.png"
            alt=""
            width={WORDMARK_WIDTH}
            height={WORDMARK_HEIGHT}
            priority
            className="h-[16px] w-auto sm:h-[20px]"
          />
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

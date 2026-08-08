"use client";

import type { Artist } from "@/data/artists";

type ArtistsListProps = {
  artists: Artist[];
  activeIndex: number;
  onActivate: (index: number) => void;
};

/**
 * Name type is sized against the column width (`cqw`) rather than the viewport,
 * so the list keeps its edge-to-edge look regardless of sidebar/preview widths.
 */
export function ArtistsList({
  artists,
  activeIndex,
  onActivate,
}: ArtistsListProps) {
  return (
    <div className="@container flex h-fit min-w-0 flex-1 self-start pt-10 lg:pt-[240px]">
      <div className="h-fit w-full">
        {artists.map((artist, index) => (
          <div key={artist.name} className="mb-[10px]">
            <a
              href="#"
              onMouseEnter={() => onActivate(index)}
              onClick={(event) => {
                event.preventDefault();
                onActivate(index);
              }}
              className={`block font-sans text-[min(60px,8cqw)] leading-[100%] font-bold tracking-[-0.05em] whitespace-nowrap transition-colors duration-150 ease-out ${
                index === activeIndex ? "text-ink" : "text-muted"
              }`}
            >
              {artist.name}
              <span className="ml-[10px] font-serif text-[min(32px,4.3cqw)] leading-[95%] font-normal tracking-[-0.5px]">
                {artist.category}
              </span>
            </a>
          </div>
        ))}

        {artists.length === 0 && (
          <p className="font-serif text-[32px] leading-[95%] tracking-[-0.5px] text-subtle">
            No artists found.
          </p>
        )}
      </div>
    </div>
  );
}

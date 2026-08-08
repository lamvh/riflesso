"use client";

import { useDragScroll } from "@/hooks/use-drag-scroll";
import type { MediaItem } from "@/lib/media-item";

import { MediaCard } from "./media-card";
import { SectionHeading } from "./section-heading";

/** Scrollbars are hidden; the rail is driven by wheel, touch, or click-drag. */
const HIDE_SCROLLBAR = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

type MediaRailProps = {
  heading: string;
  items: MediaItem[];
};

export function MediaRail({ heading, items }: MediaRailProps) {
  const railRef = useDragScroll<HTMLDivElement>();

  return (
    <div className="pt-[70px]">
      <SectionHeading>{heading}</SectionHeading>
      <div
        ref={railRef}
        className={`flex cursor-grab gap-5 overflow-x-auto px-5 pb-5 ${HIDE_SCROLLBAR}`}
      >
        {items.map((item, index) => (
          <MediaCard key={`${item.src}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
}

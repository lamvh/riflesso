"use client";

import { useDragScroll } from "@/hooks/use-drag-scroll";
import type { MediaItem } from "@/lib/media-item";

import { MediaCard } from "./media-card";
import { SectionHeading } from "./section-heading";
import { useOpenWork } from "./work-detail-context";

/** Scrollbars are hidden; the rail is driven by wheel, touch, or click-drag. */
const HIDE_SCROLLBAR = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

type MediaRailProps = {
  heading: string;
  items: MediaItem[];
  /**
   * Singular rail label carried into the work detail. Rails that pass one open
   * the gallery on click; New Signs omits it and its cards link to the artist
   * directory instead, as in the design.
   */
  category?: string;
};

export function MediaRail({ heading, items, category }: MediaRailProps) {
  const railRef = useDragScroll<HTMLDivElement>();
  const openWork = useOpenWork();
  const section = category ? { heading, category, items } : null;

  return (
    <div className="pt-[70px]">
      <SectionHeading>{heading}</SectionHeading>
      <div
        ref={railRef}
        className={`flex cursor-grab gap-5 overflow-x-auto px-5 pb-5 ${HIDE_SCROLLBAR}`}
      >
        {items.map((item, index) => (
          <MediaCard
            key={`${item.src}-${index}`}
            item={item}
            onOpen={section ? () => openWork(item, section) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

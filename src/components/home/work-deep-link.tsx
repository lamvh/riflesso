"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import type { MediaItem } from "@/lib/media-item";
import type { MediaSection } from "@/lib/work-detail";

import { useOpenWork } from "./work-detail-context";

export type DeepLinkWork = { id: string; item: MediaItem; section: MediaSection };

/**
 * `/?work=<album id>` opens that album's gallery, as if its card were clicked
 * — the masthead Search links here. The parameter is then dropped from the
 * address so closing the gallery leaves a clean homepage URL.
 *
 * Reads the query string, so it sits under its own Suspense boundary and the
 * rest of the homepage stays static.
 */
export function WorkDeepLink({ works }: { works: DeepLinkWork[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const openWork = useOpenWork();
  const id = params.get("work");

  useEffect(() => {
    if (!id) return;
    const work = works.find((entry) => entry.id === id);
    if (work) {
      /* Prefer the card object from its own rail so the gallery's neighbours line up. */
      const item = work.section.items.find((candidate) => candidate.albumId === id) ?? work.item;
      openWork(item, work.section);
    }
    router.replace(pathname, { scroll: false });
  }, [id, works, openWork, router, pathname]);

  return null;
}

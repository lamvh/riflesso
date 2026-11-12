"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * `/artists?artist=<name>` hands that name to the directory, which brings the
 * artist into view — the masthead Search links here. Under its own Suspense
 * boundary so the directory itself stays static.
 */
export function ArtistDeepLink({ onArtist }: { onArtist: (name: string) => void }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const name = params.get("artist");

  useEffect(() => {
    if (!name) return;
    onArtist(name);
    router.replace(pathname, { scroll: false });
  }, [name, onArtist, router, pathname]);

  return null;
}

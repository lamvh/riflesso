"use client";

import type { ReactNode } from "react";

/**
 * The design's dashed upload tile.
 *
 * There is no storage behind the dashboard, so the picked file becomes an
 * object URL and previews for as long as the tab lives. That is the honest
 * shape of an upload here: the editor sees the real picture immediately, and
 * nothing pretends it was stored anywhere.
 */
export function ImagePickButton({
  onPick,
  className,
  children,
}: {
  onPick: (url: string) => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <label className={`${className} cursor-pointer`}>
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onPick(URL.createObjectURL(file));
          event.target.value = "";
        }}
      />
      {children}
    </label>
  );
}

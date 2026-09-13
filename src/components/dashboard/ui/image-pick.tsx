"use client";

import type { ReactNode } from "react";

/**
 * The design's dashed upload tile.
 *
 * Storage is not connected yet, so the picked file becomes an object URL and
 * previews for as long as the tab lives. Publishing refuses `blob:` addresses,
 * so nothing pretends the file was stored anywhere — the editor pastes a real
 * image address next to this button to publish.
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

"use client";

import { useState } from "react";

import { MediaLibraryDialog } from "./media-library-dialog";

/*
 * "Choose from library": reuse a file already stored on R2 instead of
 * uploading it again. Opens a dialog listing the bucket (same listing as the
 * Media screen); files can also be dropped or uploaded straight into it.
 * With `onPick` one click hands back one URL, exactly as an upload would;
 * with `onPickMany` files are ticked and handed back together, in the order
 * they were ticked.
 */
export function MediaLibraryButton({
  onPick,
  onPickMany,
  className,
  children = "Choose from library",
  videos = false,
}: {
  onPick?: (url: string) => void;
  onPickMany?: (urls: string[]) => void;
  className: string;
  children?: React.ReactNode;
  /** Also list mp4/webm files (album shots). */
  videos?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={`${className} cursor-pointer`} onClick={() => setOpen(true)}>
        {children}
      </button>
      {open && (
        <MediaLibraryDialog
          videos={videos}
          multiple={Boolean(onPickMany)}
          onClose={() => setOpen(false)}
          onPick={(urls) => {
            setOpen(false);
            if (onPickMany) onPickMany(urls);
            else if (urls[0]) onPick?.(urls[0]);
          }}
        />
      )}
    </>
  );
}

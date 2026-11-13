"use client";

import type { ReactNode } from "react";

import { acceptedFiles, uploadingLabel, useMediaUpload, type UploadedFile } from "./use-media-upload";

/**
 * A file picker dressed as a button. Uploads go to R2 (see useMediaUpload).
 * With `multiple`, several files can be picked at once: `onUploaded` runs for
 * each as soon as it is stored, `onUploadedAll` once the batch is through.
 */
export function UploadButton({
  onUploaded,
  onUploadedAll,
  className,
  children,
  accept = "image/*",
  multiple = false,
}: {
  onUploaded?: (url: string) => void;
  onUploadedAll?: (files: UploadedFile[]) => void;
  className: string;
  children: ReactNode;
  accept?: string;
  multiple?: boolean;
}) {
  const { upload, busy, progress } = useMediaUpload();

  return (
    <label
      aria-busy={busy}
      className={`${className} ${busy ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={busy}
        className="sr-only"
        onChange={async (event) => {
          /* The picker's own filter can be bypassed ("All files"), so check again. */
          const files = acceptedFiles(event.target.files, accept);
          event.target.value = "";
          if (files.length === 0) return;
          const stored = await upload(multiple ? files : files.slice(0, 1), (file) => onUploaded?.(file.url));
          if (stored.length) onUploadedAll?.(stored);
        }}
      />
      {busy ? uploadingLabel(progress) : children}
    </label>
  );
}

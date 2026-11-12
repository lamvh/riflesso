"use client";

import type { ReactNode } from "react";

import { useMediaUpload } from "./use-media-upload";

/** A file picker dressed as a button. Uploads go to R2 (see useMediaUpload). */
export function UploadButton({
  onUploaded,
  className,
  children,
  accept = "image/*",
}: {
  onUploaded: (url: string) => void;
  className: string;
  children: ReactNode;
  accept?: string;
}) {
  const { upload, busy } = useMediaUpload();

  return (
    <label
      aria-busy={busy}
      className={`${className} ${busy ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
    >
      <input
        type="file"
        accept={accept}
        disabled={busy}
        className="sr-only"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          const [url] = await upload([file]);
          if (url) onUploaded(url);
        }}
      />
      {busy ? "Uploading…" : children}
    </label>
  );
}

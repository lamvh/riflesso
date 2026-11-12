"use client";

import { useRef, useState, type DragEvent, type ReactNode } from "react";

import { UploadIcon } from "./icons";
import { acceptedFiles, useMediaUpload } from "./use-media-upload";

/**
 * Drop files from the desktop onto whatever this wraps. While a file is held
 * over it, an outline and a label say what letting go will do; while it
 * uploads, the area dims. `multiple` passes every accepted file, otherwise the
 * first.
 */
export function MediaDropZone({
  onUploaded,
  accept = "image/*",
  multiple = false,
  label = "Drop to upload",
  className = "",
  children,
}: {
  onUploaded: (urls: string[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  const { upload, busy } = useMediaUpload();
  const [over, setOver] = useState(false);
  /* dragenter/leave fire for every child; count them to know when we left. */
  const depth = useRef(0);

  const carriesFiles = (event: DragEvent) => event.dataTransfer.types.includes("Files");

  return (
    <div
      className={`relative ${className}`}
      aria-busy={busy}
      onDragEnter={(event) => {
        if (!carriesFiles(event)) return;
        event.preventDefault();
        depth.current += 1;
        setOver(true);
      }}
      onDragOver={(event) => {
        if (!carriesFiles(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setOver(false);
      }}
      onDrop={async (event) => {
        if (!carriesFiles(event)) return;
        event.preventDefault();
        depth.current = 0;
        setOver(false);
        const files = acceptedFiles(event.dataTransfer.files, accept);
        if (files.length === 0 || busy) return;
        const urls = await upload(multiple ? files : files.slice(0, 1));
        if (urls.length) onUploaded(urls);
      }}
    >
      {children}
      {(over || busy) && (
        <div
          className={`pointer-events-none absolute inset-0 z-[3] flex items-center justify-center rounded-[inherit] font-sans text-[13px] font-bold ${
            busy
              ? "bg-paper/75 text-graphite"
              : "bg-paper/85 text-ink outline-2 outline-offset-[-2px] outline-ink outline-dashed"
          }`}
        >
          <span className="flex items-center gap-[6px]">
            {!busy && <UploadIcon size={14} />}
            {busy ? "Uploading…" : label}
          </span>
        </div>
      )}
    </div>
  );
}

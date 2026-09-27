"use client";

import { useState, type ReactNode } from "react";

import { useAdmin } from "../admin-store";

/**
 * Sends the picked file to R2 and hands back its address. Pictures are resized
 * and re-encoded on the way, so the toast reports what the file became.
 */

type UploadResult = {
  url?: string;
  bytes?: number;
  originalBytes?: number;
  error?: string;
};

const size = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)}MB`
    : `${Math.max(1, Math.round(bytes / 1024))}KB`;

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
  const { dispatch } = useAdmin();
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/media/upload", { method: "POST", body });
      const result = (await response.json()) as UploadResult;

      if (!response.ok || !result.url) {
        dispatch({
          type: "toast",
          message: result.error ?? "Upload failed. Try again.",
          tone: "error",
        });
        return;
      }

      onUploaded(result.url);
      const saved =
        result.originalBytes && result.bytes && result.bytes < result.originalBytes
          ? `Uploaded, ${size(result.originalBytes)} down to ${size(result.bytes)}`
          : "Uploaded";
      dispatch({ type: "toast", message: saved });
    } catch {
      dispatch({
        type: "toast",
        message: "Upload failed. Check the connection and try again.",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  };

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
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void upload(file);
        }}
      />
      {busy ? "Uploading…" : children}
    </label>
  );
}

"use client";

import { useState } from "react";

import { useAdmin } from "../admin-store";

/**
 * Sends a picked or dropped file to R2 and hands back its address. Pictures
 * are resized and re-encoded on the way, so the toast reports what the file
 * became. Shared by the upload button and the drop zones.
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

export function useMediaUpload() {
  const { dispatch } = useAdmin();
  const [busy, setBusy] = useState(false);

  /** Upload one file; resolves to its address, or null after toasting why not. */
  const uploadOne = async (file: File): Promise<{ url: string; note: string } | null> => {
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/media/upload", { method: "POST", body });
      const result = (await response.json()) as UploadResult;
      if (!response.ok || !result.url) {
        dispatch({ type: "toast", message: result.error ?? "Upload failed. Try again.", tone: "error" });
        return null;
      }
      const note =
        result.originalBytes && result.bytes && result.bytes < result.originalBytes
          ? `${size(result.originalBytes)} down to ${size(result.bytes)}`
          : "";
      return { url: result.url, note };
    } catch {
      dispatch({ type: "toast", message: "Upload failed. Check the connection and try again.", tone: "error" });
      return null;
    }
  };

  /** Upload files one after another; returns the addresses that made it. */
  const upload = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];
    setBusy(true);
    try {
      const urls: string[] = [];
      let lastNote = "";
      for (const file of files) {
        const done = await uploadOne(file);
        if (done) {
          urls.push(done.url);
          lastNote = done.note;
        }
      }
      if (urls.length > 0) {
        dispatch({
          type: "toast",
          message:
            files.length === 1
              ? lastNote
                ? `Uploaded, ${lastNote}`
                : "Uploaded"
              : `Uploaded ${urls.length} of ${files.length} files`,
        });
      }
      return urls;
    } finally {
      setBusy(false);
    }
  };

  return { upload, busy };
}

/** Files from a drop that match an `accept` list such as "image/*,video/mp4". */
export function acceptedFiles(list: FileList | null, accept: string): File[] {
  const rules = accept.split(",").map((rule) => rule.trim()).filter(Boolean);
  return [...(list ?? [])].filter((file) =>
    rules.some((rule) =>
      rule.endsWith("/*") ? file.type.startsWith(rule.slice(0, -1)) : file.type === rule,
    ),
  );
}

"use client";

import { useState } from "react";

import { appendCompression } from "@/lib/media/upload-compression";

import { useAdmin } from "../admin-store";
import { currentUploadCompression } from "../use-upload-compression";

/**
 * Sends picked or dropped files to R2 and hands back their addresses. Pictures
 * are resized and re-encoded on the way, so the toast reports what the file
 * became. Shared by the upload buttons and the drop zones.
 */

type UploadResult = {
  url?: string;
  key?: string;
  bytes?: number;
  originalBytes?: number;
  error?: string;
};

/** One stored file: its public address and its object key in the bucket. */
export type UploadedFile = { url: string; key: string };

/** How far a batch has got, for "Uploading 2 of 5…". */
export type UploadProgress = { done: number; total: number } | null;

const size = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)}MB`
    : `${Math.max(1, Math.round(bytes / 1024))}KB`;

/** Button/overlay text while a batch runs. */
export const uploadingLabel = (progress: UploadProgress) =>
  progress && progress.total > 1 ? `Uploading ${Math.min(progress.done + 1, progress.total)} of ${progress.total}…` : "Uploading…";

export function useMediaUpload() {
  const { dispatch } = useAdmin();
  const [progress, setProgress] = useState<UploadProgress>(null);

  /** Upload one file; resolves to where it went, or null after toasting why not. */
  const uploadOne = async (file: File): Promise<(UploadedFile & { note: string }) | null> => {
    try {
      const body = new FormData();
      body.append("file", file);
      /* Read per file, so a change mid-batch applies to the files still to go. */
      appendCompression(body, currentUploadCompression());
      const response = await fetch("/api/media/upload", { method: "POST", body });
      const result = (await response.json()) as UploadResult;
      if (!response.ok || !result.url) {
        dispatch({ type: "toast", message: `${file.name}: ${result.error ?? "Upload failed. Try again."}`, tone: "error" });
        return null;
      }
      const note =
        result.originalBytes && result.bytes && result.bytes < result.originalBytes
          ? `${size(result.originalBytes)} down to ${size(result.bytes)}`
          : "";
      return { url: result.url, key: result.key ?? "", note };
    } catch {
      dispatch({ type: "toast", message: "Upload failed. Check the connection and try again.", tone: "error" });
      return null;
    }
  };

  /**
   * Upload files one after another. `onEach` hears about every file the moment
   * it is stored, so a long batch fills in as it goes; the promise resolves to
   * every file that made it.
   */
  const upload = async (files: File[], onEach?: (file: UploadedFile) => void): Promise<UploadedFile[]> => {
    if (files.length === 0) return [];
    setProgress({ done: 0, total: files.length });
    try {
      const stored: UploadedFile[] = [];
      let lastNote = "";
      for (const [index, file] of files.entries()) {
        const done = await uploadOne(file);
        if (done) {
          stored.push({ url: done.url, key: done.key });
          lastNote = done.note;
          onEach?.({ url: done.url, key: done.key });
        }
        setProgress({ done: index + 1, total: files.length });
      }
      if (stored.length > 0) {
        dispatch({
          type: "toast",
          message:
            files.length === 1
              ? lastNote
                ? `Uploaded, ${lastNote}`
                : "Uploaded"
              : `Uploaded ${stored.length} of ${files.length} files`,
        });
      }
      return stored;
    } finally {
      setProgress(null);
    }
  };

  return { upload, busy: progress !== null, progress };
}

/** Files from a drop or picker that match an `accept` list such as "image/*,video/mp4". */
export function acceptedFiles(list: FileList | null, accept: string): File[] {
  const rules = accept.split(",").map((rule) => rule.trim()).filter(Boolean);
  return [...(list ?? [])].filter((file) =>
    rules.some((rule) =>
      rule.endsWith("/*") ? file.type.startsWith(rule.slice(0, -1)) : file.type === rule,
    ),
  );
}

"use client";

import { usePathname } from "next/navigation";

import { endContentPreview } from "@/lib/preview/content-preview-actions";

/**
 * Shown only to the browser that is previewing unsaved dashboard edits, so
 * nobody mistakes the preview for the live site. Exit returns to this page.
 */
export function ContentPreviewBanner() {
  const pathname = usePathname();
  /* The dashboard always shows its own working copy. */
  if (pathname.startsWith("/dashboard")) return null;

  return (
    <div className="fixed inset-x-0 bottom-[16px] z-[100] flex justify-center px-[16px]">
      <form
        action={endContentPreview}
        className="flex items-center gap-[12px] rounded-full bg-black py-[6px] pr-[6px] pl-[16px] font-sans text-[13px] text-white shadow-[0_12px_32px_-6px_rgba(0,0,0,0.45)]"
      >
        <span className="h-[8px] w-[8px] shrink-0 rounded-full bg-[#f0a33a]" aria-hidden="true" />
        <span>Preview of unsaved dashboard edits</span>
        <input type="hidden" name="path" value={pathname} />
        <button
          type="submit"
          className="cursor-pointer rounded-full bg-white px-[12px] py-[6px] font-medium text-black transition-opacity hover:opacity-85"
        >
          Exit preview
        </button>
      </form>
    </div>
  );
}

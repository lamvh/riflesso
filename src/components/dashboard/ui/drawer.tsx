"use client";

import { useEffect, type ReactNode } from "react";

/**
 * The right-hand editing drawer over a scrim. Escape closes it, the same way
 * the work detail overlay on the public site does.
 */
export function Drawer({
  title,
  width,
  onClose,
  children,
}: {
  title: string;
  width: number;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-20 flex justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/35"
      />

      <div
        role="dialog"
        aria-label={title}
        style={{ width: `${width}px` }}
        className="relative h-full max-w-[94vw] overflow-y-auto border-l border-ink bg-paper px-[28px] pt-[26px] pb-[40px]"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-sans text-[26px] leading-[95%] font-bold tracking-[-1.4px]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer font-sans text-[18px] leading-none font-bold"
          >
            ✕
          </button>
        </div>

        <div className="mt-[24px] flex flex-col gap-[22px]">{children}</div>
      </div>
    </div>
  );
}

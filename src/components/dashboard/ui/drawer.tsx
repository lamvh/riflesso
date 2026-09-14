"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { IconButton } from "./controls";
import { CrossIcon } from "./icons";

/**
 * The right-hand editing drawer. Its title and actions stay pinned while the
 * form scrolls, Escape closes it, and focus moves into it on open.
 */
export function Drawer({
  title,
  description,
  width,
  onClose,
  footer,
  children,
}: {
  title: string;
  description?: string;
  width: number;
  onClose: () => void;
  footer: ReactNode;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.focus();
    /* The page behind stays put while the drawer is open. */
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/30 motion-safe:animate-scrim-in"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{ width: `${width}px` }}
        className="relative flex h-full max-w-full flex-col bg-paper shadow-[-16px_0_48px_rgba(0,0,0,0.14)] outline-none motion-safe:animate-drawer-in"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-[24px] py-[18px]">
          <div className="min-w-0">
            <h2 className="truncate font-sans text-[20px] leading-[120%] font-bold tracking-[-0.6px]">
              {title}
            </h2>
            {description && (
              <p className="mt-[4px] font-sans text-[13px] leading-[140%] text-graphite">
                {description}
              </p>
            )}
          </div>
          <IconButton label="Close" onClick={onClose}>
            <CrossIcon size={16} />
          </IconButton>
        </header>

        <div className="flex-1 overflow-y-auto px-[24px] py-[22px]">
          <div className="flex flex-col gap-[24px]">{children}</div>
        </div>

        <footer className="flex items-center gap-[8px] border-t border-line px-[24px] py-[14px]">
          {footer}
        </footer>
      </div>
    </div>
  );
}

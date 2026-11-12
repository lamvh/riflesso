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
        className="absolute inset-0 h-full w-full cursor-default bg-[#1c1810]/35 backdrop-blur-[2px] motion-safe:animate-scrim-in"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{ width: `${width}px` }}
        className="relative flex h-full max-w-full flex-col overflow-hidden bg-paper shadow-[-16px_0_48px_rgba(28,24,16,0.18)] outline-none motion-safe:animate-drawer-in sm:my-[8px] sm:mr-[8px] sm:h-[calc(100%-16px)] sm:max-w-[calc(100%-16px)] sm:rounded-[12px]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-[24px] py-[18px]">
          <div className="min-w-0">
            <h2 className="truncate font-serif text-[24px] leading-[115%] tracking-[-0.3px]">
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

        <footer className="flex items-center gap-[8px] border-t border-line bg-hover px-[24px] py-[14px]">
          {footer}
        </footer>
      </div>
    </div>
  );
}

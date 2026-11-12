"use client";

import { AlbumDrawer } from "./album-drawer";
import { ArtistDrawer } from "./artist-drawer";
import { useAdmin } from "./admin-store";
import { CommandPalette } from "./command-palette";

/**
 * The drawer and the toast, mounted once above the router outlet: the page
 * header can open a drawer from any screen, so neither can belong to one.
 */
export function AdminChrome() {
  const { state, dispatch } = useAdmin();
  const { drawer, toast, toastTone } = state;
  const error = toastTone === "error";

  return (
    <>
      <CommandPalette />
      {drawer?.kind === "artist" && (
        <ArtistDrawer
          draft={drawer.draft}
          index={drawer.index}
          categories={state.cats}
          dispatch={dispatch}
        />
      )}

      {drawer?.kind === "album" && (
        <AlbumDrawer draft={drawer.draft} index={drawer.index} dispatch={dispatch} />
      )}

      {toast && (
        <div className="admin-toast pointer-events-none fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-50 lg:bottom-[20px] flex justify-center px-[16px] lg:pl-[232px]">
          <p
            role={error ? "alert" : "status"}
            className={`pointer-events-auto max-w-[560px] rounded-[8px] px-[16px] py-[11px] font-sans text-[14px] leading-[140%] font-medium shadow-[0_12px_32px_-6px_rgba(28,24,16,0.35)] ${
              error ? "border border-danger/25 bg-danger-soft text-danger" : "bg-ink text-paper"
            }`}
          >
            {toast}
          </p>
        </div>
      )}
    </>
  );
}

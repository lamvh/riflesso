"use client";

import { AlbumDrawer } from "./album-drawer";
import { ArtistDrawer } from "./artist-drawer";
import { useAdmin } from "./admin-store";

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
        <div className="pointer-events-none fixed inset-x-0 bottom-[20px] z-50 flex justify-center px-[16px] lg:pl-[232px]">
          <p
            role={error ? "alert" : "status"}
            className={`pointer-events-auto max-w-[560px] rounded-[2px] px-[14px] py-[10px] font-sans text-[14px] leading-[140%] font-medium shadow-[0_8px_28px_rgba(0,0,0,0.18)] ${
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

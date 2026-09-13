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
  const { drawer, toast } = state;

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
        <p
          role="status"
          className="fixed bottom-[24px] left-[260px] z-30 bg-ink px-[16px] py-[12px] font-sans text-[13px] leading-none font-bold tracking-[-0.4px] text-paper"
        >
          {toast}
        </p>
      )}
    </>
  );
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

import {
  pickSiteContent,
  type LoadedSiteContent,
  type SiteContent,
  type SiteContentSource,
} from "@/lib/content/site-content-types";
import {
  countChanges,
  totalChanges,
  type ChangeCounts,
} from "@/lib/dashboard/admin-changes";
import { adminReducer, type AdminAction } from "@/lib/dashboard/admin-reducer";
import { initialAdminState, type AdminState } from "@/lib/dashboard/admin-state";
import type { Activity } from "@/lib/dashboard/admin-types";

/**
 * Edits happen in the browser and reach the site only when published. The
 * working draft survives a reload through sessionStorage, pinned to the
 * database revision it was made against.
 */
const DRAFT_KEY = "riflesso.admin.draft";

/** How long a toast stays up. Errors wait long enough to be read and acted on. */
const TOAST_MS = { info: 2400, error: 6000 };

type StoredDraft = {
  revision: number;
  source: SiteContentSource;
  content: SiteContent;
  activity: Activity;
};

function readDraft(): StoredDraft | null {
  try {
    const stored = sessionStorage.getItem(DRAFT_KEY);
    return stored ? (JSON.parse(stored) as StoredDraft) : null;
  } catch {
    return null;
  }
}

type AdminContextValue = {
  state: AdminState;
  dispatch: Dispatch<AdminAction>;
  /** Unpublished changes per area of the dashboard. */
  changes: ChangeCounts;
  /** Anything differs from what was loaded or last published. */
  dirty: boolean;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({
  initial,
  children,
}: {
  initial: LoadedSiteContent;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(adminReducer, initial, initialAdminState);

  /* First paint renders the server's content so server and client agree. A
     stored draft is layered on only if it was made against the same revision:
     restoring an older one would quietly undo someone else's publish. */
  useEffect(() => {
    const draft = readDraft();
    if (draft && draft.revision === initial.revision && draft.source === initial.source) {
      dispatch({ type: "restore", content: draft.content, activity: draft.activity });
      return;
    }
    sessionStorage.removeItem(DRAFT_KEY);
    dispatch({ type: "hydrated" });
  }, [initial.revision, initial.source]);

  useEffect(() => {
    /* Writing before the read lands would overwrite the draft. */
    if (!state.hydrated) return;
    const draft: StoredDraft = {
      revision: state.revision,
      source: state.source,
      content: pickSiteContent(state),
      activity: state.activity,
    };
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* Over quota: the draft simply does not survive a reload. */
    }
  }, [state]);

  useEffect(() => {
    if (!state.toast) return;
    const timer = setTimeout(
      () => dispatch({ type: "toast", message: "" }),
      TOAST_MS[state.toastTone],
    );
    return () => clearTimeout(timer);
  }, [state.toast, state.toastTone]);

  const { settings, contacts, artists, albums, cats, slides, blocks, baseline } = state;
  const published = useMemo(() => JSON.parse(baseline) as SiteContent, [baseline]);
  const changes = useMemo(
    () =>
      countChanges({ settings, contacts, artists, albums, cats, slides, blocks }, published),
    [settings, contacts, artists, albums, cats, slides, blocks, published],
  );
  const dirty = totalChanges(changes) > 0;

  /* The draft survives a reload, but not a closed tab. */
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const value = useMemo(() => ({ state, dispatch, changes, dirty }), [state, changes, dirty]);

  return <AdminContext value={value}>{children}</AdminContext>;
}

export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin must be used inside <AdminProvider>");
  return value;
}

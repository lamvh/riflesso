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
import { adminReducer, type AdminAction } from "@/lib/dashboard/admin-reducer";
import {
  initialAdminState,
  serializeContent,
  type AdminState,
} from "@/lib/dashboard/admin-state";
import type { Activity } from "@/lib/dashboard/admin-types";

/**
 * Edits happen in the browser and reach the site only when published. The
 * working draft survives a reload through sessionStorage, pinned to the
 * database revision it was made against.
 */
const DRAFT_KEY = "riflesso.admin.draft";

/** How long a toast stays up, matching the design's own timing. */
const TOAST_MS = 2200;

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
  /** Content differs from what was loaded or last published. */
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
    const timer = setTimeout(() => dispatch({ type: "toast", message: "" }), TOAST_MS);
    return () => clearTimeout(timer);
  }, [state.toast]);

  const { settings, contacts, artists, albums, cats, slides, blocks, baseline } = state;
  const dirty = useMemo(
    () =>
      serializeContent({ settings, contacts, artists, albums, cats, slides, blocks }) !==
      baseline,
    [settings, contacts, artists, albums, cats, slides, blocks, baseline],
  );

  /* The draft survives a reload, but not a closed tab. */
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const value = useMemo(() => ({ state, dispatch, dirty }), [state, dirty]);

  return <AdminContext value={value}>{children}</AdminContext>;
}

export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin must be used inside <AdminProvider>");
  return value;
}

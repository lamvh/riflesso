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

import { adminReducer, type AdminAction } from "@/lib/dashboard/admin-reducer";
import { initialAdminState, type AdminState } from "@/lib/dashboard/admin-state";

/**
 * Edits live in this browser only. The draft survives a reload through
 * sessionStorage so a refresh mid-edit is not punished, but nothing is written
 * back to `src/data/*` — persistence is a later, separate decision.
 */
const DRAFT_KEY = "riflesso.admin.draft";

/** How long a toast stays up, matching the design's own timing. */
const TOAST_MS = 2200;

type AdminContextValue = { state: AdminState; dispatch: Dispatch<AdminAction> };

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, undefined, initialAdminState);

  /* First paint renders the seeded content so server and client agree; a stored
     draft is layered on immediately after. */
  useEffect(() => {
    const stored = sessionStorage.getItem(DRAFT_KEY);
    if (!stored) {
      dispatch({ type: "hydrated" });
      return;
    }
    try {
      dispatch({ type: "restore", state: JSON.parse(stored) as AdminState });
    } catch {
      sessionStorage.removeItem(DRAFT_KEY);
      dispatch({ type: "hydrated" });
    }
  }, []);

  useEffect(() => {
    /* Writing before the read lands would overwrite the draft with the seed. */
    if (!state.hydrated) return;
    /* The toast and the open drawer are session furniture, not content. */
    const { toast, drawer, hydrated, ...content } = state;
    void toast;
    void drawer;
    void hydrated;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(content));
  }, [state]);

  useEffect(() => {
    if (!state.toast) return;
    const timer = setTimeout(() => dispatch({ type: "toast", message: "" }), TOAST_MS);
    return () => clearTimeout(timer);
  }, [state.toast]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AdminContext value={value}>{children}</AdminContext>;
}

export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin must be used inside <AdminProvider>");
  return value;
}

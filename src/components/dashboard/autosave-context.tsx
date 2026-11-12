"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useAutosave, type SaveStatus } from "./use-autosave";

type AutosaveValue = { status: SaveStatus; retry: () => void };

const AutosaveContext = createContext<AutosaveValue | null>(null);

/**
 * Runs the one autosave loop for the dashboard. Every save-status readout —
 * the desktop header and the mobile top bar — reads it from here, so showing
 * the status twice never means saving twice.
 */
export function AutosaveProvider({ children }: { children: ReactNode }) {
  const value = useAutosave();
  return <AutosaveContext value={value}>{children}</AutosaveContext>;
}

export function useAutosaveStatus() {
  const value = useContext(AutosaveContext);
  if (!value) throw new Error("useAutosaveStatus must be used inside <AutosaveProvider>");
  return value;
}

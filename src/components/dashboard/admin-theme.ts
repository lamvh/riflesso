"use client";

import { useEffect, useSyncExternalStore } from "react";

import { THEME_KEY } from "./admin-theme-key";

/*
 * The dashboard's colour theme: light, dark, or follow the system. The choice
 * is kept in this browser only; the resolved theme lives on <html> as
 * `data-admin-theme`, which globals.css reads.
 */

export type AdminThemeMode = "light" | "dark" | "system";

const CHANGE = "riflesso:admin-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function readMode(): AdminThemeMode {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

const resolve = (mode: AdminThemeMode) =>
  mode === "system" ? (window.matchMedia(DARK_QUERY).matches ? "dark" : "light") : mode;

const subscribe = (listener: () => void) => {
  window.addEventListener(CHANGE, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGE, listener);
    window.removeEventListener("storage", listener);
  };
};

export function setAdminThemeMode(mode: AdminThemeMode) {
  try {
    if (mode === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, mode);
  } catch {
    /* Storage blocked: the choice lasts until reload. */
  }
  document.documentElement.dataset.adminTheme = resolve(mode);
  window.dispatchEvent(new Event(CHANGE));
}

/**
 * Current mode, kept applied to <html> — including when the system theme
 * flips while on "system". Leaving the dashboard clears the attribute.
 */
export function useAdminTheme() {
  const mode = useSyncExternalStore(subscribe, readMode, () => "system" as AdminThemeMode);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      root.dataset.adminTheme = resolve(mode);
    };
    apply();
    const query = window.matchMedia(DARK_QUERY);
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [mode]);

  useEffect(
    () => () => {
      delete document.documentElement.dataset.adminTheme;
    },
    [],
  );

  return { mode, setMode: setAdminThemeMode };
}

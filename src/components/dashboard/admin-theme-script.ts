import { THEME_KEY } from "./admin-theme-key";

/**
 * Runs inline before the dashboard paints, so a dark-theme reload never
 * flashes light. Mirrors `resolve` in admin-theme.ts.
 */
export const ADMIN_THEME_SCRIPT = `(function(){try{var m=localStorage.getItem(${JSON.stringify(THEME_KEY)});var d=m==="dark"||(m!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.adminTheme=d?"dark":"light"}catch(e){}})()`;

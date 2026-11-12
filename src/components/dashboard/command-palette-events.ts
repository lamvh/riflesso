/**
 * The palette lives once in the dashboard chrome; anything can ask it to open
 * — the header's search button, a shortcut — without sharing state.
 */
export const COMMAND_PALETTE_EVENT = "riflesso:command-palette";

export const openCommandPalette = () => window.dispatchEvent(new Event(COMMAND_PALETTE_EVENT));

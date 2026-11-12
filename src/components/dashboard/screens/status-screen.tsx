"use client";

import { ConnectionsStatusPanel } from "../connections-status-panel";

/**
 * Health of the services the site runs on. Kept apart from Site settings:
 * settings are edited, this is only read and re-checked.
 */
export function StatusScreen() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-[16px]">
      <ConnectionsStatusPanel />
    </div>
  );
}

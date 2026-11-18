import type { ReactNode } from "react";

import type { View } from "@/lib/dashboard/admin-views";

import {
  AlbumIcon,
  ClockIcon,
  DocumentIcon,
  GearIcon,
  HomeIcon,
  OverviewIcon,
  PersonIcon,
  PulseIcon,
  StackIcon,
  TagIcon,
} from "./ui/icons";

/* Navigation shared by the desktop sidebar and the mobile tab bar. */

/** Library holds the records; Site holds how they are arranged and framed. */
export const GROUPS: { label?: string; views: View[] }[] = [
  { views: ["overview"] },
  { label: "Library", views: ["artists", "albums", "cats", "media"] },
  { label: "Site", views: ["home", "policy", "settings"] },
  { label: "System", views: ["history", "status"] },
];

export const VIEW_ICON: Record<View, (props: { size?: number }) => ReactNode> = {
  overview: OverviewIcon,
  artists: PersonIcon,
  albums: AlbumIcon,
  cats: TagIcon,
  media: StackIcon,
  home: HomeIcon,
  policy: DocumentIcon,
  settings: GearIcon,
  history: ClockIcon,
  status: PulseIcon,
};

/** Sidebar / tab-bar dot for the worst service state. */
export const HEALTH_DOT = {
  ok: ["bg-live", "All services connected"],
  unconfigured: ["bg-graphite", "Some services are not configured"],
  warning: ["bg-draft", "A service needs attention"],
  error: ["bg-danger", "A service is down"],
} as const;

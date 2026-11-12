import type { ReactNode } from "react";

type IconProps = { size?: number; className?: string };

/** One 16-unit grid and one stroke weight, so every icon sits at the same visual size. */
function Svg({ size = 14, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export const ArrowUpIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M8 13V3M4 7l4-4 4 4" />
  </Svg>
);

export const ArrowDownIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M8 3v10M4 9l4 4 4-4" />
  </Svg>
);

export const CrossIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </Svg>
);

export const ChevronDownIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 6l4 4 4-4" />
  </Svg>
);

export const PlusIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M8 3v10M3 8h10" />
  </Svg>
);

export const EyeIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8s-2.4 4.5-6.5 4.5S1.5 8 1.5 8Z" />
    <circle cx="8" cy="8" r="2" />
  </Svg>
);

export const EyeOffIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M6.2 3.8A6.6 6.6 0 0 1 8 3.5c4.1 0 6.5 4.5 6.5 4.5a11 11 0 0 1-1.7 2.2M4.1 4.9C2.4 6.1 1.5 8 1.5 8s2.4 4.5 6.5 4.5c1 0 1.9-.3 2.7-.7" />
    <path d="M2 2l12 12" />
  </Svg>
);

/* Sidebar marks, one per screen, drawn on the same grid as the action icons. */

export const OverviewIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
    <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
  </Svg>
);

export const PersonIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="8" cy="5.5" r="2.6" />
    <path d="M2.8 13.5c.8-2.5 2.8-3.8 5.2-3.8s4.4 1.3 5.2 3.8" />
  </Svg>
);

export const AlbumIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="2.5" y="3.5" width="11" height="9" rx="1.2" />
    <path d="M2.5 10.5l3-2.8 2.6 2.3 2-1.6 3.4 2.8" />
    <circle cx="10.5" cy="6.3" r="0.9" />
  </Svg>
);

export const TagIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M2.5 8.2V3.3a.8.8 0 0 1 .8-.8h4.9l5.3 5.3a.8.8 0 0 1 0 1.1l-4.4 4.4a.8.8 0 0 1-1.1 0Z" />
    <circle cx="5.5" cy="5.5" r="0.9" />
  </Svg>
);

export const StackIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M8 2.5l5.5 2.8L8 8.1 2.5 5.3Z" />
    <path d="M2.5 8l5.5 2.8L13.5 8" />
    <path d="M2.5 10.7l5.5 2.8 5.5-2.8" />
  </Svg>
);

export const HomeIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M2.5 7.2L8 2.8l5.5 4.4" />
    <path d="M4 6.2v7.3h8V6.2" />
    <path d="M6.6 13.5v-3.5h2.8v3.5" />
  </Svg>
);

export const GearIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="8" cy="8" r="2.2" />
    <path d="M8 1.8v1.6M8 12.6v1.6M14.2 8h-1.6M3.4 8H1.8M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1M12.4 12.4l-1.1-1.1M4.7 4.7 3.6 3.6" />
  </Svg>
);

export const ExternalIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M9.5 2.5h4v4M13.5 2.5 7.5 8.5M12 9.5v3a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3" />
  </Svg>
);

export const PulseIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M1.5 8.5h3l1.8-4.5 3.2 8 1.8-3.5h3.2" />
  </Svg>
);

export const PauseIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M5.5 3.5v9M10.5 3.5v9" />
  </Svg>
);

export const PlayIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M5 3.2v9.6L12.8 8Z" />
  </Svg>
);

export const ClockIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="8" cy="8" r="5.8" />
    <path d="M8 4.8V8l2.2 1.5" />
  </Svg>
);

export const SearchMarkIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="7" cy="7" r="4.2" />
    <path d="M10.2 10.2l3.3 3.3" />
  </Svg>
);

export const UploadIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M8 10.5V2.8M4.8 6 8 2.8 11.2 6M2.8 10.5v2a1 1 0 0 0 1 1h8.4a1 1 0 0 0 1-1v-2" />
  </Svg>
);

export const GripIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="6" cy="4" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="10" cy="4" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="6" cy="8" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="10" cy="8" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="6" cy="12" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="10" cy="12" r="0.9" fill="currentColor" stroke="none" />
  </Svg>
);

export const SunIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="8" cy="8" r="2.8" />
    <path d="M8 1.5v1.6M8 12.9v1.6M14.5 8h-1.6M3.1 8H1.5M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1M12.6 12.6l-1.1-1.1M4.5 4.5 3.4 3.4" />
  </Svg>
);

export const MoonIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M13.2 9.6A5.6 5.6 0 1 1 6.4 2.8a4.5 4.5 0 0 0 6.8 6.8Z" />
  </Svg>
);

export const MonitorIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="2" y="2.8" width="12" height="8.4" rx="1.2" />
    <path d="M5.5 13.5h5M8 11.2v2.3" />
  </Svg>
);

export const MenuIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
  </Svg>
);

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

import type { ReactNode } from "react";

export type IconName =
  | "arrow"
  | "menu"
  | "close"
  | "globe"
  | "mail"
  | "phone"
  | "pin"
  | "check"
  | "cube"
  | "leaf"
  | "bars"
  | "nodes"
  | "search"
  | "document"
  | "target"
  | "growth"
  | "bottle"
  | "gear"
  | "drop"
  | "bowl"
  | "sweet"
  | "capsule";

const paths: Record<IconName, ReactNode> = {
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  phone: (
    <path d="M7 3h3l1.5 5-2 1.3a14 14 0 0 0 5.2 5.2l1.3-2 5 1.5v3c0 2.2-1.8 4-4 4C9.3 21 3 14.7 3 7c0-2.2 1.8-4 4-4Z" />
  ),
  pin: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  cube: (
    <>
      <path d="M12 2.75 20.25 7.4v9.2L12 21.25 3.75 16.6V7.4L12 2.75Z" />
      <path d="M4 7.55 12 12.1l8-4.55M12 12.1v9" />
    </>
  ),
  leaf: (
    <>
      <path d="M19.75 4.25C11 4.4 5.4 8.9 5 15.4c-.15 2.5.95 4.2 2.9 4.45 6.65.85 11.6-5.25 11.85-15.6Z" />
      <path d="M4.25 20.25c2.9-4.4 6.55-7.85 11-10.5" />
    </>
  ),
  bars: (
    <>
      <rect x="4" y="13" width="3.75" height="7.25" rx="1" />
      <rect x="10.13" y="8.25" width="3.75" height="12" rx="1" />
      <rect x="16.25" y="3.75" width="3.75" height="16.5" rx="1" />
    </>
  ),
  nodes: (
    <>
      <circle cx="12" cy="5.75" r="2.5" />
      <circle cx="5.5" cy="17.5" r="2.5" />
      <circle cx="18.5" cy="17.5" r="2.5" />
      <path d="m10.75 7.95-4 7.35M13.25 7.95l4 7.35M8 17.5h8" />
    </>
  ),
  search: (
    <>
      <circle cx="14" cy="10" r="6.25" />
      <path d="m9.6 14.4-5.85 5.85" />
    </>
  ),
  document: (
    <>
      <path d="M6 3.25h8.5l4.25 4.25v13.25H6Z" />
      <path d="M14.25 3.5v4.25h4.25M9.25 11.5h6.5M9.25 14.75h6.5M9.25 18h4" />
    </>
  ),
  target: (
    <>
      <circle cx="11" cy="13" r="8.25" />
      <circle cx="11" cy="13" r="4.75" />
      <circle cx="11" cy="13" r="1.25" />
      <path d="m11 13 8.5-8.5M16.75 3.75v3.5h3.5" />
    </>
  ),
  growth: (
    <>
      <rect x="3.75" y="15.5" width="3.5" height="4.75" rx="0.75" />
      <rect x="10.25" y="12.5" width="3.5" height="7.75" rx="0.75" />
      <rect x="16.75" y="9.5" width="3.5" height="10.75" rx="0.75" />
      <path d="M4 11.25 19.25 3.75M14.5 3.5h5v5" />
    </>
  ),
  bottle: (
    <>
      <path d="M5 11.5h5.5v8a1.25 1.25 0 0 1-1.25 1.25h-3A1.25 1.25 0 0 1 5 19.5Z" />
      <path d="M5.75 11.5V9.75h4v1.75" />
      <path d="M15 3.25h3v2.25l1.25 2.25v12a1 1 0 0 1-1 1h-3.5a1 1 0 0 1-1-1v-12L15 5.5Z" />
      <path d="M13.75 10.5h5.5" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.25" />
      <path d="M12 2.75v2.5M12 18.75v2.5M2.75 12h2.5M18.75 12h2.5M5.46 5.46l1.77 1.77M16.77 16.77l1.77 1.77M5.46 18.54l1.77-1.77M16.77 7.23l1.77-1.77" />
      <circle cx="12" cy="12" r="6.75" />
    </>
  ),
  drop: (
    <>
      <path d="M12 3.25c3.6 4.3 6.25 7.7 6.25 10.75a6.25 6.25 0 0 1-12.5 0c0-3.05 2.65-6.45 6.25-10.75Z" />
      <path d="M9 14.5a3 3 0 0 0 2.5 2.75" />
    </>
  ),
  bowl: (
    <>
      <path d="M3.75 11.5h16.5a8.25 8.25 0 0 1-16.5 0Z" />
      <path d="M9 3.75c-.9 1.1.9 2.15 0 3.25M13 3.75c-.9 1.1.9 2.15 0 3.25" />
      <path d="M8 20.25h8" />
    </>
  ),
  sweet: (
    <>
      <path d="M5.5 12.5h13l-1.55 7a1 1 0 0 1-1 .75H8.05a1 1 0 0 1-1-.75Z" />
      <path d="M5.5 12.5a3 3 0 0 1 2.3-2.9 4.35 4.35 0 0 1 8.4 0 3 3 0 0 1 2.3 2.9" />
      <path d="M10.25 12.5l.5 7.75M13.75 12.5l-.5 7.75" />
    </>
  ),
  capsule: (
    <>
      <rect x="3.1" y="8.5" width="17.8" height="7" rx="3.5" transform="rotate(-40 12 12)" />
      <path d="M9.75 9.32 14.25 14.68" />
    </>
  )
};

type IconProps = { name: IconName; className?: string; strokeWidth?: number };

/** Decorative stroke icon; always paired with visible text or an accessible label. */
export function Icon({ name, className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

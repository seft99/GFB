import type { ReactNode } from "react";

export type IconName =
  "arrow" | "menu" | "close" | "globe" | "mail" | "phone" | "pin" | "check" | "cube" | "leaf" | "bars" | "nodes";

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

import type { ReactNode } from "react";
import type { MegaMenuIcon } from "@/src/lib/navigation";

/** Restrained 24px line icons of the mega menu (decorative: hidden from assistive technology). */
const ICONS: Record<MegaMenuIcon, { color: string; paths: ReactNode }> = {
  citrus: {
    color: "#f08a12",
    paths: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="6.2" />
        <path d="M12 5.8v12.4M5.8 12h12.4M7.6 7.6l8.8 8.8M16.4 7.6l-8.8 8.8" />
      </>
    )
  },
  orange: {
    color: "#f08a12",
    paths: (
      <>
        <circle cx="12" cy="13.5" r="7.5" />
        <path d="M12 6c0-1.6 1-2.8 2.8-3.2M12 6c-1.4-1.4-3.3-1.6-4.6-1" />
      </>
    )
  },
  lemon: {
    color: "#e2b400",
    paths: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="5.8" />
        <path d="M12 6.2v11.6M6.2 12h11.6M7.9 7.9l8.2 8.2M16.1 7.9l-8.2 8.2" />
      </>
    )
  },
  grapes: {
    color: "#7a2f8f",
    paths: (
      <>
        <circle cx="9" cy="9.5" r="2.4" />
        <circle cx="15" cy="9.5" r="2.4" />
        <circle cx="12" cy="13.6" r="2.4" />
        <circle cx="7.6" cy="14" r="2.1" />
        <circle cx="16.4" cy="14" r="2.1" />
        <circle cx="12" cy="18.4" r="2.2" />
        <path d="M12 7V3.5M12 5c1.5-1.6 3.4-1.8 5-1.2" />
      </>
    )
  },
  leaf: {
    color: "#3d9a2b",
    paths: <path d="M5 19c0-8 5-13 14-14-.6 9-5.6 14-13 14H5zM5 19l8-8" />
  },
  snowflake: {
    color: "#2563d9",
    paths: (
      <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5M4 10.8l3.4.9-.9 3.4M20 13.2l-3.4-.9.9-3.4M4 13.2l3.4-.9-.9-3.4M20 10.8l-3.4.9.9 3.4" />
    )
  },
  can: {
    color: "#5b6b82",
    paths: (
      <>
        <path d="M7.5 5.5h9l.8 2v10.8l-.8 2.2h-9l-.8-2.2V7.5z" />
        <path d="M6.7 7.5h10.6M6.7 18.3h10.6M10 3.5h4" />
      </>
    )
  },
  bottle: {
    color: "#2d8a6e",
    paths: (
      <path d="M10 3h4v3.5c0 1 2.5 2.2 2.5 5v8.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-8.5c0-2.8 2.5-4 2.5-5zM7.5 13h9" />
    )
  },
  crown: {
    color: "#b58a1b",
    paths: (
      <>
        <ellipse cx="12" cy="10" rx="7.5" ry="3" />
        <path d="M4.5 10v3.5l1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5V10" />
      </>
    )
  },
  label: {
    color: "#2563d9",
    paths: (
      <>
        <path d="M8 3h8v3c0 1.5 2 2.5 2 5v9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-9c0-2.5 2-3.5 2-5z" />
        <path d="M6 12.5h12v5H6z" />
      </>
    )
  },
  sweet: {
    color: "#d9467a",
    paths: <path d="M6 10h12l-1.5 10h-9zM8 10a4 4 0 0 1 8 0M12 6V3.5" />
  },
  beverage: {
    color: "#f08a12",
    paths: <path d="M6.5 4h11l-1.5 16h-8zM7 9h10M14 4l2-2" />
  },
  savoury: {
    color: "#3d9a2b",
    paths: <path d="M3.5 12h17a8.5 8.5 0 0 1-17 0zM8 8c0-1.5 1-2 1-3.5M12 8c0-1.5 1-2 1-3.5M16 8c0-1.5 1-2 1-3.5" />
  },
  food: {
    color: "#3d9a2b",
    paths: <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 1.5-3 4-3 7h3v11" />
  },
  industry: {
    color: "#5b6b82",
    paths: <path d="M3 21V11l5 3V11l5 3V11l5 3V4h3v17zM7 18h2M12 18h2M17 18h2" />
  },
  environment: {
    color: "#2d8a6e",
    paths: <path d="M12 21v-7M12 14c-4 0-7-3-7-8 4 0 7 2.5 7 6M12 14c3.5 0 6-2.5 6-6.5-3.5 0-6 2-6 5.5" />
  },
  pharma: {
    color: "#2563d9",
    paths: <path d="M9.5 3h5v3h-5zM8 6h8v15H8zM12 10v6M9 13h6" />
  }
};

export function MegaMenuIconGlyph({ name }: { name: MegaMenuIcon }) {
  const icon = ICONS[name];
  return (
    <svg
      className="mega-menu__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke={icon.color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {icon.paths}
    </svg>
  );
}

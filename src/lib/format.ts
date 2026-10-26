import type { CSSProperties } from "react";

/** Zero-based index to a two-digit label: 0 → "01". */
export function ordinal(index: number) {
  return String(index + 1).padStart(2, "0");
}

/** Exposes a division accent colour to CSS as `--accent`. */
export function accentStyle(accent: string): CSSProperties {
  return { "--accent": accent } as CSSProperties;
}

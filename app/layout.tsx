import type { ReactNode } from "react";

/**
 * Pass-through root layout. `<html>` lives in `app/[locale]/layout.tsx` so its `lang`
 * matches the route; keeping a static root above it lets `notFound()` resolve to the
 * localized `app/[locale]/not-found.tsx` in production builds.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}

"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { FAMILY_PARAM, notifyFamilyChange } from "@/src/lib/family-url";

/**
 * Same-page links (e.g. a header family link) change the query with a client navigation, which
 * fires no `popstate`; this announces `family` changes from the router to the explorer and the
 * library (src/lib/family-url.ts). Render it inside its own Suspense boundary so the components
 * around it stay in the prerendered HTML.
 */
export function FamilyUrlSync() {
  const family = useSearchParams().get(FAMILY_PARAM);
  const seen = useRef(family);
  useEffect(() => {
    if (family === seen.current) return;
    seen.current = family;
    notifyFamilyChange();
  }, [family]);
  return null;
}

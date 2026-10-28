"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import type { Locale } from "@/src/i18n/config";
import { translatePathname, type SlugTree } from "@/src/i18n/routes";
import { PRESERVED_PARAMS, subscribeFamilyChange } from "@/src/lib/family-url";

/** Library/explorer state of the current URL (`family`, `type`, `q`) that the other language keeps. */
function preservedQuery() {
  const current = new URLSearchParams(window.location.search);
  const kept = new URLSearchParams();
  for (const key of PRESERVED_PARAMS) {
    const value = current.get(key);
    if (value) kept.set(key, value);
  }
  return kept.toString();
}

/**
 * Links to the same page in the other locale, translating localized slugs. The path comes from
 * the route (identical in the server HTML and after hydration); the selected family, type and
 * search of a catalogue page are added in the browser, where they are known.
 * The accessible name starts with the visible code ("ES") so voice control matches it (WCAG 2.5.3).
 */
export function LanguageSwitcher({ target, label, tree }: { target: Locale; label: string; tree: SlugTree }) {
  const pathname = usePathname();
  const query = useSyncExternalStore(subscribeFamilyChange, preservedQuery, () => "");
  const base = translatePathname(pathname, target, tree);
  const href = query ? `${base}${base.includes("?") ? "&" : "?"}${query}` : base;
  return (
    <Link href={href} className="language-link" hrefLang={target} lang={target}>
      <Icon name="globe" />
      <span>{target.toUpperCase()}</span>
      <span className="visually-hidden">: {label}</span>
    </Link>
  );
}

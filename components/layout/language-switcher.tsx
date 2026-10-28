"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import type { Locale } from "@/src/i18n/config";
import { translatePathname, type SlugTree } from "@/src/i18n/routes";

/**
 * Links to the same page in the other locale, translating localized slugs.
 * The accessible name starts with the visible code ("ES") so voice control matches it (WCAG 2.5.3).
 */
export function LanguageSwitcher({ target, label, tree }: { target: Locale; label: string; tree: SlugTree }) {
  const pathname = usePathname();
  const href = translatePathname(pathname, target, tree);
  return (
    <Link href={href} className="language-link" hrefLang={target} lang={target}>
      <Icon name="globe" />
      <span>{target.toUpperCase()}</span>
      <span className="visually-hidden">: {label}</span>
    </Link>
  );
}

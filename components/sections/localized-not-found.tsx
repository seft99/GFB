"use client";

import { useParams } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/src/i18n/config";
import type { Dictionary } from "@/src/i18n/dictionaries";
import { NotFoundView } from "./not-found-content";

export type NotFoundVariant = { copy: Dictionary["notFound"]; homeHref: string; contactHref: string };

export function LocalizedNotFound({ variants }: { variants: Record<Locale, NotFoundVariant> }) {
  const { locale } = useParams<{ locale?: string }>();
  return <NotFoundView {...variants[isLocale(locale) ? locale : defaultLocale]} />;
}

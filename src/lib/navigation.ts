import { divisions } from "../content/catalog.ts";
import type { Locale } from "../i18n/config.ts";
import { getDictionary } from "../i18n/dictionaries/index.ts";
import { paths } from "../i18n/routes.ts";

export type NavItem = { href: string; label: string };

export function primaryNavigation(locale: Locale): NavItem[] {
  const { common } = getDictionary(locale);
  return [
    { href: paths.page(locale, "about"), label: common.about },
    ...divisions.map((division) => ({ href: paths.division(locale, division), label: division.shortTitle[locale] })),
    { href: paths.page(locale, "contact"), label: common.contact }
  ];
}

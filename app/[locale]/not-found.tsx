import { LocalizedNotFound, type NotFoundVariant } from "@/components/sections/localized-not-found";
import { locales, type Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { paths } from "@/src/i18n/routes";

// not-found receives no params, so the locale is picked on the client from the URL.
export default function NotFound() {
  const variants = Object.fromEntries(
    locales.map((locale): [Locale, NotFoundVariant] => [
      locale,
      { copy: getDictionary(locale).notFound, homeHref: paths.home(locale), contactHref: paths.page(locale, "contact") }
    ])
  ) as Record<Locale, NotFoundVariant>;
  return <LocalizedNotFound variants={variants} />;
}

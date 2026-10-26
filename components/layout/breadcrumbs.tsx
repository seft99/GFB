import Link from "next/link";
import { JsonLd } from "@/components/ui/json-ld";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { paths } from "@/src/i18n/routes";
import { breadcrumbSchema, type Crumb } from "@/src/lib/structured-data";

/** Visible trail plus matching BreadcrumbList structured data. The last item is the current page. */
export function Breadcrumbs({ locale, items }: { locale: Locale; items: Crumb[] }) {
  const { common } = getDictionary(locale);
  const crumbs: Crumb[] = [{ label: common.home, href: paths.home(locale) }, ...items];
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <nav className="breadcrumbs" aria-label={common.breadcrumb}>
        <ol>
          {crumbs.map((crumb, index) => (
            <li key={crumb.label}>
              {index < crumbs.length - 1 && crumb.href ? (
                <Link href={crumb.href}>{crumb.label}</Link>
              ) : (
                <span aria-current="page">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

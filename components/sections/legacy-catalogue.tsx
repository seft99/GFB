import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { families, type FamilyParent } from "@/src/migration/families";
import { legacyLinkLabel } from "@/src/migration/manifest";
import { publicUrl } from "@/src/migration/public-paths";
import "../../app/styles/legacy-detail.css";

/**
 * Crawlable links from a redesigned category (or division) to its retained product and
 * specification pages, grouped by family. Real anchors with descriptive text, visible on every
 * viewport; it sits outside the interactive concentrate portfolio and never changes it.
 */
export function LegacyCatalogue({ locale, parent }: { locale: Locale; parent: FamilyParent }) {
  const { legacy } = getDictionary(locale);
  const groups = families.filter(
    (family) => family.parent.division === parent.division && family.parent.category === parent.category
  );
  if (groups.length === 0) return null;
  return (
    <nav className="section legacy-catalogue" aria-labelledby="legacy-catalogue-title">
      <div className="shell">
        <h2 id="legacy-catalogue-title">{legacy.allProducts}</h2>
        <p className="legacy-catalogue__intro">{legacy.allProductsText}</p>
        {groups.map((family) => (
          <div key={family.id} className="legacy-catalogue__family">
            <h3>{family.label[locale]}</h3>
            <ul className="legacy-catalogue__links">
              {family.paths.map((path) => (
                <li key={path}>
                  <Link href={publicUrl(path, locale)} prefetch={false}>
                    <span>{legacyLinkLabel(path, locale)}</span>
                    <Icon name="arrow" strokeWidth={1.6} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

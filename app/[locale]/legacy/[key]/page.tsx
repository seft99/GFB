import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/sections/cta-band";
import { ProductDetailHero } from "@/components/sections/product-detail-hero";
import { Icon } from "@/components/ui/icon";
import { JsonLd } from "@/components/ui/json-ld";
import { getDivisionById } from "@/src/content/catalog";
import { isLocale, locales, type Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { paths } from "@/src/i18n/routes";
import { pageMetadata } from "@/src/lib/metadata";
import type { Item, Section } from "@/src/migration/content";
import { familyOf, legacyKey, pathFromKey, type Family } from "@/src/migration/families";
import { detailPaths, legacyCanonical, legacyLinkLabel, legacyName, legacyPage } from "@/src/migration/manifest";
import { productHeroImage } from "@/src/migration/product-hero-images";
import { isTechnicalResource } from "@/src/migration/product-resources";
import { publicUrl } from "@/src/migration/public-paths";
import { categoryLibrary } from "@/src/migration/technical-library";
import "../../../styles/legacy-detail.css";

type Props = PageProps<"/[locale]/legacy/[key]">;

/**
 * Legacy product, specification and subcategory pages (Wix catalogue), rendered at their
 * original public URL through the proxy (`/cans-path` → `/{locale}/legacy/{key}`). Content
 * comes from the crawled page (src/migration/legacy-content.json): specifications as tables,
 * lists and paragraphs in their original order; blocks still in English on Spanish pages carry
 * `lang="en"`. Breadcrumbs, family links and the CTA tie each page to its redesigned category.
 */
export function generateStaticParams() {
  return locales.flatMap((locale) => detailPaths.map((path) => ({ locale, key: legacyKey(path) })));
}

async function resolve(params: Props["params"]) {
  const { locale, key } = await params;
  if (!isLocale(locale)) return null;
  const path = pathFromKey(key);
  const page = legacyPage(path);
  const family = familyOf(path);
  return page && family ? { locale, path, page, family } : null;
}

function parentOf(family: Family) {
  const division = getDivisionById(family.parent.division);
  if (!division) throw new Error(`Unknown division ${family.parent.division}`);
  const category = family.parent.category
    ? division.categories.find((item) => item.id === family.parent.category)
    : undefined;
  return { division, category };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};
  const { locale, path, page } = resolved;
  return pageMetadata({
    locale,
    paths: { en: publicUrl(path, "en"), es: publicUrl(path, "es") },
    title: page[locale].metaTitle,
    description: page[locale].metaDescription
  });
}

type LegacyCopy = ReturnType<typeof getDictionary>["legacy"];

function SpecItem({ item, locale, copy }: { item: Item; locale: Locale; copy: LegacyCopy }) {
  const lang = "lang" in item ? item.lang : undefined;
  switch (item.type) {
    case "links":
      // Product references the original page linked to, as compact rows.
      return (
        <ul className="legacy-detail__refs" aria-label={copy.references}>
          {item.paths.map((path) => (
            <li key={path}>
              <Link href={publicUrl(path, locale)} prefetch={false}>
                <span>{legacyLinkLabel(path, locale)}</span>
                <Icon name="arrow" strokeWidth={1.6} />
              </Link>
            </li>
          ))}
        </ul>
      );
    case "p":
      return <p lang={lang}>{item.text}</p>;
    case "h3":
      return <h3 lang={lang}>{item.text}</h3>;
    case "ul":
      return (
        <ul className="legacy-detail__list" lang={lang}>
          {item.items.map((entry, index) => (
            <li key={`${index}-${entry}`}>{entry}</li>
          ))}
        </ul>
      );
    case "specs":
      return (
        <table className="legacy-detail__specs" lang={lang}>
          <tbody>
            {item.rows.map(([label, value], index) => (
              <tr key={`${index}-${label}`}>
                <th scope="row">{label}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
  }
}

function ContentSection({
  section,
  id,
  locale,
  copy
}: {
  section: Section;
  id: string;
  locale: Locale;
  copy: LegacyCopy;
}) {
  const items = section.items.map((item, index) => <SpecItem key={index} item={item} locale={locale} copy={copy} />);
  if (!section.heading) return <div className="legacy-detail__section">{items}</div>;
  return (
    <section className="legacy-detail__section" aria-labelledby={id}>
      <h2 id={id} lang={section.headingLang}>
        {section.heading}
      </h2>
      {items}
      {section.link && (
        <Link href={publicUrl(section.link, locale)} prefetch={false} className="legacy-detail__section-link">
          {copy.viewProduct}
          <span className="visually-hidden">: {legacyLinkLabel(section.link, locale)}</span>
          <Icon name="arrow" strokeWidth={1.8} />
        </Link>
      )}
    </section>
  );
}

/**
 * Hero lead: the page description without its leading "<name> from GFB Solutions," (the title
 * already names the product), e.g. "Available as concentrates, juices & purees, …".
 */
function heroDescription(description: string, name: string, locale: Locale) {
  const prefix = `${name} ${locale === "es" ? "de" : "from"} GFB Solutions, `;
  if (!description.startsWith(prefix)) return description;
  const rest = description.slice(prefix.length);
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

/** Legacy paths linked from the page content (restored product references). */
const contentLinks = (sections: Section[]) =>
  new Set(
    sections.flatMap((section) => [
      ...(section.link ? [section.link] : []),
      ...section.items.flatMap((item) => (item.type === "links" ? item.paths : []))
    ])
  );

export default async function LegacyDetailPage({ params }: Props) {
  const resolved = await resolve(params);
  if (!resolved) notFound();
  const { locale, path, page, family } = resolved;
  const content = page[locale];
  const { common, legacy, category: categoryCopy } = getDictionary(locale);
  const { division, category } = parentOf(family);
  const parentHref = category ? paths.category(locale, division, category) : paths.division(locale, division);
  const parentTitle = (category ?? division).title[locale];
  const inquiryHref = paths.contact(locale, { interest: division.id, category: content.h1 });
  const canonical = legacyCanonical(path, locale);
  const crumbs = [
    { label: division.title[locale], href: paths.division(locale, division) },
    ...(category ? [{ label: category.title[locale], href: parentHref }] : []),
    ...(family.hub && family.hub !== path
      ? [{ label: legacyName(family.hub, locale), href: publicUrl(family.hub, locale) }]
      : []),
    { label: content.h1 }
  ];
  // Family pages not already linked from the content (no duplicated link lists on hubs).
  const linked = contentLinks(content.sections);
  const siblings = family.paths.filter((item) => item !== path && !linked.has(item));
  const isHub = family.hub === path || path === "/fruit-concentrates";
  const firstParagraph = content.sections[0]?.items[0];
  const showLead = !(
    firstParagraph?.type === "p" && content.metaDescription.startsWith(firstParagraph.text.slice(0, 40))
  );

  // Hero: technical specification pages get the technical-document variant; product pages
  // their licensed or approved photograph when one exists (src/migration/product-hero-images.ts).
  const technical = isTechnicalResource(path);
  const photo = productHeroImage(path);
  const groupName =
    (category
      ? categoryLibrary(category.id, locale)?.families.find((item) => item.id === family.id)?.title
      : undefined) ?? family.label[locale];

  const heroEyebrow = technical ? legacy.heroTechnical : (content.eyebrow ?? family.label[locale]);
  const lead = showLead ? heroDescription(content.metaDescription, content.h1, locale) : undefined;
  // A lead that only repeats the eyebrow (e.g. "SOT - Large Aperture (Botcherby)") is left out.
  const heroLead = lead && lead !== heroEyebrow ? lead : undefined;

  const schema = {
    "@context": "https://schema.org",
    "@type": isHub ? "CollectionPage" : "Product",
    "@id": `${canonical}#${isHub ? "page" : "product"}`,
    name: content.h1,
    description: content.metaDescription,
    url: canonical,
    ...(isHub ? { inLanguage: locale === "es" ? "es-ES" : "en-US" } : { category: family.label[locale] })
  };

  return (
    <main id="main-content" className="legacy-detail">
      <JsonLd data={schema} />
      <ProductDetailHero
        locale={locale}
        config={{
          variant: technical ? "technical-document" : "product",
          eyebrow: heroEyebrow,
          title: content.h1,
          description: heroLead,
          breadcrumbs: crumbs,
          image:
            !technical && photo
              ? { src: photo.src, alt: photo.alt[locale], objectPosition: photo.position }
              : undefined,
          primaryAction: { label: common.inquire, href: inquiryHref },
          secondaryAction: { label: `${legacy.backTo} ${parentTitle}`, href: parentHref },
          identifier: `${technical ? legacy.heroTechnical : legacy.heroProduct} / ${groupName}`
        }}
      />

      {content.sections.length > 0 && (
        <section className="section legacy-detail__body" aria-label={legacy.specs}>
          <div className="shell">
            <div className="legacy-detail__content">
              {content.sections.map((section, index) => (
                <ContentSection
                  key={index}
                  section={section}
                  id={`legacy-section-${index}`}
                  locale={locale}
                  copy={legacy}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {siblings.length > 0 && (
        <nav className="section legacy-detail__related" aria-labelledby="legacy-related">
          <div className="shell">
            <p className="eyebrow">{family.label[locale]}</p>
            <h2 id="legacy-related">{legacy.related}</h2>
            <ul>
              {siblings.map((item) => (
                <li key={item}>
                  <Link href={publicUrl(item, locale)} prefetch={false}>
                    <span>{legacyLinkLabel(item, locale)}</span>
                    <Icon name="arrow" strokeWidth={1.6} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}

      <CtaBand
        variant="compact"
        tone="blue"
        eyebrow={categoryCopy.ctaEyebrow}
        title={categoryCopy.ctaTitle}
        context={
          category
            ? { title: category.scope.context.title[locale], text: category.scope.context.text[locale] }
            : undefined
        }
        href={inquiryHref}
        label={common.inquire}
      />
    </main>
  );
}

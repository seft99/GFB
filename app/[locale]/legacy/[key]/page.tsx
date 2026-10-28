import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CtaBand } from "@/components/sections/cta-band";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import { JsonLd } from "@/components/ui/json-ld";
import { getDivisionById } from "@/src/content/catalog";
import { isLocale, locales } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { paths } from "@/src/i18n/routes";
import { pageMetadata } from "@/src/lib/metadata";
import type { Item, Section } from "@/src/migration/content";
import { familyOf, legacyKey, pathFromKey, type Family } from "@/src/migration/families";
import { detailPaths, legacyCanonical, legacyLinkLabel, legacyName, legacyPage } from "@/src/migration/manifest";
import { publicUrl } from "@/src/migration/public-paths";
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

function SpecItem({ item }: { item: Item }) {
  const lang = "lang" in item ? item.lang : undefined;
  switch (item.type) {
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

function ContentSection({ section, id }: { section: Section; id: string }) {
  const items = section.items.map((item, index) => <SpecItem key={index} item={item} />);
  if (!section.heading) return <div className="legacy-detail__section">{items}</div>;
  return (
    <section className="legacy-detail__section" aria-labelledby={id}>
      <h2 id={id} lang={section.headingLang}>
        {section.heading}
      </h2>
      {items}
    </section>
  );
}

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
  const siblings = family.paths.filter((item) => item !== path);
  const isHub = family.hub === path || path === "/fruit-concentrates";
  const firstParagraph = content.sections[0]?.items[0];
  const showLead = !(
    firstParagraph?.type === "p" && content.metaDescription.startsWith(firstParagraph.text.slice(0, 40))
  );

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
      <section className="legacy-detail__hero">
        <div className="shell">
          <Breadcrumbs locale={locale} items={crumbs} />
          <p className="eyebrow">{content.eyebrow ?? family.label[locale]}</p>
          <h1>{content.h1}</h1>
          {showLead && <p className="legacy-detail__lead">{content.metaDescription}</p>}
          <div className="legacy-detail__actions">
            <ButtonLink href={inquiryHref} variant="dark" className="legacy-detail__primary">
              {common.inquire}
            </ButtonLink>
            <Link href={parentHref} className="legacy-detail__back">
              {legacy.backTo} {parentTitle}
              <Icon name="arrow" strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </section>

      {content.sections.length > 0 && (
        <section className="section legacy-detail__body" aria-label={legacy.specs}>
          <div className="shell">
            <div className="legacy-detail__content">
              {content.sections.map((section, index) => (
                <ContentSection key={index} section={section} id={`legacy-section-${index}`} />
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

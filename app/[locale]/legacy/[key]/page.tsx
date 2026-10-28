import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/sections/cta-band";
import { ProductDetailContent } from "@/components/sections/product-detail-content";
import { ProductDetailHero } from "@/components/sections/product-detail-hero";
import { Icon } from "@/components/ui/icon";
import { JsonLd } from "@/components/ui/json-ld";
import { getDivisionById } from "@/src/content/catalog";
import { isLocale, locales, type Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { paths } from "@/src/i18n/routes";
import { pageMetadata } from "@/src/lib/metadata";
import type { Section } from "@/src/migration/content";
import { familyOf, legacyKey, pathFromKey, type Family } from "@/src/migration/families";
import { detailPaths, legacyCanonical, legacyLinkLabel, legacyName, legacyPage } from "@/src/migration/manifest";
import { productContent } from "@/src/migration/product-content";
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
  // Hero and breadcrumb name: product name; the code/format goes to the eyebrow (see below).
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

  // Roles: title = the published name (its code, if any, on a second line), eyebrow = the
  // published identifier or the document type, lead = availability/application.
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
        <ProductDetailContent
          content={productContent(path, content.sections)}
          locale={locale}
          labels={{ ...legacy.content, viewProduct: legacy.viewProduct }}
        />
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

import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import {
  displayIndexes,
  hasResourceFilters,
  type ResourceSectionConfig,
  type ResourceSectionCta
} from "@/src/migration/resource-section";
import { ResourceBrowser, type ResourceBrowserLabels } from "./resource-browser";
import { ResourceView } from "./resource-views";
import "../../../app/styles/product-resources.css";

/**
 * Shared entry point of the product-resource presentations: `compact-groups` (grouped technical
 * rows, small collections) and `visual-cards` (photographic product cards, medium collections).
 * The variant is chosen explicitly by the config — never from item counts. Section framing, CTA
 * and the variant markup are server-rendered; a client island (ResourceBrowser) is added only
 * when the config enables search or resource filters. Extensive catalogues keep the separate
 * technical product library (components/sections/technical-library.tsx).
 */
export function ProductResourceSection({ config, locale }: { config: ResourceSectionConfig; locale: Locale }) {
  const { library } = getDictionary(locale);
  const idPrefix = `${config.id}-resources`;
  const labels: ResourceBrowserLabels = {
    productLink: library.productLink,
    technicalLink: library.technicalLink,
    overviewLink: library.overviewLink,
    products: library.units.products,
    specification: library.specification,
    specifications: library.specifications,
    searchLabel: library.searchLabel,
    searchPlaceholder: library.searchPlaceholder,
    clearSearch: library.clearSearch,
    typeFilter: library.typeFilter,
    all: library.all,
    product: library.product,
    technical: library.technical,
    resultCount: library.resultCount,
    resultCountOne: library.resultCountOne,
    noResults: library.noResults,
    noResultsHint: library.noResultsHint,
    reset: library.reset
  };
  const showFilters = hasResourceFilters(config);
  const showSearch = Boolean(config.showSearch);

  return (
    <section
      className={`section resource-section resource-section--${config.variant}`}
      aria-labelledby={`${idPrefix}-title`}
      data-variant={config.variant}
    >
      <div className="shell resource-section__inner">
        <header className="resource-section__intro">
          <p className="eyebrow">{config.eyebrow}</p>
          <h2 id={`${idPrefix}-title`}>{config.title}</h2>
          {config.description && <p>{config.description}</p>}
        </header>

        {showSearch || showFilters ? (
          <ResourceBrowser
            variant={config.variant}
            groups={config.groups}
            labels={labels}
            idPrefix={idPrefix}
            showSearch={showSearch}
            showFilters={showFilters}
          />
        ) : (
          <ResourceView
            variant={config.variant}
            groups={config.groups}
            indexes={displayIndexes(config.groups)}
            labels={labels}
            idPrefix={idPrefix}
          />
        )}

        {config.cta && <ResourceCta cta={config.cta} id={`${idPrefix}-cta`} />}
      </div>
    </section>
  );
}

/** Optional contextual call to action; renders nothing without a config. */
function ResourceCta({ cta, id }: { cta: ResourceSectionCta; id: string }) {
  return (
    <aside className={cta.image ? "resource-cta has-image" : "resource-cta"} aria-labelledby={id}>
      {cta.image && (
        <span className="resource-cta__image">
          <Image src={cta.image} alt={cta.imageAlt ?? ""} fill sizes="(min-width: 1100px) 16rem, 40vw" />
        </span>
      )}
      <div className="resource-cta__copy">
        {cta.eyebrow && <p className="eyebrow">{cta.eyebrow}</p>}
        <h3 id={id}>{cta.title}</h3>
        {cta.description && <p>{cta.description}</p>}
      </div>
      <ButtonLink href={cta.href} variant="dark" className="resource-cta__action">
        {cta.label}
      </ButtonLink>
    </aside>
  );
}

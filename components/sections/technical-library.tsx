"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { Icon } from "@/components/ui/icon";
import { FAMILY_PARAM, notifyFamilyChange, subscribeFamilyChange } from "@/src/lib/family-url";
import {
  matchesQuery,
  type DocumentType,
  type LibraryConfig,
  type LibraryFamily,
  type LibraryProduct
} from "@/src/migration/library-search";
import { FamilyUrlSync } from "./family-url-sync";
import "../../app/styles/technical-library.css";

/** Shared interface labels (`library` dictionary block); page-specific copy comes from the config. */
export type LibraryLabels = {
  families: string;
  searchLabel: string;
  searchPlaceholder: string;
  clearSearch: string;
  typeFilter: string;
  all: string;
  product: string;
  technical: string;
  productLink: string;
  overviewLink: string;
  technicalLink: string;
  rangeOverview: string;
  results: string;
  resultsIn: string;
  allFamilies: string;
  showAllFamilies: string;
  resultCount: string;
  resultCountOne: string;
  noResults: string;
  noResultsHint: string;
  reset: string;
  noTechnical: string;
  showAllResources: string;
};

type ResourceFilter = "all" | DocumentType;
type State = { familyId: string; query: string; type: ResourceFilter; scope: "all" | "family" };

/**
 * URL state of the page's library: `family` (group slug, unique within the library), `type` and
 * `q`. Unknown values fall back to the defaults; a type the library cannot filter is ignored.
 */
function readUrl(families: LibraryFamily[], fallback: State, filterable: boolean): State {
  const params = new URLSearchParams(window.location.search);
  const family = families.find((item) => item.slug === params.get("family"));
  const type = params.get("type");
  const query = params.get("q") ?? "";
  return {
    familyId: family?.id ?? fallback.familyId,
    query,
    type: filterable && (type === "product" || type === "technical") ? type : "all",
    scope: query && !family ? "all" : "family"
  };
}

function writeUrl(state: State, families: LibraryFamily[], mode: "push" | "replace") {
  const url = new URL(window.location.href);
  const previousFamily = url.searchParams.get(FAMILY_PARAM);
  const family = families.find((item) => item.id === state.familyId) ?? families[0];
  // A search across all families has no `family`, so a reload keeps the same scope.
  if (state.query && state.scope === "all") url.searchParams.delete("family");
  else url.searchParams.set("family", family.slug);
  if (state.type === "all") url.searchParams.delete("type");
  else url.searchParams.set("type", state.type);
  if (state.query) url.searchParams.set("q", state.query);
  else url.searchParams.delete("q");
  if (url.href === window.location.href) return;
  window.history[mode === "push" ? "pushState" : "replaceState"](window.history.state, "", url);
  // The concentrate explorer on the same page follows the family (src/lib/family-url.ts).
  if (url.searchParams.get(FAMILY_PARAM) !== previousFamily) queueMicrotask(notifyFamilyChange);
}

const countLabel = (labels: LibraryLabels, count: number) =>
  count === 1 ? labels.resultCountOne : labels.resultCount.replace("{count}", String(count));

const resourceLabel = (resource: LibraryProduct["resources"][number], labels: LibraryLabels) =>
  resource.type === "technical" ? labels.technicalLink : resource.overview ? labels.overviewLink : labels.productLink;

/** Range overviews (records made only of general pages) are listed apart from the products. */
const isOverviewRecord = (product: LibraryProduct) => product.resources.every((item) => item.overview);

/** Products of a family narrowed by resource type (a product keeps only matching resources). */
function byType(products: LibraryProduct[], type: ResourceFilter): LibraryProduct[] {
  if (type === "all") return products;
  return products
    .map((product) => ({ ...product, resources: product.resources.filter((item) => item.type === type) }))
    .filter((product) => product.resources.length > 0);
}

/**
 * Shared technical library (fruit & vegetable concentrates, IQF citrus): group navigator (a
 * single-choice radio group), live search and resource-type filters over one verified catalogue
 * configuration (src/migration/technical-library.ts). The type filters appear only when the
 * catalogue mixes product pages and technical sheets; the contextual banner only when the config
 * defines one. Every group panel is server-rendered as real links — the inactive ones are
 * `hidden` until selected — so all destinations stay crawlable without JavaScript. Group, type
 * and query are mirrored in the URL (`family`, `type`, `q`); the family is shared with the
 * concentrate explorer through src/lib/family-url.ts.
 */
export function TechnicalLibrary({ config, labels }: { config: LibraryConfig; labels: LibraryLabels }) {
  const { families, banner } = config;
  const ids = `${config.id}-library`;
  const filterable =
    new Set(families.flatMap((family) => family.products.flatMap((p) => p.resources.map((r) => r.type)))).size > 1;
  const initial: State = {
    familyId: config.defaultFamilyId ?? families[0].id,
    query: "",
    type: "all",
    scope: "family"
  };
  const [state, setState] = useState<State>(initial);
  const panelHeading = useRef<HTMLHeadingElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  // Restore from the URL after hydration; follow Back/Forward, same-page links and the explorer.
  useEffect(() => {
    const sync = () => setState(readUrl(families, initial, filterable));
    const params = new URLSearchParams(window.location.search);
    if (["family", "type", "q"].some((key) => params.has(key))) sync();
    return subscribeFamilyChange(sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the catalogue is static per render
  }, [families]);

  const update = useCallback(
    (next: Partial<State>, mode: "push" | "replace" = "push") => {
      setState((current) => {
        const merged = { ...current, ...next };
        writeUrl(merged, families, mode);
        return merged;
      });
    },
    [families]
  );

  const searching = state.query.trim().length > 0;
  const active = families.find((family) => family.id === state.familyId) ?? families[0];

  const results = useMemo(() => {
    if (!searching) return [];
    const pool = state.scope === "all" ? families : [active];
    return pool.flatMap((family) =>
      byType(
        family.products.filter((product) => matchesQuery(product, family.title, state.query)),
        state.type
      ).map((product) => ({ family, product }))
    );
  }, [searching, state.scope, state.query, state.type, families, active]);

  const announce = searching ? countLabel(labels, results.length) : "";

  function selectFamily(id: string) {
    update({ familyId: id, scope: "family" });
  }

  function reset() {
    update({ query: "", type: "all", scope: "family" });
    searchInput.current?.focus();
  }

  function openBannerGroup(groupId: string) {
    update({ familyId: groupId, query: "", scope: "family" });
    requestAnimationFrame(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panelHeading.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
      panelHeading.current?.focus({ preventScroll: true });
    });
  }

  function onSearchKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && state.query) {
      event.preventDefault();
      update({ query: "", scope: "family" }, "replace");
    }
    if (event.key === "Enter") event.preventDefault();
  }

  const typeOptions: { value: ResourceFilter; label: string }[] = [
    { value: "all", label: labels.all },
    { value: "product", label: labels.product },
    { value: "technical", label: labels.technical }
  ];

  return (
    <section className="section tech-library" aria-labelledby={`${ids}-title`} data-library={config.id}>
      <Suspense fallback={null}>
        <FamilyUrlSync />
      </Suspense>
      <div className="shell tech-library__inner">
        <header className="tech-library__intro">
          <p className="eyebrow">{config.intro.eyebrow}</p>
          <h2 id={`${ids}-title`}>{config.intro.title}</h2>
          <p>{config.intro.text}</p>
        </header>

        <div className="tech-library__layout">
          {/* One family at a time: a radio group (arrow keys move the selection natively). */}
          <fieldset className="tech-library__families">
            <legend className="tech-library__label">{labels.families}</legend>
            <ul>
              {families.map((family) => {
                const selected = family.id === active.id && !(searching && state.scope === "all");
                return (
                  <li key={family.id}>
                    <label className="tech-library__family">
                      <input
                        type="radio"
                        className="tech-library__radio"
                        name={`${ids}-family`}
                        value={family.slug}
                        checked={selected}
                        onChange={() => selectFamily(family.id)}
                        // Re-selecting the checked family during a search returns to its panel.
                        onClick={() => selected || selectFamily(family.id)}
                      />
                      <span className="tech-library__thumb" aria-hidden="true">
                        <Image src={family.thumb} alt="" fill sizes="48px" />
                      </span>
                      <span className="tech-library__family-name">{family.title}</span>
                      <span className="tech-library__family-count">
                        {family.productCount}
                        <span className="visually-hidden"> {family.countNoun}</span>
                      </span>
                      <Icon name="arrow" strokeWidth={1.8} />
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <div className="tech-library__main">
            <div className="tech-library__toolbar">
              <div className="tech-library__search">
                <label htmlFor={`${ids}-search`} className="visually-hidden">
                  {labels.searchLabel}
                </label>
                <Icon name="search" strokeWidth={1.8} />
                <input
                  ref={searchInput}
                  id={`${ids}-search`}
                  type="search"
                  value={state.query}
                  placeholder={labels.searchPlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(event) => {
                    // Typing a new query searches every family; refining it keeps the chosen scope.
                    const query = event.target.value;
                    const scope = !query.trim() ? "family" : searching ? state.scope : "all";
                    update({ query, scope }, "replace");
                  }}
                  onKeyDown={onSearchKey}
                />
                {state.query && (
                  <button
                    type="button"
                    className="tech-library__clear"
                    aria-label={labels.clearSearch}
                    onClick={() => {
                      update({ query: "", scope: "family" }, "replace");
                      searchInput.current?.focus();
                    }}
                  >
                    <Icon name="close" strokeWidth={1.8} />
                  </button>
                )}
              </div>
              {filterable && (
                <fieldset className="tech-library__types">
                  <legend className="visually-hidden">{labels.typeFilter}</legend>
                  {typeOptions.map((option) => (
                    <label key={option.value}>
                      <input
                        type="radio"
                        className="tech-library__radio"
                        name={`${ids}-type`}
                        value={option.value}
                        checked={state.type === option.value}
                        onChange={() => update({ type: option.value })}
                      />
                      {option.label}
                    </label>
                  ))}
                </fieldset>
              )}
            </div>

            <p className="visually-hidden" aria-live="polite">
              {announce}
            </p>

            <div className="tech-library__panel">
              {searching ? (
                <SearchResults
                  results={results}
                  labels={labels}
                  headingId={`${ids}-results`}
                  scopeTitle={state.scope === "all" ? labels.allFamilies : active.title}
                  narrowed={state.scope === "family"}
                  onShowAll={() => update({ scope: "all" })}
                  onReset={reset}
                />
              ) : (
                families.map((family) => (
                  <FamilyPanel
                    key={family.id}
                    family={family}
                    headingId={`${ids}-family-${family.id}`}
                    hidden={family.id !== active.id}
                    type={state.type}
                    labels={labels}
                    noTechnicalHint={config.noTechnicalHint}
                    headingRef={family.id === active.id ? panelHeading : undefined}
                    onShowAll={() => update({ type: "all" })}
                  />
                ))
              )}
            </div>

            {banner && active.id !== banner.groupId && (
              <aside className="tech-library__banner" aria-labelledby={`${ids}-banner`}>
                {banner.image && (
                  <span className="tech-library__banner-image" aria-hidden="true">
                    <Image src={banner.image} alt="" fill sizes="120px" />
                  </span>
                )}
                <div>
                  <p className="eyebrow">{banner.eyebrow}</p>
                  <h3 id={`${ids}-banner`}>{banner.title}</h3>
                  <p>{banner.text}</p>
                </div>
                <button
                  type="button"
                  className="tech-library__banner-action"
                  onClick={() => openBannerGroup(banner.groupId)}
                >
                  {banner.action}
                  <Icon name="arrow" strokeWidth={1.8} />
                </button>
              </aside>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FamilyPanel({
  family,
  headingId,
  hidden,
  type,
  labels,
  noTechnicalHint,
  headingRef,
  onShowAll
}: {
  family: LibraryFamily;
  headingId: string;
  hidden: boolean;
  type: ResourceFilter;
  labels: LibraryLabels;
  noTechnicalHint: string;
  headingRef?: Ref<HTMLHeadingElement>;
  onShowAll: () => void;
}) {
  const overviews = type === "technical" ? [] : family.products.filter(isOverviewRecord);
  const products = byType(
    family.products.filter((product) => !isOverviewRecord(product)),
    type
  );
  return (
    <div className="tech-library__family-panel" hidden={hidden} aria-labelledby={headingId} role="region">
      <div className="tech-library__panel-head">
        <p className="eyebrow">{family.eyebrow}</p>
        <h3 id={headingId} ref={headingRef} tabIndex={-1}>
          {family.heading}
          <span className="tech-library__count">{family.countLabel}</span>
        </h3>
        <p>{family.description}</p>
        {overviews.length > 0 && (
          <div className="tech-library__overviews">
            <p className="tech-library__overviews-label">{labels.rangeOverview}</p>
            <ul>
              {overviews.flatMap((product) =>
                product.resources.map((resource) => (
                  <li key={resource.id}>
                    <Link
                      href={resource.href}
                      prefetch={false}
                      className="tech-library__overview"
                      aria-label={`${labels.overviewLink}: ${product.name}`}
                    >
                      <span>{product.name}</span>
                      <Icon name="arrow" strokeWidth={1.8} />
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
      {products.length > 0 ? (
        <ResultGrid items={products.map((product) => ({ family, product }))} labels={labels} />
      ) : (
        <div className="tech-library__empty" role="status">
          <Icon name="document" strokeWidth={1.4} />
          <p className="tech-library__empty-title">{labels.noTechnical}</p>
          <p>{noTechnicalHint}</p>
          <button type="button" onClick={onShowAll}>
            {labels.showAllResources}
          </button>
        </div>
      )}
    </div>
  );
}

function SearchResults({
  results,
  labels,
  headingId,
  scopeTitle,
  narrowed,
  onShowAll,
  onReset
}: {
  results: { family: LibraryFamily; product: LibraryProduct }[];
  labels: LibraryLabels;
  headingId: string;
  scopeTitle: string;
  narrowed: boolean;
  onShowAll: () => void;
  onReset: () => void;
}) {
  return (
    <div className="tech-library__family-panel" role="region" aria-labelledby={headingId}>
      <div className="tech-library__panel-head">
        <p className="eyebrow">
          {labels.resultsIn} {scopeTitle}
        </p>
        <h3 id={headingId}>
          {labels.results}
          <span className="tech-library__count">{countLabel(labels, results.length)}</span>
        </h3>
        {narrowed && (
          <button type="button" className="tech-library__link-button" onClick={onShowAll}>
            {labels.showAllFamilies}
          </button>
        )}
      </div>
      {results.length > 0 ? (
        <ResultGrid items={results} labels={labels} showFamily />
      ) : (
        <div className="tech-library__empty" role="status">
          <Icon name="search" strokeWidth={1.4} />
          <p className="tech-library__empty-title">{labels.noResults}</p>
          <p>{labels.noResultsHint}</p>
          <button type="button" onClick={onReset}>
            {labels.reset}
          </button>
        </div>
      )}
    </div>
  );
}

function ResultGrid({
  items,
  labels,
  showFamily = false
}: {
  items: { family: LibraryFamily; product: LibraryProduct }[];
  labels: LibraryLabels;
  showFamily?: boolean;
}) {
  return (
    <ol className="tech-library__grid">
      {items.map(({ family, product }, index) => (
        <li key={`${family.id}:${product.id}`} className="tech-library__card">
          <span className="tech-library__index" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h4>{product.name}</h4>
          {showFamily && <p className="tech-library__card-family">{family.title}</p>}
          <ul className="tech-library__resources">
            {product.resources.map((resource) => (
              <li key={resource.id}>
                <Link
                  href={resource.href}
                  prefetch={false}
                  className={`tech-library__resource is-${resource.type}`}
                  aria-label={`${resourceLabel(resource, labels)}: ${product.name}`}
                >
                  <span>{resourceLabel(resource, labels)}</span>
                  <Icon name="arrow" strokeWidth={1.8} />
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

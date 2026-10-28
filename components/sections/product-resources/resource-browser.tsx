"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/icon";
import {
  displayIndexes,
  filterResourceGroups,
  itemCount,
  type ProductResourceGroup,
  type ResourceFilter,
  type ResourceVariant
} from "@/src/migration/resource-section";
import { ResourceView, type ResourceViewLabels } from "./resource-views";

export type ResourceBrowserLabels = ResourceViewLabels & {
  searchLabel: string;
  searchPlaceholder: string;
  clearSearch: string;
  typeFilter: string;
  all: string;
  product: string;
  technical: string;
  resultCount: string;
  resultCountOne: string;
  noResults: string;
  noResultsHint: string;
  reset: string;
};

/**
 * Search and resource-type filters shared by both variants. Counts refer to products (a product
 * with a product page and a specification page is one result). The only client state is the query
 * and the selected type; results come from the same pure filter (filterResourceGroups) and the
 * same markup (ResourceView) as the server-rendered sections. Every link is in the initial HTML.
 */
export function ResourceBrowser({
  variant,
  groups,
  labels,
  idPrefix,
  showSearch,
  showFilters
}: {
  variant: ResourceVariant;
  groups: ProductResourceGroup[];
  labels: ResourceBrowserLabels;
  idPrefix: string;
  showSearch: boolean;
  showFilters: boolean;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ResourceFilter>("all");
  const input = useRef<HTMLInputElement>(null);
  const indexes = useMemo(() => displayIndexes(groups), [groups]);
  const results = useMemo(() => filterResourceGroups(groups, query, type), [groups, query, type]);
  const narrowed = query.trim().length > 0 || type !== "all";
  const matches = itemCount(results);
  const resultText = matches === 1 ? labels.resultCountOne : labels.resultCount.replace("{count}", String(matches));

  function reset() {
    setQuery("");
    setType("all");
    input.current?.focus();
  }

  function onKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && query) {
      event.preventDefault();
      setQuery("");
    }
    if (event.key === "Enter") event.preventDefault();
  }

  const filters: { value: ResourceFilter; label: string }[] = [
    { value: "all", label: labels.all },
    { value: "product", label: labels.product },
    { value: "technical", label: labels.technical }
  ];

  return (
    <>
      <div className="resource-toolbar">
        {showSearch && (
          <div className="resource-search">
            <label htmlFor={`${idPrefix}-search`} className="visually-hidden">
              {labels.searchLabel}
            </label>
            <Icon name="search" strokeWidth={1.8} />
            <input
              ref={input}
              id={`${idPrefix}-search`}
              type="search"
              value={query}
              placeholder={labels.searchPlaceholder}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKey}
            />
            {query && (
              <button
                type="button"
                className="resource-search__clear"
                aria-label={labels.clearSearch}
                onClick={() => {
                  setQuery("");
                  input.current?.focus();
                }}
              >
                <Icon name="close" strokeWidth={1.8} />
              </button>
            )}
          </div>
        )}
        {showFilters && (
          // One type at a time: a radio group (arrow keys move the selection natively).
          <fieldset className="resource-filters">
            <legend className="visually-hidden">{labels.typeFilter}</legend>
            {filters.map((filter) => (
              <label key={filter.value}>
                <input
                  type="radio"
                  className="resource-filters__radio"
                  name={`${idPrefix}-type`}
                  value={filter.value}
                  checked={type === filter.value}
                  onChange={() => setType(filter.value)}
                />
                {filter.label}
              </label>
            ))}
          </fieldset>
        )}
      </div>

      <p className="visually-hidden" aria-live="polite">
        {narrowed ? resultText : ""}
      </p>

      {results.length > 0 ? (
        <ResourceView variant={variant} groups={results} indexes={indexes} labels={labels} idPrefix={idPrefix} />
      ) : (
        <div className="resource-empty" role="status">
          <Icon name="search" strokeWidth={1.4} />
          <p className="resource-empty__title">{labels.noResults}</p>
          <p>{labels.noResultsHint}</p>
          <button type="button" onClick={reset}>
            {labels.reset}
          </button>
        </div>
      )}
    </>
  );
}

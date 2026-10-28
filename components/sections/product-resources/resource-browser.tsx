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
 * Search and resource-type filters shared by both variants. The only client state is the query
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

  const filters: { value: ResourceFilter; label: string; icon: "bars" | "document" }[] = [
    { value: "all", label: labels.all, icon: "bars" },
    { value: "product", label: labels.product, icon: "document" },
    { value: "technical", label: labels.technical, icon: "document" }
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
          <div className="resource-filters" role="group" aria-label={labels.typeFilter}>
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={type === filter.value}
                onClick={() => setType(filter.value)}
              >
                <Icon name={filter.icon} strokeWidth={1.6} />
                {filter.label}
              </button>
            ))}
          </div>
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

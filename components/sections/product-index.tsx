"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { compactSearch, normalizeSearch } from "@/src/migration/library-search";

export type IndexAction = { kind: "overview" | "product" | "technical"; href: string };
export type IndexEntry = { id: string; title: string; keywords: string; actions: IndexAction[] };
export type IndexFamily = { id: string; title: string; entries: IndexEntry[] };
export type IndexDivision = { id: string; title: string; href: string; families: IndexFamily[] };

export type ProductIndexLabels = {
  actions: Record<IndexAction["kind"], string>;
  /** "Product page: Merlot" — accessible names that start with the visible label. */
  actionNames: Record<IndexAction["kind"], string>;
  jump: string;
  searchLabel: string;
  searchPlaceholder: string;
  clear: string;
  empty: string;
  count: { one: string; other: string };
};

const matches = (entry: IndexEntry, family: IndexFamily, query: string) => {
  const text = `${entry.title} ${entry.keywords} ${family.title}`;
  return normalizeSearch(text).includes(normalizeSearch(query)) || compactSearch(text).includes(compactSearch(query));
};

/**
 * Product index: one row per product identity with its pages as explicit actions (overview,
 * product page, specification), category jump links and a search over names and codes. Every
 * link is in the server HTML (the search only narrows what is shown); empty states are announced.
 */
export function ProductIndex({ divisions, labels }: { divisions: IndexDivision[]; labels: ProductIndexLabels }) {
  const [query, setQuery] = useState("");
  const ids = useId();
  const trimmed = query.trim();
  const visible = divisions
    .map((division) => ({
      ...division,
      families: division.families
        .map((family) => ({
          ...family,
          entries: trimmed ? family.entries.filter((entry) => matches(entry, family, trimmed)) : family.entries
        }))
        .filter((family) => family.entries.length > 0)
    }))
    .filter((division) => division.families.length > 0);
  const total = visible.reduce(
    (sum, division) => sum + division.families.reduce((count, family) => count + family.entries.length, 0),
    0
  );

  return (
    <div className="product-index">
      <div className="shell product-index__tools">
        <nav className="product-index__jump" aria-label={labels.jump}>
          <p>{labels.jump}</p>
          <ul>
            {divisions.map((division) => (
              <li key={division.id}>
                <a href={`#index-${division.id}`}>{division.title}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="product-index__search" role="search">
          <label htmlFor={`${ids}-search`}>{labels.searchLabel}</label>
          <div>
            <input
              id={`${ids}-search`}
              type="search"
              value={query}
              placeholder={labels.searchPlaceholder}
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setQuery("");
              }}
            />
            {query && (
              <button type="button" onClick={() => setQuery("")}>
                {labels.clear}
              </button>
            )}
          </div>
          <p className="product-index__count" aria-live="polite">
            {trimmed ? `${total} ${total === 1 ? labels.count.one : labels.count.other}` : ""}
          </p>
        </div>
      </div>

      {visible.length === 0 && (
        <div className="shell product-index__empty">
          <p>{labels.empty}</p>
          <button type="button" onClick={() => setQuery("")}>
            {labels.clear}
          </button>
        </div>
      )}

      {visible.map((division) => (
        <section
          key={division.id}
          id={`index-${division.id}`}
          className="section legacy-catalogue product-index__division"
          aria-labelledby={`index-${division.id}-title`}
        >
          <div className="shell">
            <h2 id={`index-${division.id}-title`}>
              <Link href={division.href}>{division.title}</Link>
            </h2>
            {division.families.map((family) => (
              <div key={family.id} className="legacy-catalogue__family" id={`index-${family.id}`}>
                <h3>{family.title}</h3>
                <ul className="product-index__entries">
                  {family.entries.map((entry) => (
                    <li key={entry.id}>
                      <span className="product-index__name">{entry.title}</span>
                      <span className="product-index__actions">
                        {entry.actions.map((action) => (
                          <Link
                            key={action.href}
                            href={action.href}
                            prefetch={false}
                            data-kind={action.kind}
                            aria-label={labels.actionNames[action.kind].replace("{name}", entry.title)}
                          >
                            {labels.actions[action.kind]}
                            <Icon name="arrow" strokeWidth={1.6} />
                          </Link>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

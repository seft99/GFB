import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import type { FamilyResourceKind, RelatedProductEntry } from "@/src/migration/related-resources";
import "../../app/styles/family-related.css";

export type FamilyRelatedLabels = {
  title: string;
  description?: string;
  resourceKinds: Record<FamilyResourceKind, string>;
  /** "Explore all red grape resources" (omitted without a family destination). */
  explore?: string;
};

type Props = {
  eyebrow: string;
  entries: RelatedProductEntry[];
  labels: FamilyRelatedLabels;
  directoryHref?: string;
};

/** Columns for the number of cards: 1–3 side by side, 4 as 2 × 2, more in rows of three. */
const columns = (count: number) => (count <= 3 ? count : count === 4 ? 2 : 3);

/**
 * "More in this family": one card per product identity with its published pages as separate
 * links (overview, product page, technical specification). A card with one destination is
 * clickable as a whole through that link; a card with several keeps each link independent and
 * its arrow decorative. The caller passes the entries already filtered for the current page
 * (src/migration/related-resources.ts) and renders nothing when none remain.
 */
export function FamilyRelated({ eyebrow, entries, labels, directoryHref }: Props) {
  if (!entries.length) return null;
  return (
    <nav className="section family-related" aria-labelledby="family-related-title">
      <div className="shell">
        <header className="family-related__head">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="family-related-title">{labels.title}</h2>
          {labels.description && <p>{labels.description}</p>}
        </header>
        <ol
          className="family-related__grid"
          style={{ "--related-columns": columns(entries.length) } as CSSProperties}
          data-count={entries.length}
        >
          {entries.map((entry, index) => {
            const single = entry.resources.length === 1;
            return (
              <li key={entry.id} className={`family-related__card${single ? " is-single" : ""}`}>
                <span className="family-related__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="family-related__body">
                  <h3>{entry.title}</h3>
                  <ul className="family-related__links">
                    {entry.resources.map((resource) => (
                      <li key={resource.path}>
                        {/* Name: the visible label first (WCAG 2.5.3), then the product. */}
                        <Link
                          href={resource.href}
                          prefetch={false}
                          data-kind={resource.kind}
                          aria-label={`${labels.resourceKinds[resource.kind]}: ${entry.title}`}
                        >
                          {labels.resourceKinds[resource.kind]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <span className="family-related__arrow" aria-hidden="true">
                  <Icon name="arrow" strokeWidth={1.8} />
                </span>
              </li>
            );
          })}
        </ol>
        {directoryHref && labels.explore && (
          <p className="family-related__more">
            <Link href={directoryHref} prefetch={false}>
              <span>{labels.explore}</span>
              <Icon name="arrow" strokeWidth={1.8} />
            </Link>
          </p>
        )}
      </div>
    </nav>
  );
}

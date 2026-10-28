import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import type {
  ProductResourceGroup,
  ProductResourceItem,
  ResourceLink,
  ResourceVariant
} from "@/src/migration/resource-section";

/**
 * Markup of the two product-resource variants. No state and no hooks: rendered on the server
 * when a section has no search or filters, and by the client browser (resource-browser.tsx)
 * when it does — one implementation for both.
 */

export type ResourceViewLabels = {
  count: string;
  countOne: string;
  productLink: string;
  technicalLink: string;
};

type ViewProps = {
  groups: ProductResourceGroup[];
  /** From the full data (displayIndexes), so filtered views keep their numbers. */
  indexes: Record<string, number>;
  labels: ResourceViewLabels;
  idPrefix: string;
};

const pad = (value: number | undefined) => String(value ?? 0).padStart(2, "0");
const kindLabel = (link: ResourceLink, labels: ResourceViewLabels) =>
  link.kind === "technical" ? labels.technicalLink : labels.productLink;
export const countText = (count: number, labels: { count: string; countOne: string }) =>
  count === 1 ? labels.countOne : labels.count.replace("{count}", String(count));

/** Columns that keep a balanced grid without empty placeholders (CSS narrows them on small screens). */
export const cardColumns = (items: number) => (items <= 4 ? items : items % 3 === 0 || items === 5 ? 3 : 4);
export const groupColumns = (groups: number) => (groups <= 3 ? groups : groups === 4 ? 2 : 3);

export function ResourceView({ variant, ...props }: ViewProps & { variant: ResourceVariant }) {
  return variant === "visual-cards" ? <VisualProductCards {...props} /> : <CompactResourceGroups {...props} />;
}

/* ---------- compact-groups ---------- */

function CompactResourceGroups({ groups, indexes, labels, idPrefix }: ViewProps) {
  return (
    <div
      className="resource-groups"
      style={{ "--group-columns": groupColumns(groups.length) } as CSSProperties}
      data-count={groups.length}
    >
      {groups.map((group) => {
        const headingId = `${idPrefix}-group-${group.id}`;
        const count = group.items.reduce((sum, item) => sum + item.resources.length, 0);
        return (
          <section key={group.id} className="resource-group" aria-labelledby={headingId}>
            <header className="resource-group__head">
              <div>
                <p className="resource-group__meta">
                  {group.eyebrow && <span className="eyebrow">{group.eyebrow}</span>}
                  <span className="resource-group__count">{countText(count, labels)}</span>
                </p>
                <h3 id={headingId}>{group.title}</h3>
                {group.description && <p lang={group.descriptionLang}>{group.description}</p>}
              </div>
              {group.image && (
                <span className="resource-group__image" aria-hidden="true">
                  <Image src={group.image} alt="" fill sizes="80px" />
                </span>
              )}
            </header>
            <ol className="resource-rows">
              {group.items.flatMap((item) =>
                item.resources.map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} prefetch={false} className={`resource-row is-${link.kind}`}>
                      <span className="resource-row__index" aria-hidden="true">
                        {pad(indexes[`${group.id}/${item.id}/${link.id}`])}
                      </span>
                      <span className="resource-row__title">{item.title}</span>
                      <span className="resource-badge">{kindLabel(link, labels)}</span>
                      <Icon name="arrow" strokeWidth={1.8} />
                    </Link>
                  </li>
                ))
              )}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

/* ---------- visual-cards ---------- */

function VisualProductCards({ groups, indexes, labels, idPrefix }: ViewProps) {
  const titled = groups.length > 1;
  return (
    <div className="resource-card-groups">
      {groups.map((group) => {
        const headingId = `${idPrefix}-cards-${group.id}`;
        const Heading = titled ? "h4" : "h3";
        return (
          <section
            key={group.id}
            className="resource-card-group"
            {...(titled ? { "aria-labelledby": headingId } : { "aria-label": group.title })}
          >
            {titled && (
              <header className="resource-card-group__head">
                <h3 id={headingId}>{group.title}</h3>
                <span className="resource-group__count">
                  {countText(
                    group.items.reduce((sum, item) => sum + item.resources.length, 0),
                    labels
                  )}
                </span>
              </header>
            )}
            <ol
              className="resource-cards"
              data-columns={cardColumns(group.items.length)}
              style={{ "--card-columns": cardColumns(group.items.length) } as CSSProperties}
            >
              {group.items.map((item) => (
                <ProductResourceCard
                  key={item.id}
                  item={item}
                  index={indexes[`${group.id}/${item.id}`]}
                  labels={labels}
                  Heading={Heading}
                />
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function ProductResourceCard({
  item,
  index,
  labels,
  Heading
}: {
  item: ProductResourceItem;
  index: number | undefined;
  labels: ResourceViewLabels;
  Heading: "h3" | "h4";
}) {
  return (
    <li className="resource-card">
      <div className="resource-card__media">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.imageAlt ?? ""}
            fill
            sizes="(min-width: 1100px) 26rem, (min-width: 640px) 50vw, 100vw"
            style={item.imagePosition ? { objectPosition: item.imagePosition } : undefined}
          />
        ) : (
          <span className="resource-card__fallback" aria-hidden="true">
            <Icon name="document" strokeWidth={1.2} />
          </span>
        )}
      </div>
      <div className="resource-card__body">
        <span className="resource-card__index" aria-hidden="true">
          {pad(index)}
        </span>
        <Heading>{item.title}</Heading>
        {item.description && <p lang={item.descriptionLang}>{item.description}</p>}
        <ul className="resource-card__links">
          {item.resources.map((link) => (
            <li key={link.id}>
              <Link href={link.href} prefetch={false} className={`resource-card__link is-${link.kind}`}>
                <Icon name="document" strokeWidth={1.6} />
                <span>
                  {kindLabel(link, labels)}
                  <span className="visually-hidden">: {link.label}</span>
                </span>
                <span className="resource-card__arrow" aria-hidden="true">
                  <Icon name="arrow" strokeWidth={1.8} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

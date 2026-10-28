import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import {
  groupCounts,
  type ProductResourceGroup,
  type ProductResourceItem,
  type ResourceIllustration,
  type ResourceLink,
  type ResourceVariant
} from "@/src/migration/resource-section";

/**
 * Markup of the two product-resource variants. No state and no hooks: rendered on the server
 * when a section has no search or filters, and by the client browser (resource-browser.tsx)
 * when it does — one implementation for both.
 *
 * One product = one row or card, with one action per destination ("View product", "View
 * specifications"); a family's range overview is an "Explore range" link in the group header,
 * not a numbered product.
 */

export type ResourceViewLabels = {
  productLink: string;
  technicalLink: string;
  overviewLink: string;
  products: { one: string; other: string };
  specifications: string;
};

type ViewProps = {
  groups: ProductResourceGroup[];
  /** From the full data (displayIndexes), so filtered views keep their numbers. */
  indexes: Record<string, number>;
  labels: ResourceViewLabels;
  idPrefix: string;
};

const pad = (value: number | undefined) => String(value ?? 0).padStart(2, "0");
const actionLabel = (link: ResourceLink, labels: ResourceViewLabels) =>
  link.kind === "technical" ? labels.technicalLink : labels.productLink;

/** "4 products · 2 specifications" (the specification part only when there are some). */
export function countText(group: ProductResourceGroup, labels: ResourceViewLabels) {
  const { products, specifications } = groupCounts(group);
  const noun = products === 1 ? labels.products.one : labels.products.other;
  return `${products} ${noun}${specifications ? ` · ${specifications} ${labels.specifications}` : ""}`;
}

/** Columns that keep a balanced grid without empty placeholders (CSS narrows them on small screens). */
export const cardColumns = (items: number) => (items <= 4 ? items : items % 3 === 0 || items === 5 ? 3 : 4);
export const groupColumns = (groups: number) => (groups <= 3 ? groups : groups === 4 ? 2 : 3);

export function ResourceView({ variant, ...props }: ViewProps & { variant: ResourceVariant }) {
  return variant === "visual-cards" ? <VisualProductCards {...props} /> : <CompactResourceGroups {...props} />;
}

function ResourceAction({
  link,
  item,
  labels,
  className
}: {
  link: ResourceLink;
  item: ProductResourceItem;
  labels: ResourceViewLabels;
  className: string;
}) {
  return (
    <Link
      href={link.href}
      prefetch={false}
      className={`${className} is-${link.kind}`}
      // Starts with the visible text (WCAG 2.5.3) and names the product.
      aria-label={`${actionLabel(link, labels)}: ${item.title}`}
    >
      <span>{actionLabel(link, labels)}</span>
      <Icon name="arrow" strokeWidth={1.8} />
    </Link>
  );
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
        const overviews = group.items.filter((item) => item.overview);
        const products = group.items.filter((item) => !item.overview);
        return (
          <section key={group.id} className="resource-group" aria-labelledby={headingId}>
            <header className="resource-group__head">
              <div>
                <p className="resource-group__meta">
                  {group.eyebrow && <span className="eyebrow">{group.eyebrow}</span>}
                  <span className="resource-group__count">{countText(group, labels)}</span>
                </p>
                <h3 id={headingId}>{group.title}</h3>
                {group.description && (
                  <p className="resource-group__text" lang={group.descriptionLang}>
                    {group.description}
                  </p>
                )}
                {overviews.map((item) =>
                  item.resources.map((link) => (
                    <Link
                      key={link.id}
                      href={link.href}
                      prefetch={false}
                      className="resource-group__range"
                      aria-label={`${labels.overviewLink}: ${item.title}`}
                    >
                      <span>{labels.overviewLink}</span>
                      <Icon name="arrow" strokeWidth={1.8} />
                    </Link>
                  ))
                )}
              </div>
              {group.image && (
                <span className="resource-group__image" aria-hidden="true">
                  <Image src={group.image} alt="" fill sizes="80px" />
                </span>
              )}
            </header>
            <ol className="resource-rows">
              {products.map((item) => (
                <li key={item.id} className="resource-row">
                  <span className="resource-row__index" aria-hidden="true">
                    {pad(indexes[`${group.id}/${item.id}`])}
                  </span>
                  <span className="resource-row__name">
                    <span className="resource-row__title">{item.title}</span>
                    {item.meta && <span className="resource-row__meta">{item.meta}</span>}
                  </span>
                  <span className="resource-row__actions">
                    {item.resources.map((link) => (
                      <ResourceAction
                        key={link.id}
                        link={link}
                        item={item}
                        labels={labels}
                        className="resource-action"
                      />
                    ))}
                  </span>
                </li>
              ))}
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
        const products = group.items.filter((item) => !item.overview);
        return (
          <section
            key={group.id}
            className="resource-card-group"
            {...(titled ? { "aria-labelledby": headingId } : { "aria-label": group.title })}
          >
            {titled && (
              <header className="resource-card-group__head">
                <h3 id={headingId}>{group.title}</h3>
                <span className="resource-group__count">{countText(group, labels)}</span>
              </header>
            )}
            <ol
              className="resource-cards"
              data-columns={cardColumns(products.length)}
              style={{ "--card-columns": cardColumns(products.length) } as CSSProperties}
            >
              {products.map((item) => (
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
      <div className={item.illustration ? "resource-card__media is-illustration" : "resource-card__media"}>
        {item.image ? (
          <Image
            src={item.image}
            alt={item.imageAlt ?? ""}
            fill
            sizes="(min-width: 1100px) 26rem, (min-width: 640px) 50vw, 100vw"
            style={item.imagePosition ? { objectPosition: item.imagePosition } : undefined}
          />
        ) : item.illustration ? (
          <LabelIllustration kind={item.illustration} />
        ) : (
          <span className="resource-card__fallback" aria-hidden="true">
            <Icon name="cube" strokeWidth={1.2} />
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
              <ResourceAction link={link} item={item} labels={labels} className="resource-card__link" />
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

/**
 * Designed line illustration of a label type for products without a suitable licensed
 * photograph: a plain bottle with the area the label covers — a full-body sleeve over shoulder
 * and body, or a paper label on the body only. Decorative (the card title names the product).
 */
function LabelIllustration({ kind }: { kind: ResourceIllustration }) {
  const bottle = "M88 18h24v26c0 8 18 14 18 34v104a10 10 0 0 1-10 10H80a10 10 0 0 1-10-10V78c0-20 18-26 18-34z";
  return (
    <svg className="resource-illustration" viewBox="0 0 200 210" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`bottle-${kind}`}>
          <path d={bottle} />
        </clipPath>
      </defs>
      <ellipse cx="100" cy="196" rx="44" ry="5" className="resource-illustration__shadow" />
      <path d={bottle} className="resource-illustration__glass" />
      {kind === "shrink-sleeve" ? (
        <g clipPath={`url(#bottle-${kind})`}>
          <rect x="60" y="46" width="80" height="140" className="resource-illustration__label" />
          <path d="M60 70c20 6 60 6 80 0M60 150c20 6 60 6 80 0" className="resource-illustration__line" />
        </g>
      ) : (
        <g clipPath={`url(#bottle-${kind})`}>
          <rect x="60" y="104" width="80" height="54" className="resource-illustration__label" />
          <path d="M84 122h32M90 134h20" className="resource-illustration__line" />
        </g>
      )}
      <path d={bottle} className="resource-illustration__outline" />
      <rect x="86" y="12" width="28" height="9" rx="2" className="resource-illustration__cap" />
    </svg>
  );
}

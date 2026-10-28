import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import type { Locale } from "@/src/i18n/config";
import type { Item } from "@/src/migration/content";
import { legacyLinkLabel } from "@/src/migration/manifest";
import {
  isValueRow,
  type ContentGroup,
  type FactsContent,
  type FormatsContent,
  type ProductContent,
  type RangeContent,
  type TechnicalContent
} from "@/src/migration/product-content";
import { publicUrl } from "@/src/migration/public-paths";
import "../../app/styles/product-detail-content.css";

export type ProductContentLabels = {
  eyebrow: string;
  formatsTitle: string;
  formatsPanel: string;
  overview: string;
  factsTitle: string;
  details: string;
  technicalTitle: string;
  parameter: string;
  specification: string;
  rangeTitle: string;
  featuresTitle: string;
  references: string;
  viewProduct: string;
  productReferences: string;
};

type Ctx = { locale: Locale; labels: ProductContentLabels; id: string };

/**
 * Product-information section of every product-detail page (below the hero), in one of four
 * layouts chosen per page by src/migration/product-content.ts: formats + overview, facts +
 * applications, technical specification, or product range / features. Server component; every
 * published heading, paragraph, list, table row and link of the page is rendered, in order,
 * with its `lang` (English text kept on Spanish pages). Nothing is added: no values, methods,
 * images or downloads that the page does not publish.
 */
export function ProductDetailContent({
  content,
  locale,
  labels
}: {
  content: ProductContent;
  locale: Locale;
  labels: ProductContentLabels;
}) {
  const ctx: Ctx = { locale, labels, id: "pdc" };
  const view = {
    "formats-overview": () => <FormatsView content={content as FormatsContent} ctx={ctx} />,
    "facts-applications": () => <FactsView content={content as FactsContent} ctx={ctx} />,
    "technical-specification": () => <TechnicalView content={content as TechnicalContent} ctx={ctx} />,
    "product-range-features": () => <RangeView content={content as RangeContent} ctx={ctx} />
  }[content.variant];
  const title = {
    "formats-overview": labels.formatsTitle,
    "facts-applications": labels.factsTitle,
    "technical-specification": labels.technicalTitle,
    "product-range-features": labels.rangeTitle
  }[content.variant];
  return (
    <section
      className={`section pdc pdc--${content.variant} legacy-detail__body`}
      aria-labelledby="pdc-title"
      data-variant={content.variant}
    >
      <div className="shell">
        <header className="pdc__head">
          <p className="pdc__eyebrow">{labels.eyebrow}</p>
          <h2 id="pdc-title">{title}</h2>
        </header>
        <div className="pdc__body legacy-detail__content">{view()}</div>
      </div>
    </section>
  );
}

// ---------- Shared primitives ----------

function ItemView({ item, ctx }: { item: Item; ctx: Ctx }) {
  const lang = "lang" in item ? item.lang : undefined;
  switch (item.type) {
    case "p":
      return <p lang={lang}>{item.text}</p>;
    case "h3":
      return <h4 lang={lang}>{item.text}</h4>;
    case "ul":
      return (
        <ul className="pdc-list" lang={lang}>
          {item.items.map((entry, index) => (
            <li key={`${index}-${entry}`}>
              <Icon name="check" strokeWidth={2} />
              <span>{entry}</span>
            </li>
          ))}
        </ul>
      );
    case "specs":
      return <SpecTable rows={item.rows} lang={lang} ctx={ctx} />;
    case "links":
      return (
        <ul className="pdc-refs legacy-detail__refs" aria-label={ctx.labels.productReferences}>
          {item.paths.map((path) => (
            <li key={path}>
              <Link href={publicUrl(path, ctx.locale)} prefetch={false}>
                <span>{legacyLinkLabel(path, ctx.locale)}</span>
                <Icon name="arrow" strokeWidth={1.8} />
              </Link>
            </li>
          ))}
        </ul>
      );
  }
}

const Items = ({ items, ctx }: { items: Item[]; ctx: Ctx }) => (
  <>
    {items.map((item, index) => (
      <ItemView key={index} item={item} ctx={ctx} />
    ))}
  </>
);

/**
 * A published table. Label/value rows get row headers under Parameter / Specification; rows
 * whose two cells are both values (e.g. fill volumes "200ml" | "250ml") stay plain cells.
 */
function SpecTable({ rows, lang, ctx }: { rows: [string, string][]; lang?: "en"; ctx: Ctx }) {
  const values = rows.every(isValueRow);
  return (
    <div className="pdc-table-wrap">
      <table className={values ? "pdc-table is-values" : "pdc-table"} lang={lang}>
        {!values && (
          <thead>
            <tr>
              <th scope="col">{ctx.labels.parameter}</th>
              <th scope="col">{ctx.labels.specification}</th>
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map(([label, value], index) => (
            <tr key={`${index}-${label}`}>
              {values ? <td>{label}</td> : <th scope="row">{label}</th>}
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A titled group: heading (h3), its items and the product link the page published with it. */
function GroupCard({
  group,
  ctx,
  id,
  className = "pdc-card",
  headingLevel = 3,
  children
}: {
  group: ContentGroup;
  ctx: Ctx;
  id: string;
  className?: string;
  headingLevel?: 3 | 4;
  children?: ReactNode;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h4";
  const body = (
    <>
      {children}
      <Items items={group.items} ctx={ctx} />
      {group.link && (
        <Link
          href={publicUrl(group.link, ctx.locale)}
          prefetch={false}
          className="pdc-link legacy-detail__section-link"
        >
          {ctx.labels.viewProduct}
          <span className="visually-hidden">: {legacyLinkLabel(group.link, ctx.locale)}</span>
          <Icon name="arrow" strokeWidth={1.8} />
        </Link>
      )}
    </>
  );
  if (!group.heading) return <div className={className}>{body}</div>;
  return (
    <section className={className} aria-labelledby={id}>
      <Heading id={id} lang={group.headingLang}>
        {group.heading}
      </Heading>
      {body}
    </section>
  );
}

// ---------- A: formats-overview ----------

const FORMAT_ICONS: [RegExp, IconName][] = [
  [/deioni|desioni/i, "cube"],
  [/organ|ecol|bio/i, "leaf"],
  [/cell|célul|celul|sac|vesíc/i, "nodes"],
  [/oil|aceite/i, "capsule"],
  [/juice|zumo|jugo|pur[eé]/i, "bottle"],
  [/concentr/i, "drop"]
];
const formatIcon = (label: string) => FORMAT_ICONS.find(([pattern]) => pattern.test(label))?.[1] ?? "cube";

function FormatsView({ content, ctx }: { content: FormatsContent; ctx: Ctx }) {
  return (
    <div className="pdc-split pdc-split--formats">
      <section className="pdc-panel pdc-formats" aria-labelledby="pdc-formats">
        <h3 id="pdc-formats" lang={content.formatsHeadingLang}>
          {content.formatsHeading ?? ctx.labels.formatsPanel}
        </h3>
        <dl className="pdc-formats__rows">
          {content.formats.map((row, index) => (
            <div key={`${index}-${row.label}`} className="pdc-formats__row" lang={row.lang}>
              <dt>
                <span className="pdc-icon" aria-hidden="true">
                  <Icon name={formatIcon(row.label)} strokeWidth={1.6} />
                </span>
                {row.label}
              </dt>
              <dd>
                {/* The published cell, whole (read by assistive technology, matched by the SEO
                    verifier); the chips below are its visual form. */}
                <span className="visually-hidden">{row.values.join(", ")}</span>
                <ul className="pdc-chips" aria-hidden="true">
                  {row.values.map((value, position) => (
                    <li key={`${position}-${value}`}>{value}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </section>
      {(content.overview.length > 0 || content.notes.length > 0) && (
        <div className="pdc-overview">
          <p className="pdc__eyebrow">{ctx.labels.overview}</p>
          {content.overview.map((group, index) => (
            <GroupCard key={index} group={group} ctx={ctx} id={`pdc-overview-${index}`} className="pdc-prose" />
          ))}
          {content.notes.map((note, index) => (
            <section
              key={note.label}
              className="pdc-prose pdc-note"
              aria-labelledby={`pdc-note-${index}`}
              lang={note.lang}
            >
              <h3 id={`pdc-note-${index}`}>{note.label}</h3>
              <p>{note.text}</p>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- B: facts-applications ----------

const FACT_ICONS: [RegExp, IconName][] = [
  [/presenta|cut|corte/i, "cube"],
  [/storage|conserva|almacen/i, "target"],
  [/ingredient|note|nota|vitamin/i, "leaf"],
  [/applica|aplica|use|uso/i, "bowl"],
  [/instruc|direction|indica|modo/i, "check"]
];
const factIcon = (label: string) => FACT_ICONS.find(([pattern]) => pattern.test(label))?.[1] ?? "document";

function FactsView({ content, ctx }: { content: FactsContent; ctx: Ctx }) {
  const hasDetails = content.details.length > 0;
  return (
    <div className={hasDetails ? "pdc-split pdc-split--facts" : "pdc-split pdc-split--single"}>
      <div className="pdc-panel pdc-facts">
        {content.intro.length > 0 && (
          <div className="pdc-intro">
            <Items items={content.intro} ctx={ctx} />
          </div>
        )}
        {content.facts.map((fact, index) => (
          <Fragment key={index}>
            {fact.caption && (
              <h4 className="pdc-facts__caption" lang={fact.captionLang}>
                {fact.caption}
              </h4>
            )}
            <dl className="pdc-facts__grid" lang={fact.lang}>
              {fact.rows.map(([label, value], position) => (
                <div key={`${position}-${label}`} className="pdc-fact">
                  <span className="pdc-icon" aria-hidden="true">
                    <Icon name={factIcon(label)} strokeWidth={1.6} />
                  </span>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </Fragment>
        ))}
      </div>
      {hasDetails && (
        <div className="pdc-panel pdc-details">
          {content.details.map((group, index) => (
            <GroupCard key={index} group={group} ctx={ctx} id={`pdc-detail-${index}`} className="pdc-prose" />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- C: technical-specification ----------

function TechnicalView({ content, ctx }: { content: TechnicalContent; ctx: Ctx }) {
  return (
    <>
      {content.identifiers.length > 0 && (
        <ul className="pdc-identifiers">
          {content.identifiers.map((identifier, index) => (
            <li key={`${index}-${identifier.text}`} lang={identifier.lang}>
              {identifier.text}
            </li>
          ))}
        </ul>
      )}
      <div className="pdc-panels" data-count={content.panels.length}>
        {content.panels.map((group, index) => (
          <GroupCard key={index} group={group} ctx={ctx} id={`pdc-panel-${index}`} className="pdc-panel pdc-spec" />
        ))}
      </div>
    </>
  );
}

// ---------- D: product-range-features ----------

function RangeView({ content, ctx }: { content: RangeContent; ctx: Ctx }) {
  if (content.arrangement === "reference-collection") {
    const total = content.references.reduce((sum, group) => sum + group.models.length, 0);
    return (
      <div className={content.intro.length ? "pdc-split pdc-split--range" : "pdc-split pdc-split--single"}>
        <div className="pdc-collection">
          <p className="pdc-count">{ctx.labels.references.replace("{count}", String(total))}</p>
          {content.references.map((group, index) => (
            <section
              key={index}
              className="pdc-collection__group"
              {...(group.label ? { "aria-labelledby": `pdc-group-${index}` } : {})}
            >
              {group.label && (
                <h3 id={`pdc-group-${index}`} lang={group.labelLang}>
                  {/* Wix repeats the label after each model of a group; it is shown once. */}
                  {group.label}
                </h3>
              )}
              <ul className="pdc-models">
                {group.models.map((model, position) => (
                  <li key={position}>
                    <GroupCard
                      group={model}
                      ctx={ctx}
                      id={`pdc-model-${index}-${position}`}
                      className="pdc-model"
                      headingLevel={group.label ? 4 : 3}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        {content.intro.length > 0 && (
          <aside className="pdc-panel pdc-aside" aria-label={ctx.labels.featuresTitle}>
            <p className="pdc__eyebrow">{ctx.labels.featuresTitle}</p>
            <Items items={content.intro} ctx={ctx} />
          </aside>
        )}
      </div>
    );
  }
  return (
    <div className="pdc-features-wrap">
      {content.intro.length > 0 && (
        <div className="pdc-intro pdc-intro--lead">
          <Items items={content.intro} ctx={ctx} />
        </div>
      )}
      <div className="pdc-features">
        {content.features.map((group, index) =>
          group.items.length === 0 && !group.link ? (
            // A published heading with no text of its own introduces the blocks after it.
            <p key={index} className="pdc-features__title" lang={group.headingLang}>
              {group.heading}
            </p>
          ) : (
            <GroupCard
              key={index}
              group={group}
              ctx={ctx}
              id={`pdc-feature-${index}`}
              className={
                group.items.some((item) => item.type === "links" || item.type === "specs")
                  ? "pdc-card pdc-card--wide"
                  : "pdc-card"
              }
            />
          )
        )}
      </div>
    </div>
  );
}

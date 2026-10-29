import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import type { Locale } from "@/src/i18n/config";
import type { Item } from "@/src/migration/content";
import { legacyLinkLabel } from "@/src/migration/manifest";
import {
  heightsByVolume,
  isDefinitions,
  isValueRow,
  parseMeasurement,
  referenceColumn,
  splitReference,
  type ContentGroup,
  type FactsContent,
  type FormatsContent,
  type ProductContent,
  type RangeContent,
  type ReferenceColumn,
  type TechnicalContent,
  type TechnicalPanel
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
  value: string;
  unit: string;
  condition: string;
  volume: string;
  openHeight: string;
  table: string;
  properties: string;
  notes: string;
  reference: string;
  type: string;
  rangeTitle: string;
  featuresTitle: string;
  references: string;
  viewProduct: string;
  productReferences: string;
};

type Ctx = { locale: Locale; labels: ProductContentLabels; technical: boolean };

/**
 * Product-information section of every product-detail page (below the hero), in one of four
 * layouts chosen per page by src/migration/product-content.ts:
 * - formats-overview: format groups with chips + overview (side by side only when both have
 *   comparable content, otherwise stacked);
 * - facts-applications: a light fact grid (storage, presentation, applications, instructions)
 *   and uses; descriptive notes (e.g. vitamins) are shown as notes, not as specifications;
 * - technical-specification: semantic tables (value / unit / condition columns where the
 *   published cell has them), definition lists for one-value properties, height-by-volume
 *   tables parsed from the published can dimensions;
 * - product-range-features: a comparison table of bottle references, or editorial sections.
 * Server component; every published heading, paragraph, list, table row and link is rendered in
 * order, with its `lang`. Nothing is added: no values, methods, images or downloads.
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
  const ctx: Ctx = { locale, labels, technical: content.variant === "technical-specification" };
  // The heading names what the page has: no "product overview" without an overview.
  const formatsOnly = content.variant === "formats-overview" && !content.overview.length && !content.notes.length;
  const title =
    content.variant === "product-range-features" && content.arrangement === "reference-collection"
      ? labels.productReferences
      : formatsOnly
        ? labels.formatsPanel
        : {
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
        <div className="pdc__body legacy-detail__content">
          {content.variant === "formats-overview" && <FormatsView content={content} ctx={ctx} />}
          {content.variant === "facts-applications" && <FactsView content={content} ctx={ctx} />}
          {content.variant === "technical-specification" && <TechnicalView content={content} ctx={ctx} />}
          {content.variant === "product-range-features" && <RangeView content={content} ctx={ctx} />}
        </div>
      </div>
    </section>
  );
}

// ---------- Shared primitives ----------

function ItemView({ item, ctx }: { item: Item; ctx: Ctx }) {
  const lang = "lang" in item ? item.lang : undefined;
  switch (item.type) {
    case "p":
      return <Paragraph text={item.text} lang={lang} ctx={ctx} />;
    case "h3":
      return <h4 lang={lang}>{item.text}</h4>;
    case "ul": {
      // A list of "92 mm for 250 ml" can heights reads as the Volume | Height table.
      const heights = ctx.technical ? item.items.map((entry) => heightsByVolume(entry)) : [];
      if (heights.length && heights.every((pairs) => pairs.length === 1))
        return <HeightTable pairs={heights.flat()} ctx={ctx} lang={lang} />;
      return (
        <ul className="pdc-list" lang={lang}>
          {item.items.map((entry, index) => (
            <li key={`${index}-${entry}`}>{entry}</li>
          ))}
        </ul>
      );
    }
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

/**
 * A paragraph; on technical pages, a sentence that publishes three or more "92 mm for 250 ml"
 * pairs is followed by the same pairs as a table (the sentence stays).
 */
function Paragraph({ text, lang, ctx }: { text: string; lang?: "en"; ctx: Ctx }) {
  const pairs = ctx.technical ? heightsByVolume(text) : [];
  return (
    <>
      <p lang={lang}>{text}</p>
      {pairs.length >= 3 && <HeightTable pairs={pairs} ctx={ctx} lang={lang} />}
    </>
  );
}

const Items = ({ items, ctx }: { items: Item[]; ctx: Ctx }) => (
  <>
    {items.map((item, index) => (
      <ItemView key={index} item={item} ctx={ctx} />
    ))}
  </>
);

/** Tables may scroll sideways on narrow screens: the region is focusable so keyboards can scroll it. */
function TableWrap({ ctx, className, children }: { ctx: Ctx; className?: string; children: ReactNode }) {
  return (
    <div
      className={className ? `pdc-table-wrap ${className}` : "pdc-table-wrap"}
      role="region"
      aria-label={ctx.labels.table}
      tabIndex={0}
    >
      {children}
    </div>
  );
}

function HeightTable({ pairs, ctx, lang }: { pairs: { height: string; volume: string }[]; ctx: Ctx; lang?: "en" }) {
  return (
    <TableWrap ctx={ctx}>
      <table className="pdc-table pdc-table--compare" lang={lang}>
        <thead>
          <tr>
            <th scope="col">{ctx.labels.volume}</th>
            <th scope="col">{ctx.labels.openHeight}</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair, index) => (
            <tr key={`${index}-${pair.volume}`}>
              <th scope="row">{pair.volume}</th>
              <td>{pair.height}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

/**
 * A published table.
 * - Every cell an "X mm for Y ml" pair (can heights): Volume | Open can height.
 * - Technical measurements (most rows parse as value + unit/condition): Parameter | Value | Unit
 *   | Condition or method — the cells of a row, read in order, are the published text.
 * - Otherwise label/value rows under Parameter / Specification; rows whose two cells are both
 *   values (e.g. fill volumes "200 ml" | "250 ml") stay plain cells.
 */
function SpecTable({ rows, lang, ctx }: { rows: [string, string][]; lang?: "en"; ctx: Ctx }) {
  const heights = rows.flat().map((cell) => heightsByVolume(cell));
  if (ctx.technical && heights.every((pairs) => pairs.length === 1))
    return <HeightTable pairs={heights.flat()} ctx={ctx} lang={lang} />;

  const values = rows.every(isValueRow);
  const measures = rows.map(([, value]) => parseMeasurement(value));
  const measured = ctx.technical && !values && measures.filter(Boolean).length >= Math.max(2, rows.length / 2);
  if (measured) {
    const hasUnit = measures.some((measure) => measure?.unit);
    const hasCondition = measures.some((measure) => measure?.condition);
    return (
      <TableWrap ctx={ctx}>
        <table className="pdc-table pdc-table--measures" lang={lang}>
          <thead>
            <tr>
              <th scope="col">{ctx.labels.parameter}</th>
              <th scope="col">{ctx.labels.value}</th>
              {hasUnit && <th scope="col">{ctx.labels.unit}</th>}
              {hasCondition && <th scope="col">{ctx.labels.condition}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, value], index) => {
              const measure = measures[index];
              return (
                <tr key={`${index}-${label}`}>
                  <th scope="row">{label}</th>
                  {measure ? (
                    <>
                      <td className="pdc-num">{measure.value}</td>
                      {hasUnit && <td>{measure.unit}</td>}
                      {hasCondition && <td>{measure.condition}</td>}
                    </>
                  ) : (
                    <td colSpan={1 + Number(hasUnit) + Number(hasCondition)}>{value}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrap>
    );
  }

  return (
    <TableWrap ctx={ctx}>
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
    </TableWrap>
  );
}

/** A titled group: heading (h3), its items and the product link the page published with it. */
function GroupCard({
  group,
  ctx,
  id,
  className,
  headingLevel = 3,
  children
}: {
  group: ContentGroup;
  ctx: Ctx;
  id: string;
  className: string;
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

const textLength = (groups: ContentGroup[]) =>
  groups.reduce(
    (sum, group) =>
      sum +
      (group.heading?.length ?? 0) +
      group.items.reduce((total, item) => total + ("text" in item ? item.text.length : 0), 0),
    0
  );

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
  const hasOverview = content.overview.length > 0 || content.notes.length > 0;
  // Side by side when the overview has a few sentences next to several format rows; otherwise a
  // compact stack at reading width (formats above, text below).
  const sideBySide =
    hasOverview &&
    content.formats.length >= 3 &&
    textLength(content.overview) + content.notes.reduce((sum, note) => sum + note.text.length, 0) >= 120;
  return (
    <div className={sideBySide ? "pdc-split pdc-split--formats" : "pdc-stack pdc-stack--compact"}>
      {/* Without an overview the section heading already says "Available formats". */}
      <section className="pdc-surface pdc-formats" aria-labelledby={hasOverview ? "pdc-formats" : "pdc-title"}>
        {hasOverview && (
          <h3 id="pdc-formats" lang={content.formatsHeadingLang}>
            {content.formatsHeading ?? ctx.labels.formatsPanel}
          </h3>
        )}
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
      {hasOverview && (
        <div className="pdc-overview pdc-measure">
          <p className="pdc-label">{ctx.labels.overview}</p>
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

// ---------- D (IQF): facts-applications ----------

const FACT_ICONS: [RegExp, IconName][] = [
  [/presenta|cut|corte/i, "cube"],
  [/storage|conserva|almacen/i, "target"],
  [/ingredient/i, "leaf"],
  [/applica|aplica|use|uso/i, "bowl"],
  [/instruc|direction|indica|modo/i, "check"]
];
const factIcon = (label: string) => FACT_ICONS.find(([pattern]) => pattern.test(label))?.[1] ?? "document";
/** Descriptive notes (e.g. "Additional Notes: Vitamin C…"): shown as notes, not as specifications. */
const isNote = (label: string) => /note|nota/i.test(label);

function FactsView({ content, ctx }: { content: FactsContent; ctx: Ctx }) {
  return (
    <div className={content.details.length ? "pdc-split pdc-split--facts" : "pdc-stack"}>
      <div className="pdc-facts">
        {content.intro.length > 0 && (
          <div className="pdc-intro pdc-measure">
            <Items items={content.intro} ctx={ctx} />
          </div>
        )}
        {content.facts.map((fact, index) => {
          const facts = fact.rows.filter(([label]) => !isNote(label));
          const notes = fact.rows.filter(([label]) => isNote(label));
          return (
            <Fragment key={index}>
              {fact.caption && (
                <h4 className="pdc-facts__caption" lang={fact.captionLang}>
                  {fact.caption}
                </h4>
              )}
              {facts.length > 0 && (
                <dl className="pdc-facts__grid" lang={fact.lang}>
                  {facts.map(([label, value], position) => (
                    <div key={`${position}-${label}`} className="pdc-fact">
                      <span className="pdc-icon" aria-hidden="true">
                        <Icon name={factIcon(label)} strokeWidth={1.6} />
                      </span>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {notes.length > 0 && (
                <dl className="pdc-notes" lang={fact.lang}>
                  {notes.map(([label, value], position) => (
                    <div key={`${position}-${label}`}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Fragment>
          );
        })}
      </div>
      {content.details.length > 0 && (
        <div className="pdc-surface pdc-details">
          {content.details.map((group, index) => (
            <GroupCard key={index} group={group} ctx={ctx} id={`pdc-detail-${index}`} className="pdc-prose" />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- B: technical-specification ----------

function TechnicalView({ content, ctx }: { content: TechnicalContent; ctx: Ctx }) {
  // An untitled panel of plain sentences is the page's description: it reads above the
  // specification panels instead of taking a card of its own (e.g. the can pages).
  const isIntro = (panel: TechnicalPanel) =>
    !isDefinitions(panel) && !panel.heading && panel.items.every((item) => item.type === "p");
  const intro = content.panels.filter(isIntro);
  const panels = content.panels.filter((panel) => !isIntro(panel));
  return (
    <>
      {intro.length > 0 && (
        <div className="pdc-intro pdc-measure">
          {intro.map((panel, index) => (
            <Items key={index} items={isDefinitions(panel) ? [] : panel.items} ctx={ctx} />
          ))}
        </div>
      )}
      {content.identifiers.length > 0 && (
        <ul className="pdc-identifiers">
          {content.identifiers.map((identifier, index) => (
            <li key={`${index}-${identifier.text}`} lang={identifier.lang}>
              {identifier.text}
            </li>
          ))}
        </ul>
      )}
      <div className="pdc-panels" data-count={panels.length}>
        {panels.map((panel, index) =>
          isDefinitions(panel) ? (
            <section key={index} className="pdc-surface pdc-spec" aria-labelledby={`pdc-panel-${index}`}>
              <h3 id={`pdc-panel-${index}`}>{ctx.labels.properties}</h3>
              <dl className="pdc-definitions">
                {panel.definitions.map((entry, position) => (
                  <div key={`${position}-${entry.term}`}>
                    <dt lang={entry.termLang}>{entry.term}</dt>
                    <dd>
                      {entry.item.type === "ul" ? (
                        <span lang={entry.item.lang}>{entry.item.items[0]}</span>
                      ) : (
                        <ItemView item={entry.item} ctx={ctx} />
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : (
            <GroupCard key={index} group={panel} ctx={ctx} id={`pdc-panel-${index}`} className="pdc-surface pdc-spec" />
          )
        )}
      </div>
    </>
  );
}

// ---------- C: product-range-features ----------

const COLUMNS: ReferenceColumn[] = ["capacity", "diameter", "height", "finish"];

const applicationKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/\b(bottles?|botellas?|de)\b/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
const sameApplication = (type: string, label: string) => applicationKey(type) === applicationKey(label);

/** Bottle references as one comparison table, grouped under their published group labels. */
function ReferenceTable({ content, ctx }: { content: RangeContent; ctx: Ctx }) {
  const models = content.references.flatMap((group) => group.models);
  const rowsOf = (model: ContentGroup) => model.items.flatMap((item) => (item.type === "specs" ? item.rows : []));
  // Column headers are the published labels (first occurrence), e.g. "Filling Capacity (cc)".
  const headers = new Map<ReferenceColumn, string>();
  const extra: string[] = [];
  for (const model of models)
    for (const [label] of rowsOf(model)) {
      const column = referenceColumn(label);
      if (column && !headers.has(column)) headers.set(column, label);
      else if (!column && !extra.includes(label)) extra.push(label);
    }
  const columns = COLUMNS.filter((column) => headers.has(column));
  // The application column is left out when every row's application is its group heading
  // ("Wine Bottle - 524818" under "Wine"); the full reference stays in the row header.
  const hasType = content.references.some((group) =>
    group.models.some((model) => {
      const { type } = splitReference(model.heading ?? "");
      return type && !(group.label && sameApplication(type, group.label));
    })
  );
  const span = 1 + Number(hasType) + columns.length + extra.length;
  return (
    <TableWrap ctx={ctx} className="pdc-surface pdc-surface--table">
      <table className="pdc-table pdc-table--references">
        <thead>
          <tr>
            <th scope="col">{ctx.labels.reference}</th>
            {hasType && <th scope="col">{ctx.labels.type}</th>}
            {columns.map((column) => (
              <th key={column} scope="col">
                {headers.get(column)}
              </th>
            ))}
            {extra.map((label) => (
              <th key={label} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        {content.references.map((group, index) => (
          <tbody key={index}>
            {group.label && (
              <tr className="pdc-table__group">
                <th colSpan={span} scope="rowgroup" lang={group.labelLang}>
                  {group.label}
                </th>
              </tr>
            )}
            {group.models.map((model, position) => {
              const { type, code } = splitReference(model.heading ?? "");
              const rows = rowsOf(model);
              const cell = (match: (label: string) => boolean) => rows.find(([label]) => match(label))?.[1] ?? "";
              return (
                <tr key={position}>
                  <th scope="row" lang={model.headingLang}>
                    {/* The full published heading names the row; its code is what is shown. */}
                    <span className="visually-hidden">{model.heading}</span>
                    <span aria-hidden="true" className="pdc-num">
                      {code}
                    </span>
                  </th>
                  {hasType && <td>{type}</td>}
                  {columns.map((column) => (
                    <td key={column} className="pdc-num">
                      {cell((label) => referenceColumn(label) === column)}
                    </td>
                  ))}
                  {extra.map((label) => (
                    <td key={label}>{cell((candidate) => candidate === label)}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
    </TableWrap>
  );
}

function RangeView({ content, ctx }: { content: RangeContent; ctx: Ctx }) {
  if (content.arrangement === "reference-collection") {
    const total = content.references.reduce((sum, group) => sum + group.models.length, 0);
    return (
      <div className="pdc-stack">
        {content.intro.length > 0 && (
          <div className="pdc-intro pdc-measure">
            <Items items={content.intro} ctx={ctx} />
          </div>
        )}
        <p className="pdc-count">{ctx.labels.references.replace("{count}", String(total))}</p>
        <ReferenceTable content={content} ctx={ctx} />
      </div>
    );
  }
  return (
    <div className="pdc-editorial">
      {content.intro.length > 0 && (
        <div className="pdc-intro pdc-measure">
          <Items items={content.intro} ctx={ctx} />
        </div>
      )}
      {content.features.map((group, index) =>
        group.items.length === 0 && !group.link ? (
          // A published heading with no text of its own introduces the sections after it.
          <p key={index} className="pdc-label" lang={group.headingLang}>
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
                ? "pdc-section pdc-section--wide"
                : "pdc-section"
            }
          />
        )
      )}
    </div>
  );
}

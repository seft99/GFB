import type { Item, Section } from "./content.ts";
import { familyOf } from "./families.ts";
import { isTechnicalResource } from "./product-resources.ts";

/**
 * Product-detail content (the section below the product hero), presented with one of four
 * approved layouts. The data stays the crawled page content (src/migration/legacy-content.json);
 * this module only arranges it into typed blocks, in source order and without dropping or
 * rewriting anything — `contentStrings` lets tests prove each arrangement is lossless.
 *
 * - formats-overview: concentrates (a formats table + editorial overview).
 * - facts-applications: individual IQF formats (fact cards + uses / handling).
 * - technical-specification: specification pages (analysis, microbiology, dimensions…) and the
 *   individual can, can-end and closure product pages (materials, coatings, dimensions).
 * - product-range-features: model collections (bottles) and feature/range pages (packaging
 *   products, labels, red grape varieties, range overviews).
 */

export type ProductContentVariant =
  "formats-overview" | "facts-applications" | "technical-specification" | "product-range-features";

/** Families by layout; technical specification pages are recognised first (isTechnicalResource). */
const FORMAT_FAMILIES = new Set([
  "citrus-concentrates",
  "mediterranean-concentrates",
  "tropical-concentrates",
  "red-fruit-concentrates",
  "vegetable-concentrates",
  "plant-based-concentrates"
]);
const IQF_FAMILIES = new Set(["iqf-lemon", "iqf-orange", "iqf-lime", "iqf-grapefruit"]);
/** IQF range overview pages (not one format): shown as range pages. */
const IQF_OVERVIEWS = new Set(["/frozen-lemon"]);
/** Packaging families whose individual product pages are technical data (not their hubs). */
const PACKAGING_TECHNICAL = new Set(["aluminium-cans", "can-ends", "crown-corks"]);

export type VariantDecision = { variant: ProductContentVariant; reason: string };

/** Explicit, auditable variant of a detail page (docs/product-detail-content-audit.md). */
export function productContentVariant(path: string): VariantDecision {
  const family = familyOf(path);
  if (!family) throw new Error(`No family for ${path}`);
  if (isTechnicalResource(path))
    return { variant: "technical-specification", reason: "Specification page (analysis tables or paired spec sheet)" };
  if (PACKAGING_TECHNICAL.has(family.id) && family.hub !== path)
    return { variant: "technical-specification", reason: "Can, can-end or closure product: materials and dimensions" };
  if (FORMAT_FAMILIES.has(family.id))
    return { variant: "formats-overview", reason: "Concentrate product page: available formats + overview" };
  if (IQF_FAMILIES.has(family.id) && family.hub !== path && !IQF_OVERVIEWS.has(path))
    return { variant: "facts-applications", reason: "Individual IQF format: published facts + uses" };
  return {
    variant: "product-range-features",
    reason:
      family.id === "bottle-formats"
        ? "Bottle application page: reference collection of published models"
        : "Product, range or overview page with descriptive features"
  };
}

// ---------- Block model ----------

/** A run of items under an optional title (an h3 inside a section, or the section heading). */
export type ContentGroup = { heading?: string; headingLang?: "en"; link?: string; items: Item[] };

/** A specification table row whose cells are both values (e.g. "200ml" | "250ml"). */
export const isValueRow = (row: [string, string]) => /^\d/.test(row[0].trim()) && /^\d/.test(row[1].trim());

/** Format rows are short lists; long cells are editorial text published inside the table. */
const LONG_CELL = 140;

export type FormatRow = { label: string; values: string[]; lang?: "en" };

export type FormatsContent = {
  variant: "formats-overview";
  formatsHeading?: string;
  formatsHeadingLang?: "en";
  formats: FormatRow[];
  /** Long table cells (e.g. "Oat Benefits") kept as labelled text, not as format chips. */
  notes: { label: string; text: string; lang?: "en" }[];
  overview: ContentGroup[];
};

export type FactsContent = {
  variant: "facts-applications";
  intro: Item[];
  /** Fact rows, in order; `caption` is an h3 published between two fact tables. */
  facts: { caption?: string; captionLang?: "en"; rows: [string, string][]; lang?: "en" }[];
  details: ContentGroup[];
};

export type DefinitionEntry = { term: string; termLang?: "en"; item: Item };

/** A technical panel: a titled group, or consecutive one-value groups consolidated as a list. */
export type TechnicalPanel = ContentGroup | { definitions: DefinitionEntry[] };

export type TechnicalContent = {
  variant: "technical-specification";
  /** Section headings published without content (identifiers such as "D57.4 mm"). */
  identifiers: { text: string; lang?: "en" }[];
  panels: TechnicalPanel[];
};

export const isDefinitions = (panel: TechnicalPanel): panel is { definitions: DefinitionEntry[] } =>
  "definitions" in panel;

export type RangeContent = {
  variant: "product-range-features";
  arrangement: "reference-collection" | "feature-editorial";
  intro: Item[];
  /**
   * reference-collection: model cards grouped under the published group labels. Wix repeats the
   * label after every model of a group; `repeats` keeps that count (nothing is dropped). Groups
   * with the same label are one group (Wix interleaves them on /water), models in published order.
   */
  references: { label?: string; labelLang?: "en"; repeats: number; models: ContentGroup[] }[];
  /** feature-editorial: titled blocks (section headings, or h3 subsections). */
  features: ContentGroup[];
};

export type ProductContent = FormatsContent | FactsContent | TechnicalContent | RangeContent;

const splitValues = (value: string) => value.split(/,\s+/).filter(Boolean);

/** Splits a section's items into h3-led groups (items before the first h3 form an untitled group). */
function subgroups(section: Section): ContentGroup[] {
  const groups: ContentGroup[] = [];
  let current: ContentGroup = { items: [] };
  for (const item of section.items) {
    if (item.type === "h3") {
      if (current.items.length || current.heading) groups.push(current);
      current = { heading: item.text, ...(item.lang ? { headingLang: item.lang } : {}), items: [] };
    } else current.items.push(item);
  }
  if (current.items.length || current.heading) groups.push(current);
  return groups;
}

const asGroup = (section: Section): ContentGroup => ({
  ...(section.heading ? { heading: section.heading } : {}),
  ...(section.headingLang ? { headingLang: section.headingLang } : {}),
  ...(section.link ? { link: section.link } : {}),
  items: section.items
});

function formatsContent(sections: Section[]): FormatsContent {
  const index = sections.findIndex((section) => section.items.some((item) => item.type === "specs"));
  const table = sections[index];
  const formats: FormatRow[] = [];
  const notes: FormatsContent["notes"] = [];
  const overview: ContentGroup[] = [];
  for (const item of table?.items ?? [])
    if (item.type === "specs")
      for (const [label, value] of item.rows)
        if (value.length > LONG_CELL) notes.push({ label, text: value, ...(item.lang ? { lang: item.lang } : {}) });
        else formats.push({ label, values: splitValues(value), ...(item.lang ? { lang: item.lang } : {}) });
    else overview.push({ items: [item] });
  sections.forEach((section, position) => {
    if (position === index) return;
    // A heading with a one-line list is one more format group ("Deionized concentrates").
    const only = section.items.length === 1 ? section.items[0] : undefined;
    if (section.heading && only?.type === "ul" && only.items.length === 1 && only.items[0].length <= LONG_CELL)
      formats.push({ label: section.heading, values: only.items, ...(only.lang ? { lang: only.lang } : {}) });
    else overview.push(asGroup(section));
  });
  return {
    variant: "formats-overview",
    ...(table?.heading ? { formatsHeading: table.heading } : {}),
    ...(table?.headingLang ? { formatsHeadingLang: table.headingLang } : {}),
    formats,
    notes,
    overview
  };
}

function factsContent(sections: Section[]): FactsContent {
  const [first, ...rest] = sections;
  const intro: Item[] = [];
  const facts: FactsContent["facts"] = [];
  const details: ContentGroup[] = [];
  let caption: { text: string; lang?: "en" } | undefined;
  let afterFacts: Item[] = [];
  // An h3 not followed by a fact table stays as text, in place.
  const flushCaption = () => {
    if (caption) afterFacts.push({ type: "h3", text: caption.text, ...(caption.lang ? { lang: caption.lang } : {}) });
    caption = undefined;
  };
  for (const item of first?.heading ? [] : (first?.items ?? [])) {
    if (item.type === "specs") {
      facts.push({
        ...(caption ? { caption: caption.text, ...(caption.lang ? { captionLang: caption.lang } : {}) } : {}),
        rows: item.rows,
        ...(item.lang ? { lang: item.lang } : {})
      });
      caption = undefined;
      afterFacts = [];
    } else if (item.type === "h3" && facts.length) {
      flushCaption();
      caption = { text: item.text, ...(item.lang ? { lang: item.lang } : {}) };
    } else if (facts.length) {
      flushCaption();
      afterFacts.push(item);
    } else intro.push(item);
  }
  flushCaption();
  if (afterFacts.length) details.push({ items: afterFacts });
  for (const section of first?.heading ? sections : rest) details.push(asGroup(section));
  return { variant: "facts-applications", intro, facts, details };
}

/**
 * A group that is one titled value — "Internal lacquer specs: PVC Free", "Dimensions: <one
 * paragraph>" — reads better as an entry of a definition list than as its own card.
 */
const singleValue = (group: ContentGroup) => {
  if (!group.heading || group.link || group.items.length !== 1) return undefined;
  const [item] = group.items;
  if (item.type === "p") return item;
  if (item.type === "ul" && item.items.length === 1 && item.items[0].length <= 80) return item;
  return undefined;
};

function technicalContent(sections: Section[]): TechnicalContent {
  const identifiers: TechnicalContent["identifiers"] = [];
  const groups: ContentGroup[] = [];
  for (const section of sections) {
    if (section.heading && section.items.length === 0)
      identifiers.push({ text: section.heading, ...(section.headingLang ? { lang: section.headingLang } : {}) });
    else if (section.heading) groups.push(asGroup(section));
    else groups.push(...subgroups(section));
  }
  // Two or more consecutive one-value groups become one definition list.
  const panels: TechnicalPanel[] = [];
  let run: DefinitionEntry[] = [];
  const flush = () => {
    if (run.length >= 2) panels.push({ definitions: run });
    else if (run.length === 1)
      panels.push({
        heading: run[0].term,
        ...(run[0].termLang ? { headingLang: run[0].termLang } : {}),
        items: [run[0].item]
      });
    run = [];
  };
  for (const group of groups) {
    const item = singleValue(group);
    if (item) run.push({ term: group.heading!, ...(group.headingLang ? { termLang: group.headingLang } : {}), item });
    else {
      flush();
      panels.push(group);
    }
  }
  flush();
  return { variant: "technical-specification", identifiers, panels };
}

/** A one-entry list after a model's table labels the models that follow (Wix layout). */
const groupLabel = (item: Item | undefined) =>
  item?.type === "ul" && item.items.length === 1 && item.items[0].length <= 60 ? item : undefined;

function rangeContent(sections: Section[], collection: boolean): RangeContent {
  const intro: Item[] = [];
  if (collection) {
    const references: RangeContent["references"] = [];
    let group: RangeContent["references"][number] = { repeats: 0, models: [] };
    const keep = () => {
      if ((group.models.length || group.label) && !references.includes(group)) references.push(group);
    };
    const startGroup = (item: Extract<Item, { type: "ul" }>) => {
      if (group.label === item.items[0]) {
        group.repeats++;
        return;
      }
      keep();
      const existing = references.find((candidate) => candidate.label === item.items[0]);
      if (existing) {
        existing.repeats++;
        group = existing;
      } else group = { label: item.items[0], ...(item.lang ? { labelLang: item.lang } : {}), repeats: 0, models: [] };
    };
    for (const section of sections) {
      const label = groupLabel(section.items.at(-1));
      const items = label ? section.items.slice(0, -1) : section.items;
      if (!section.heading) intro.push(...items);
      else group.models.push({ ...asGroup(section), items });
      if (label) startGroup(label);
    }
    keep();
    return { variant: "product-range-features", arrangement: "reference-collection", intro, references, features: [] };
  }
  const features: ContentGroup[] = [];
  sections.forEach((section, position) => {
    const parts = subgroups(section);
    if (!section.heading && position === 0 && parts.length === 1 && !parts[0].heading) intro.push(...parts[0].items);
    else if (!section.heading) features.push(...parts);
    else if (parts.some((part) => part.heading)) {
      features.push({ ...asGroup(section), items: [] });
      features.push(...parts);
    } else features.push(asGroup(section));
  });
  return { variant: "product-range-features", arrangement: "feature-editorial", intro, references: [], features };
}

export function productContent(path: string, sections: Section[]): ProductContent {
  const { variant } = productContentVariant(path);
  switch (variant) {
    case "formats-overview":
      return formatsContent(sections);
    case "facts-applications":
      return factsContent(sections);
    case "technical-specification":
      return technicalContent(sections);
    case "product-range-features":
      return rangeContent(sections, familyOf(path)?.id === "bottle-formats");
  }
}

// ---------- Losslessness (tests) ----------

const itemStrings = (item: Item): string[] => {
  switch (item.type) {
    case "p":
    case "h3":
      return [item.text];
    case "ul":
      return item.items;
    case "specs":
      return item.rows.flat();
    case "links":
      return item.paths;
  }
};
const groupStrings = (group: ContentGroup) => [
  ...(group.heading ? [group.heading] : []),
  ...(group.link ? [group.link] : []),
  ...group.items.flatMap(itemStrings)
];

/** Every published string of the page content (headings, text, list entries, cells, links). */
export const sourceStrings = (sections: Section[]) =>
  sections.flatMap((section) => groupStrings(asGroup(section))).sort();

/** The same strings as found in an arranged model; equal to `sourceStrings` when lossless. */
export function contentStrings(content: ProductContent): string[] {
  const out: string[] = [];
  switch (content.variant) {
    case "formats-overview":
      if (content.formatsHeading) out.push(content.formatsHeading);
      for (const row of content.formats) out.push(row.label, row.values.join(", "));
      for (const note of content.notes) out.push(note.label, note.text);
      out.push(...content.overview.flatMap(groupStrings));
      break;
    case "facts-applications":
      out.push(...content.intro.flatMap(itemStrings));
      for (const fact of content.facts) out.push(...(fact.caption ? [fact.caption] : []), ...fact.rows.flat());
      out.push(...content.details.flatMap(groupStrings));
      break;
    case "technical-specification":
      out.push(...content.identifiers.map((identifier) => identifier.text));
      for (const panel of content.panels)
        if (isDefinitions(panel))
          for (const entry of panel.definitions) out.push(entry.term, ...itemStrings(entry.item));
        else out.push(...groupStrings(panel));
      break;
    case "product-range-features":
      out.push(...content.intro.flatMap(itemStrings));
      for (const group of content.references)
        out.push(
          ...(group.label ? Array(group.repeats + 1).fill(group.label) : []),
          ...group.models.flatMap(groupStrings)
        );
      out.push(...content.features.flatMap(groupStrings));
      break;
  }
  return out.sort();
}

// ---------- Derived presentations (parsed from published text; nothing added) ----------

/**
 * A published measurement split at its own word boundaries into value, unit and condition or
 * method, so a table can show them in columns while the cells, read in order, still give the
 * published text ("67 - 69" | "" | "@ 20 °C"; "< 150" | "NTU" | "At 16 °Brix").
 */
export type Measurement = { value: string; unit?: string; condition?: string };
const MEASURE_VALUE =
  /^([<>≤≥]\s*)?(\d[\d.,]*(?:\s*[-–]\s*\d[\d.,]*)?|negative|positive|absent|negativo|positivo|ausente)(?=\s|$)/i;
const CONDITION_START = /^(?:@|(?:at|a|by|por|mediante|según)\b)/i;
const METHOD_WORD = /(metry|metría|method|método|williams|welch)/i;

export function parseMeasurement(cell: string): Measurement | undefined {
  const match = cell.match(MEASURE_VALUE);
  if (!match) return undefined;
  const value = match[0].trim();
  const rest = cell.slice(match[0].length).trim();
  if (!rest) return { value };
  if (CONDITION_START.test(rest) || METHOD_WORD.test(rest.split(/\s+/)[0])) return { value, condition: rest };
  const split = rest.match(/^(.*?)\s+((?:@|at|a|by|por|mediante|según)\s.*)$/i);
  if (split) return { value, unit: split[1], condition: split[2] };
  return METHOD_WORD.test(rest) ? { value, condition: rest } : { value, unit: rest };
}

/** "92 mm for 250 ml" pairs published in a cell or a sentence (can heights by fill volume). */
const HEIGHT_FOR_VOLUME = /(\d+(?:[.,]\d+)?\s?mm)\s+(?:for|para)\s+(\d+(?:[.,]\d+)?\s?ml)/gi;
export function heightsByVolume(text: string): { height: string; volume: string }[] {
  return [...text.matchAll(HEIGHT_FOR_VOLUME)].map((match) => ({ height: match[1], volume: match[2] }));
}

/** Comparison columns of bottle references, keyed from the published labels. */
export type ReferenceColumn = "capacity" | "diameter" | "height" | "finish";
export const referenceColumn = (label: string): ReferenceColumn | undefined =>
  /capac/i.test(label)
    ? "capacity"
    : /di[aá]m/i.test(label)
      ? "diameter"
      : /height|altura/i.test(label)
        ? "height"
        : /finish|acabado|boca/i.test(label)
          ? "finish"
          : undefined;

/** "Soft Drinks - 455020" → type and reference code (the published heading stays the row name). */
export function splitReference(heading: string): { type?: string; code: string } {
  const match = heading.match(/^(.*?)\s*-\s*([A-Z0-9][\w./-]*)$/i);
  return match && match[1] ? { type: match[1].trim(), code: match[2] } : { code: heading };
}

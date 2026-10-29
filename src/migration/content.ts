/**
 * Turns the ordered text blocks crawled from a legacy Wix page into semantic sections for the
 * legacy detail template: headings, paragraphs, label/value specification rows, lists and
 * spec tables. It keeps every factual block and records the ones withheld for review
 * (health/benefit claims and manufacturing claims that the verified company scope does not
 * support), so nothing is dropped silently. Pure and dependency-free.
 */

export type RawBlock = { tag: string; text: string };

export type Item =
  | { type: "p"; text: string; lang?: "en" }
  | { type: "h3"; text: string; lang?: "en" }
  | { type: "ul"; items: string[]; lang?: "en" }
  | { type: "specs"; rows: [string, string][]; lang?: "en" }
  /** Product references the legacy page linked to (legacy paths, labelled at render time). */
  | { type: "links"; paths: string[] };

/** `link`: legacy path the original page linked from this section's heading. */
export type Section = { heading?: string; headingLang?: "en"; link?: string; items: Item[] };

export type Processed = {
  h1: string;
  eyebrow?: string;
  sections: Section[];
  excluded: {
    text: string;
    reason: "health-claim" | "manufacturing-claim" | "benefits-section" | "empty-heading" | "not-available";
  }[];
};

const IGNORED = new Set(["contact us", "read more", "contáctanos", "contactanos", "leer más", "ver más", "more"]);

/** Visible typos and brand misspellings from the legacy pages. */
const TYPOS: [RegExp, string | ((match: string) => string)][] = [
  // Literal machine translation of "crown corks" on the Spanish pages.
  [/\bCORONA CORCHOS\b/g, "TAPAS CORONA"],
  [/\bCorona corchos\b/gi, "Tapas corona"],
  [/\bAlluminium\b/g, "Aluminium"],
  [/\bsuvignon\b/gi, (match) => (match === match.toUpperCase() ? "SAUVIGNON" : "Sauvignon")],
  [/\bSof Drinks\b/g, "Soft Drinks"],
  [/\bGBF\b/g, "GFB"],
  [/&rsquo;/g, "’"]
];

const HEALTH =
  /\b(health|healthy|nutrients?|nutrition|nutritious|immune|antioxidants?|cholesterol|diseases?|digestion|digestive|nourish\w*|ally|daily recommended|benefits?|beneficios?|salud|saludable|nutrientes)\b/i;
const MANUFACTURING =
  /\b(we manufacture|manufactures|manufacturing of|we make|have the technology to manufacture|fabricamos|fabrica)\b/i;
const BENEFITS_HEADING = /\b(benefits|beneficios)\b/i;
/**
 * Concentrate pages (`strictClaims`): nutrition, health, composition and energy statements about
 * the fruit. They describe the fresh fruit, not a substantiated property of the concentrate, so
 * they are withheld like other health claims (recorded in `excluded`, listed for review).
 */
const NUTRITION =
  /\b(health\w*|nutri\w*|immun\w*|antioxidant\w*|cholesterol|ldl|diseases?|degenerat\w*|digest\w*|intestin\w*|laxative|diuretic|antiseptic|astringent|anthelmintic|inflammat\w*|anti-inflammatory|blood pressure|hypertension|ana?emia|heartburn|sight|calori\w*|sugars?|fib(?:re|er)|vitamins?|minerals?|potassium|magnes\w*|iron|manganese|sodium|phosphorus|calcium|selenium|zinc|polyphenols?|flavonoids?|naring\w*|carotenes?|carotenoids?|lutein|zeaxanthin|tannins?|folates?|folic|pregnan\w*|aging|ageing|brain|energ\w*|revitaliz\w*|well-being|wellbeing|glucem\w*|glycem\w*|proteins?|satiat\w*|weight|diets?|benefi\w*|allies|ally|body|organism|phytochemicals?|beta-glucans?|haemostatic|hemostatic|blood|circulation|antibacterial|anti-?cancer\w*|cancer|cosmetic\w*|moisturi[sz]\w*|hair|skin|salud\w*|vitamina\w*|minerales|fibra|colesterol|enfermedad\w*)\b|\d+(?:[.,]\d+)?\s*%/i;

const ACRONYM = /^(IQF|RGJC|SOT|ISE|PVC|BPA|PET|TPC|TAB|NFC|AA\d+|H\d+|D\d+|R-?\d+|PMS|UFC|NTU|SO2|pH|CO2|EN|GFB)$/i;

/** Sentence case for ALL-CAPS legacy headings, keeping codes and acronyms. */
export function displayCase(value: string): string {
  // Units and the dimension "x" are lowercase even in all-caps names ("IQF ORANGE 13 x 13 STICKS").
  const letters = value.replace(/\b(mm|cm|ml|cc|nm|kg|grs?|x)\b/g, "");
  if (!/[A-Z]/.test(letters) || letters !== letters.toUpperCase()) return value;
  const words = value.toLowerCase().split(/(\s+)/);
  return words
    .map((word, index) => {
      const original = value.split(/(\s+)/)[index] ?? word;
      if (ACRONYM.test(original) || /\d/.test(original)) return original;
      return index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    })
    .join("");
}

const ENTITIES: Record<string, string> = {
  ordm: "º",
  deg: "°",
  rsquo: "’",
  lsquo: "‘",
  ldquo: "“",
  rdquo: "”",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  nbsp: " ",
  amp: "&",
  quot: '"',
  lt: "<",
  gt: ">",
  aacute: "á",
  eacute: "é",
  iacute: "í",
  oacute: "ó",
  uacute: "ú",
  ntilde: "ñ",
  uuml: "ü",
  Aacute: "Á",
  Eacute: "É",
  Iacute: "Í",
  Oacute: "Ó",
  Uacute: "Ú",
  Ntilde: "Ñ",
  iexcl: "¡",
  iquest: "¿",
  sup2: "²",
  sup3: "³",
  micro: "µ",
  times: "×",
  plusmn: "±"
};

export function cleanText(value: string): string {
  const decoded = value
    .replace(/&([a-zA-Z]+\d?);/g, (entity, name: string) => ENTITIES[name] ?? entity)
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)));
  return TYPOS.reduce(
    (text, [pattern, replacement]) =>
      typeof replacement === "string" ? text.replace(pattern, replacement) : text.replace(pattern, replacement),
    decoded
  ).trim();
}

/**
 * "Healthy (hand-)selected grapes" describes the raw material (sound fruit), not a health
 * benefit: it is ignored by the health-claim check so product overviews are not withheld.
 */
const SOUND_FRUIT =
  /\bhealthy\b(?=,?\s+(?:and\s+)?(?:hand-|carefully\s+)?selected\b)|(?<=\bselected,?\s+)healthy\b(?=\s+grapes\b)/gi;
const isHeadingLike = (text: string) => text.length <= 70 && !text.includes("\n") && !/[.!?]$/.test(text);
const isProse = (line: string) => line.length > 60 && !/^[^:]{2,40}:\s/.test(line);
const claimReason = (text: string, strict = false) =>
  MANUFACTURING.test(text)
    ? "manufacturing-claim"
    : isProse(text) && HEALTH.test(text.replace(SOUND_FRUIT, ""))
      ? "health-claim"
      : strict && text.length > 30 && NUTRITION.test(text.replace(SOUND_FRUIT, ""))
        ? "health-claim"
        : null;

/** Start of the "available formats" heading pairs of concentrate pages. */
const FORMATS_START = /^(concentrates?|concentrados?|available formats|formatos disponibles)$/i;
/** Product-type labels Wix repeats as a lone heading further down some pages. */
const TYPE_LABEL = /^(frozen fruits|frutas congeladas)$/i;

/** Parses a multi-line paragraph into label/value rows, bullet lists, subheadings and prose. */
function parseLines(text: string, excluded: Processed["excluded"], strict = false): Item[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const items: Item[] = [];
  const push = (item: Item) => {
    const last = items.at(-1);
    if (item.type === "specs" && last?.type === "specs") last.rows.push(...item.rows);
    else if (item.type === "ul" && last?.type === "ul") last.items.push(...item.items);
    else items.push(item);
  };
  lines.forEach((line, index) => {
    const reason = claimReason(line, strict);
    if (reason) return void excluded.push({ text: line, reason });
    const pair = line.match(/^([^:]{2,40}?)\s*:\s*(.+)$/);
    // Short "Label: value" lines are specification rows; a long value is prose with a lead-in.
    if (pair && !/https?$/i.test(pair[1]) && pair[2].length <= 90)
      return push({ type: "specs", rows: [[pair[1].trim(), pair[2].trim()]] });
    if (/^[-•–]\s*/.test(line)) return push({ type: "ul", items: [line.replace(/^[-•–]\s*/, "")] });
    const next = lines[index + 1];
    if (isHeadingLike(line) && line.length <= 60 && next && next.length > line.length + 20)
      return push({ type: "h3", text: displayCase(line) });
    push({ type: "p", text: line });
  });
  return items;
}

/** A run of short single-line paragraphs: label/value pairs when it alternates, otherwise a list. */
function shortRun(run: string[]): Item {
  // "Levadura < 10 UFC/grs" (label and value merged in one block) → two cells.
  const flat = run
    .flatMap((value) => value.split("\n"))
    .flatMap((value) => {
      const merged = value.match(/^(\D+?)\s+([<>≤≥]\s*\d.*)$/);
      return merged ? [merged[1], merged[2]] : [value];
    });
  const looksPaired = flat.length >= 4 && flat.length % 2 === 0;
  if (looksPaired) {
    const rows: [string, string][] = [];
    for (let index = 0; index < flat.length; index += 2) rows.push([flat[index], flat[index + 1]]);
    return { type: "specs", rows };
  }
  return { type: "ul", items: flat };
}

/**
 * Removes headings with nothing under them. A run of empty section headings that the legacy
 * page linked to product pages becomes a list of links in the preceding section; a lone
 * product-type label becomes the eyebrow; any other empty heading is recorded and dropped.
 * An `h3` directly followed by another `h3` (or by nothing) is dropped the same way.
 */
function dropEmptyHeadings(processed: Processed): Processed {
  const excluded = [...processed.excluded];
  let eyebrow = processed.eyebrow;
  const sections: Section[] = [];
  for (const section of processed.sections) {
    const items = section.items.filter((item, index, all) => {
      const next = all[index + 1];
      if (item.type !== "h3" || (next && next.type !== "h3")) return true;
      excluded.push({ text: item.text, reason: "empty-heading" });
      return false;
    });
    if (items.length > 0) {
      sections.push({ ...section, items });
      continue;
    }
    if (section.link) {
      let host = sections.at(-1);
      if (!host) sections.push((host = { items: [] }));
      const last = host.items.at(-1);
      if (last?.type === "links") last.paths.push(section.link);
      else host.items.push({ type: "links", paths: [section.link] });
      continue;
    }
    if (section.heading && TYPE_LABEL.test(section.heading)) eyebrow ??= section.heading;
    else if (section.heading) excluded.push({ text: section.heading, reason: "empty-heading" });
  }
  return { ...processed, eyebrow, sections, excluded };
}

export function processBlocks(
  blocks: RawBlock[],
  options: {
    formatsHeading: string;
    /** Legacy path the original page linked from a heading with this text, if any. */
    linkFor?: (heading: string) => string | undefined;
    /** Drop empty headings (see dropEmptyHeadings); otherwise they are kept as crawled. */
    dropEmpty?: boolean;
    /** Concentrate pages: also withhold nutrition/health headings, text and table cells (NUTRITION). */
    strictClaims?: boolean;
  }
): Processed {
  const cleaned = blocks
    .map((block) => ({ tag: block.tag, text: cleanText(block.text) }))
    .filter((block) => block.text && !IGNORED.has(block.text.toLowerCase()));
  const h1 = displayCase(cleaned.find((block) => block.tag === "h1")?.text ?? "");
  const rest = cleaned.filter(
    (block, index) => !(block.tag === "h1" && block.text.toUpperCase() === h1.toUpperCase() && index >= 0)
  );
  const excluded: Processed["excluded"] = [];
  const sections: Section[] = [];
  let section: Section = { items: [] };
  const flush = () => {
    if (section.heading || section.items.length) sections.push(section);
    section = { items: [] };
  };

  let index = 0;
  let eyebrow: string | undefined;
  // Product-type label right after the H1 (e.g. "Frozen Fruits", "Ring Pull Closure").
  const firstH3 = rest[0];
  if (firstH3?.tag === "h3" && firstH3.text.length <= 40 && !FORMATS_START.test(firstH3.text)) {
    eyebrow = displayCase(firstH3.text);
    index = 1;
  }

  // Concentrate pages: pairs of h3 (format family, available forms). Some pages open with
  // "Available formats" + a sentence instead of a "Concentrate" row.
  if (rest[index]?.tag === "h3" && FORMATS_START.test(rest[index].text)) {
    const rows: [string, string][] = [];
    const items: Item[] = [];
    while (rest[index]?.tag === "h3" && rest[index + 1]?.tag === "h3") {
      const label = rest[index].text;
      const value = rest[index + 1].text.replace(/\n/g, ", ");
      if (/^(available formats|formatos disponibles)$/i.test(label)) items.push({ type: "p", text: value });
      else if (options.strictClaims && (BENEFITS_HEADING.test(label) || (value.length > 140 && NUTRITION.test(value))))
        // "Oat Benefits": health text published inside the formats table.
        excluded.push({ text: `${label}: ${value}`, reason: "health-claim" });
      else if (!/^not apply$/i.test(value)) rows.push([displayCase(label), value]);
      index += 2;
    }
    if (rows.length) items.push({ type: "specs", rows });
    sections.push({ heading: options.formatsHeading, items });
  }

  let skippingBenefits = false;
  let run: string[] = [];
  const flushRun = () => {
    if (run.length) section.items.push(run.length >= 4 ? shortRun(run) : { type: "ul", items: run });
    run = [];
  };

  for (; index < rest.length; index++) {
    const { tag, text } = rest[index];
    const heading = /^h[1-6]$/.test(tag) && isHeadingLike(text);
    if (heading) {
      flushRun();
      if (BENEFITS_HEADING.test(text)) {
        skippingBenefits = true;
        excluded.push({ text, reason: "benefits-section" });
        continue;
      }
      skippingBenefits = false;
      flush();
      if (options.strictClaims && NUTRITION.test(text)) {
        // A claim used as a heading: the text after it stays, without that heading.
        excluded.push({ text, reason: "health-claim" });
        continue;
      }
      section.heading = displayCase(text);
      const link = options.linkFor?.(text);
      if (link) section.link = link;
      continue;
    }
    if (skippingBenefits) {
      excluded.push({ text, reason: "benefits-section" });
      continue;
    }
    // "Not apply" under a format heading means the format is not offered (as in the formats table).
    if (options.strictClaims && /^(not apply|no aplica)$/i.test(text)) {
      excluded.push({ text: section.heading ? `${section.heading}: ${text}` : text, reason: "not-available" });
      if (section.items.length === 0) section.heading = undefined;
      continue;
    }
    const reason = !text.includes("\n") ? claimReason(text, options.strictClaims) : null;
    if (reason) {
      excluded.push({ text, reason });
      continue;
    }
    if (tag === "li") {
      flushRun();
      const last = section.items.at(-1);
      if (last?.type === "ul") last.items.push(text);
      else section.items.push({ type: "ul", items: [text] });
      continue;
    }
    if (tag === "p" && text.length <= 60 && text.split("\n").length <= 2) {
      // Gallery captions that only repeat the page name carry no information.
      if (text.toUpperCase() !== h1.toUpperCase()) run.push(text);
      continue;
    }
    flushRun();
    section.items.push(...parseLines(text, excluded, options.strictClaims));
  }
  flushRun();
  flush();
  if (options.dropEmpty) return dropEmptyHeadings({ h1, eyebrow, sections, excluded });
  return { h1, eyebrow, sections: sections.filter((item) => item.items.length > 0 || item.heading), excluded };
}

/**
 * Typographic normalisation of units in published content (not in H1s or metadata): "330ml" →
 * "330 ml", "66mm" → "66 mm", "20 ºC" → "20 °C", "ºBrix" → "°Brix", "SO2" → "SO₂". Meaning,
 * values and codes are unchanged.
 */
export function normalizeUnits(value: string): string {
  return (
    value
      .replace(/(\d)\s*[º°]\s*C\b/g, "$1 °C")
      .replace(/[º°]\s*Brix\b/g, "°Brix")
      .replace(/\bSO2\b/g, "SO₂")
      .replace(/(\d)(ml|mm|cc|kg|nm)\b/g, "$1 $2")
      // A trailing " _" left by the page layout after some bottle heights ("122.5mm _").
      .replace(/\s+_$/, "")
  );
}

const normalizeItem = (item: Item): Item => {
  switch (item.type) {
    case "p":
    case "h3":
      return { ...item, text: normalizeUnits(item.text) };
    case "ul":
      return { ...item, items: item.items.map(normalizeUnits) };
    case "specs":
      return { ...item, rows: item.rows.map(([label, value]) => [normalizeUnits(label), normalizeUnits(value)]) };
    case "links":
      return item;
  }
};

/** `normalizeUnits` over every heading and item of the page content. */
export const normalizeSections = (sections: Section[]): Section[] =>
  sections.map((section) => ({
    ...section,
    ...(section.heading ? { heading: normalizeUnits(section.heading) } : {}),
    items: section.items.map(normalizeItem)
  }));

const EN_WORDS = new Set(
  "the and of with for is are to in our your from that this it be by on as an can which their these was have will or all".split(
    " "
  )
);
const ES_WORDS = new Set(
  "el la los las de del y en con para por que es son una un su sus al lo se como más este esta o".split(" ")
);

/** Stop-word heuristic: English prose left untranslated on a Spanish page. */
export function looksEnglish(value: string): boolean {
  const words = value.toLowerCase().match(/[a-záéíóúñü]+/g) ?? [];
  const en = words.filter((word) => EN_WORDS.has(word)).length;
  const es = words.filter((word) => ES_WORDS.has(word)).length;
  return en >= 2 && en > es;
}

const itemText = (item: Item) =>
  item.type === "specs"
    ? item.rows.flat().join(" ")
    : item.type === "ul"
      ? item.items.join(" ")
      : item.type === "links"
        ? ""
        : item.text;

/**
 * Marks items of a Spanish page that are still English (identical to the English page or
 * English prose), so they carry `lang="en"` and are reported as translation gaps.
 */
export function markUntranslated(processed: Processed, english: Processed): Processed {
  const englishTexts = new Set(
    english.sections.flatMap((section) => [section.heading ?? "", ...section.items.map(itemText)])
  );
  const isEnglish = (value: string) => englishTexts.has(value) || looksEnglish(value);
  return {
    ...processed,
    sections: processed.sections.map((section) => ({
      ...section,
      ...(section.heading && isEnglish(section.heading) ? { headingLang: "en" as const } : {}),
      items: section.items.map((item) =>
        item.type !== "links" && isEnglish(itemText(item)) ? { ...item, lang: "en" as const } : item
      )
    }))
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A usable meta description: not empty, not an internal identifier, one line, ≤ 160 chars. */
export function usableDescription(value: string | null | undefined): string | undefined {
  if (!value || UUID.test(value.trim())) return undefined;
  const line = cleanText(value).replace(/\s*\n\s*/g, " · ");
  if (line.length < 30) return undefined;
  return truncate(line, 160);
}

export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  const sentence = cut.lastIndexOf(". ");
  return sentence > max * 0.5 ? cut.slice(0, sentence + 1) : `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export function firstProse(processed: Processed): string | undefined {
  for (const section of processed.sections)
    for (const item of section.items) if (item.type === "p" && item.text.length > 60) return item.text;
  return undefined;
}

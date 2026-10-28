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
  | { type: "specs"; rows: [string, string][]; lang?: "en" };

export type Section = { heading?: string; headingLang?: "en"; items: Item[] };

export type Processed = {
  h1: string;
  eyebrow?: string;
  sections: Section[];
  excluded: { text: string; reason: "health-claim" | "manufacturing-claim" | "benefits-section" }[];
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

const isHeadingLike = (text: string) => text.length <= 70 && !text.includes("\n") && !/[.!?]$/.test(text);
const isProse = (line: string) => line.length > 60 && !/^[^:]{2,40}:\s/.test(line);
const claimReason = (text: string) =>
  MANUFACTURING.test(text) ? "manufacturing-claim" : isProse(text) && HEALTH.test(text) ? "health-claim" : null;

/** Parses a multi-line paragraph into label/value rows, bullet lists, subheadings and prose. */
function parseLines(text: string, excluded: Processed["excluded"]): Item[] {
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
    const reason = claimReason(line);
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

export function processBlocks(blocks: RawBlock[], options: { formatsHeading: string }): Processed {
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
  if (firstH3?.tag === "h3" && firstH3.text.length <= 40 && !/^(concentrates?|concentrados?)$/i.test(firstH3.text)) {
    eyebrow = displayCase(firstH3.text);
    index = 1;
  }

  // Concentrate pages: pairs of h3 (format family, available forms).
  if (rest[index]?.tag === "h3" && /^(concentrates?|concentrados?)$/i.test(rest[index].text)) {
    const rows: [string, string][] = [];
    while (rest[index]?.tag === "h3" && rest[index + 1]?.tag === "h3") {
      const value = rest[index + 1].text.replace(/\n/g, ", ");
      if (!/^not apply$/i.test(value)) rows.push([displayCase(rest[index].text), value]);
      index += 2;
    }
    sections.push({ heading: options.formatsHeading, items: [{ type: "specs", rows }] });
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
      section.heading = displayCase(text);
      continue;
    }
    if (skippingBenefits) {
      excluded.push({ text, reason: "benefits-section" });
      continue;
    }
    const reason = !text.includes("\n") ? claimReason(text) : null;
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
    section.items.push(...parseLines(text, excluded));
  }
  flushRun();
  flush();
  return { h1, eyebrow, sections: sections.filter((item) => item.items.length > 0 || item.heading), excluded };
}

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
  item.type === "specs" ? item.rows.flat().join(" ") : item.type === "ul" ? item.items.join(" ") : item.text;

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
      items: section.items.map((item) => (isEnglish(itemText(item)) ? { ...item, lang: "en" as const } : item))
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

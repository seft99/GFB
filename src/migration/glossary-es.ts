/**
 * Closed-vocabulary Spanish names for legacy product pages whose Spanish Wix version kept the
 * English name. Only product-type words are translated; commercial names and codes (Merlot,
 * RGJC R-600, RipCap, 202, ISE, SOT) stay unchanged. Anything outside this vocabulary keeps
 * its English text and is reported as a translation gap instead of being guessed.
 */

const FRUIT: Record<string, string> = { lemon: "limón", orange: "naranja", lime: "lima", grapefruit: "pomelo" };

const IQF_CUTS: [RegExp, (fruit: string) => string][] = [
  [/^IQF (\w+) half slices?(.*)$/i, (fruit) => `Medias rodajas de ${fruit} IQF`],
  [/^IQF (\w+) slices?(.*)$/i, (fruit) => `Rodajas de ${fruit} IQF`],
  [/^IQF (\w+) (?:one fourths|1\/4) cut$/i, (fruit) => `${cap(fruit)} IQF en cuartos`],
  [/^IQF (\w+) (?:one eights|1\/8) cut$/i, (fruit) => `${cap(fruit)} IQF en octavos`],
  [/^IQF (\w+) 13 x 13 sticks$/i, (fruit) => `Bastones de ${fruit} IQF 13 x 13`],
  [/^IQF (\w+) sticks$/i, (fruit) => `Bastones de ${fruit} IQF`],
  [/^IQF (\w+) julienne cut$/i, (fruit) => `${cap(fruit)} IQF en juliana`],
  [/^IQF (\w+) peel shells$/i, (fruit) => `Cáscaras de ${fruit} IQF`],
  [/^IQF (\w+) peel square$/i, (fruit) => `Piel de ${fruit} IQF en cuadrados`],
  [/^IQF (\w+) zest$/i, (fruit) => `Ralladura de ${fruit} IQF`],
  [/^Frozen block (\w+) zest$/i, (fruit) => `Bloque congelado de ralladura de ${fruit}`]
];

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const PRODUCT_NAMES: Record<string, string> = {
  "Standard can": "Lata estándar",
  "Sleek can": "Lata sleek",
  "Slim can": "Lata slim",
  "52mm (202) Dia Aluminium End": "Tapa de aluminio de 52 mm (202) de diámetro",
  "52mm (202) Dia ISE Aluminium End": "Tapa de aluminio ISE de 52 mm (202) de diámetro",
  "Crown Cork Bottle Caps": "Tapas corona para botellas",
  "26 mm Ring Crown Cap": "Tapa corona con anilla de 26 mm",
  "Oat concentrate": "Concentrado de avena",
  "Almond concentrate": "Concentrado de almendra"
};

/** Spanish product name for an English legacy name, or undefined when it is not covered. */
export function productNameEs(english: string): string | undefined {
  if (PRODUCT_NAMES[english]) return PRODUCT_NAMES[english];
  const normalized = english.replace(/\s+\d+\s*\/\s*\d+\s*mm$/i, "").trim();
  const size = english.match(/(\d+\s*\/\s*\d+\s*mm)$/i)?.[1];
  for (const [pattern, build] of IQF_CUTS) {
    const match = normalized.match(pattern);
    const fruit = match && FRUIT[match[1].toLowerCase()];
    if (fruit) return size ? `${build(fruit)} ${size.replace(/\s+/g, " ")}` : build(fruit);
  }
  return undefined;
}

const FORMAT_LABELS: Record<string, string> = {
  Concentrate: "Concentrado",
  Concentrates: "Concentrados",
  "Juices & purees": "Zumos y purés",
  Organics: "Ecológicos",
  Cells: "Celdas",
  "Essential oils": "Aceites esenciales",
  "Deionized concentrates": "Concentrados desionizados"
};

const FORMAT_VALUES: [RegExp, (fruit: string) => string][] = [
  [/^Juice concentrate cloudy$/i, () => "Concentrado de zumo turbio"],
  [/^Juice concentrate clear$/i, () => "Concentrado de zumo clarificado"],
  [/^Juice concentrate$/i, () => "Concentrado de zumo"],
  [/^Puree concentrate$/i, () => "Concentrado de puré"],
  [/^Juice$/i, () => "Zumo"],
  [/^Puree$/i, () => "Puré"],
  [/^Puree with seeds$/i, () => "Puré con semillas"],
  [/^Puree without seeds$/i, () => "Puré sin semillas"],
  [/^.+ essential oil$/i, (fruit) => `Aceite esencial de ${fruit}`],
  [/^.+ deionized concentrate$/i, (fruit) => `Concentrado desionizado de ${fruit}`],
  [/^.+ cells$/i, (fruit) => `Celdas de ${fruit}`],
  [/^.+ sacs$/i, (fruit) => `Vesículas de ${fruit}`]
];

/** Translates one "available formats" row of a fruit/vegetable concentrate page. */
export function formatRowEs([label, value]: [string, string], fruit: string): [string, string] {
  const values = value.split(", ").map((item) => {
    for (const [pattern, build] of FORMAT_VALUES) if (pattern.test(item)) return build(fruit);
    return item;
  });
  return [FORMAT_LABELS[label] ?? label, values.join(", ")];
}

export function formatLabelEs(label: string): string {
  return FORMAT_LABELS[label] ?? label;
}

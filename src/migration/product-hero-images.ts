import type { LocalizedText } from "../i18n/config.ts";
import { familyOf } from "./families.ts";

/**
 * Image of each product-detail hero (components/sections/product-detail-hero.tsx), by legacy path.
 * Licensed photographs and commercially documented generated illustrations only — see
 * docs/product-image-audit.md. Every asset is illustrative: it shows the fruit, ingredient or
 * packaging family, never a guaranteed GFB product, dimension, concentrate, format or facility.
 */

export type HeroPhoto = { src: string; alt: LocalizedText; position?: string };

const P = "/images/products/hero";
const G = "/images/generated";
const t = (en: string, es: string): LocalizedText => ({ en, es });
const photo = (name: string, alt: LocalizedText, position?: string): HeroPhoto => ({
  src: `${P}/${name}.webp`,
  alt,
  ...(position ? { position } : {})
});
const generated = (name: string, alt: LocalizedText, position?: string): HeroPhoto => ({
  src: `${G}/${name}.webp`,
  alt,
  ...(position ? { position } : {})
});
const iqfGenerated = (name: string, en: string, es: string): HeroPhoto => ({
  src: `${G}/iqf/${name}.webp`,
  alt: t(`Generated illustration of IQF ${en}`, `Ilustración generada de ${es} IQF`)
});

/**
 * Route-specific IQF visuals. Each image contains one cut or presentation only, so a buyer never
 * has to infer which item in a family assortment corresponds to the product title.
 */
const iqfSubjects: Record<string, HeroPhoto> = {
  "lemon-slices": iqfGenerated("lemon-slices", "lemon slices", "rodajas de limón"),
  "lemon-half-slices": iqfGenerated("lemon-half-slices", "lemon half slices", "medias rodajas de limón"),
  "lemon-quarter-cuts": iqfGenerated("lemon-quarter-cuts", "lemon quarter cuts", "cortes de limón en cuartos"),
  "lemon-eighth-cuts": iqfGenerated("lemon-eighth-cuts", "lemon eighth cuts", "cortes de limón en octavos"),
  "lemon-sticks-13x13": iqfGenerated(
    "lemon-sticks-13x13",
    "13 × 13 mm lemon sticks",
    "bastones de limón de 13 × 13 mm"
  ),
  "lemon-zest-exact": iqfGenerated("lemon-zest", "lemon zest", "ralladura de limón"),
  "lemon-zest-block": iqfGenerated(
    "lemon-zest-block",
    "frozen lemon zest block",
    "bloque congelado de ralladura de limón"
  ),
  "lemon-peel-shells": iqfGenerated("lemon-peel-shells", "lemon peel shells", "cáscaras de limón"),
  "lemon-peel-squares": iqfGenerated("lemon-peel-squares", "lemon peel squares", "cuadrados de piel de limón"),
  "orange-slices": iqfGenerated("orange-slices", "orange slices", "rodajas de naranja"),
  "orange-half-slices": iqfGenerated("orange-half-slices", "orange half slices", "medias rodajas de naranja"),
  "orange-quarter-cuts": iqfGenerated("orange-quarter-cuts", "orange quarter cuts", "cortes de naranja en cuartos"),
  "orange-eighth-cuts": iqfGenerated("orange-eighth-cuts", "orange eighth cuts", "cortes de naranja en octavos"),
  "orange-sticks-13x13": iqfGenerated(
    "orange-sticks-13x13",
    "13 × 13 mm orange sticks",
    "bastones de naranja de 13 × 13 mm"
  ),
  "orange-julienne": iqfGenerated("orange-julienne", "orange julienne", "juliana de naranja"),
  "orange-zest-exact": iqfGenerated("orange-zest", "orange zest", "ralladura de naranja"),
  "orange-zest-block": iqfGenerated(
    "orange-zest-block",
    "frozen orange zest block",
    "bloque congelado de ralladura de naranja"
  ),
  "orange-peel-shells": iqfGenerated("orange-peel-shells", "orange peel shells", "cáscaras de naranja"),
  "orange-peel-squares": iqfGenerated("orange-peel-squares", "orange peel squares", "cuadrados de piel de naranja"),
  "lime-slices": iqfGenerated("lime-slices", "lime slices", "rodajas de lima"),
  "lime-half-slices": iqfGenerated("lime-half-slices", "lime half slices", "medias rodajas de lima"),
  "lime-quarter-cuts": iqfGenerated("lime-quarter-cuts", "lime quarter cuts", "cortes de lima en cuartos"),
  "lime-eighth-cuts": iqfGenerated("lime-eighth-cuts", "lime eighth cuts", "cortes de lima en octavos"),
  "lime-sticks-13x13": iqfGenerated("lime-sticks-13x13", "13 × 13 mm lime sticks", "bastones de lima de 13 × 13 mm"),
  "lime-zest-exact": iqfGenerated("lime-zest", "lime zest", "ralladura de lima"),
  "grapefruit-slices": iqfGenerated("grapefruit-slices", "pink grapefruit slices", "rodajas de pomelo rosa"),
  "grapefruit-half-slices": iqfGenerated(
    "grapefruit-half-slices",
    "pink grapefruit half slices",
    "medias rodajas de pomelo rosa"
  ),
  "grapefruit-quarter-cuts": iqfGenerated(
    "grapefruit-quarter-cuts",
    "pink grapefruit quarter cuts",
    "cortes de pomelo rosa en cuartos"
  ),
  "grapefruit-eighth-cuts": iqfGenerated(
    "grapefruit-eighth-cuts",
    "pink grapefruit eighth cuts",
    "cortes de pomelo rosa en octavos"
  )
};

/** One photograph per subject (fruit, vegetable, ingredient or packaging type). */
const subjects: Record<string, HeroPhoto> = {
  ...iqfSubjects,
  orange: photo("orange", t("Two oranges with leaves", "Dos naranjas con hojas"), "50% 55%"),
  lime: photo("lime", t("A lime cut in half", "Una lima cortada por la mitad")),
  "blood-orange": photo("blood-orange", t("A blood orange cut in half", "Una naranja sanguina cortada por la mitad")),
  lemon: photo("lemon", t("Half a lemon", "Medio limón")),
  "pink-grapefruit": photo(
    "pink-grapefruit",
    t("A pink grapefruit cut in half", "Un pomelo rosa cortado por la mitad")
  ),
  tangerine: photo("tangerine", t("Tangerines, whole and peeled", "Mandarinas enteras y peladas")),
  apple: generated(
    "produce/apple-studio",
    t(
      "Generated illustration of whole and halved red apples",
      "Ilustración generada de manzanas rojas enteras y cortadas"
    )
  ),
  "white-grape": photo("white-grape", t("Green grapes in a wooden bowl", "Uvas verdes en un cuenco de madera")),
  persimmon: photo("persimmon", t("Persimmons", "Caquis"), "50% 60%"),
  "red-grape": photo("red-grape", t("Red grapes on a plate", "Uvas tintas en un plato"), "50% 45%"),
  peach: photo("peach", t("Peaches, one cut in half", "Melocotones, uno cortado por la mitad")),
  watermelon: photo("watermelon", t("A watermelon and a slice", "Una sandía y una tajada")),
  pear: generated(
    "produce/pear-studio",
    t(
      "Generated illustration of whole and halved green pears",
      "Ilustración generada de peras verdes enteras y cortadas"
    )
  ),
  pomegranate: photo("pomegranate", t("An open pomegranate and its seeds", "Una granada abierta y sus granos")),
  apricot: photo("apricot", t("Apricots, whole and halved", "Albaricoques enteros y partidos")),
  melon: photo("melon-studio", t("A ripe cantaloupe cut in half", "Un melón cantalupo maduro cortado por la mitad")),
  "passion-fruit": photo("passion-fruit-studio", t("A ripe passion fruit cut open", "Un maracuyá maduro abierto")),
  pineapple: photo("pineapple", t("A pineapple", "Una piña")),
  "pink-guava": generated(
    "produce/pink-guava-studio",
    t(
      "Generated illustration of whole and halved pink guavas",
      "Ilustración generada de guayabas rosas enteras y cortadas"
    )
  ),
  "white-guava": photo(
    "white-guava",
    t("Green guavas, one cut open to show its white flesh", "Guayabas verdes, una abierta con la pulpa blanca"),
    "55% 60%"
  ),
  tamarind: photo(
    "tamarind",
    t("A tamarind pod hanging from the tree", "Una vaina de tamarindo colgando del árbol"),
    "50% 55%"
  ),
  banana: photo("banana", t("A bunch of bananas", "Un racimo de plátanos")),
  mango: generated(
    "produce/mango-studio",
    t(
      "Generated illustration of whole and halved ripe mangoes",
      "Ilustración generada de mangos maduros enteros y cortados"
    )
  ),
  coconut: photo("coconut", t("Coconut halves", "Mitades de coco")),
  cranberry: photo("cranberry", t("Cranberries spilling from a jar", "Arándanos rojos saliendo de un tarro")),
  blueberry: photo("blueberry", t("Blueberries in a bowl", "Arándanos en un cuenco")),
  cherry: photo("cherry", t("A pair of cherries", "Un par de cerezas")),
  raspberry: photo("raspberry", t("Raspberries", "Frambuesas")),
  blackberry: photo("blackberry", t("Blackberries on the bush", "Moras en la planta")),
  strawberry: photo("strawberry", t("Strawberries", "Fresas")),
  turnip: generated(
    "produce/turnip-studio",
    t(
      "Generated illustration of whole and halved purple-top turnips",
      "Ilustración generada de nabos de cuello morado enteros y cortados"
    )
  ),
  pumpkin: photo("pumpkin", t("Pumpkins on a wooden table", "Calabazas sobre una mesa de madera")),
  tomato: photo("tomato", t("Tomatoes on the vine", "Tomates en rama")),
  beet: photo("beet", t("A bunch of beetroots", "Un manojo de remolachas"), "60% 50%"),
  pepper: photo("pepper", t("A red bell pepper", "Un pimiento rojo")),
  spinach: photo("spinach", t("A bunch of spinach", "Un manojo de espinacas")),
  celery: photo("celery", t("Celery stalks", "Tallos de apio")),
  cucumber: photo("cucumber", t("A cucumber and cucumber slices", "Un pepino y rodajas de pepino")),
  broccoli: photo("broccoli", t("Broccoli", "Brócoli")),
  carrot: photo("carrot", t("Carrots on a wooden table", "Zanahorias sobre una mesa de madera")),
  asparagus: photo("asparagus", t("A bunch of green asparagus", "Un manojo de espárragos verdes")),
  ginger: photo("ginger", t("Ginger root", "Raíz de jengibre")),
  oat: photo("oat", t("Rolled oats in a bowl", "Copos de avena en un cuenco")),
  almond: photo("almond", t("Almonds in a white bowl", "Almendras en un cuenco blanco")),
  "iqf-lemon": photo("iqf-lemon", t("Fresh lemon slices", "Rodajas de limón fresco")),
  "iqf-orange": photo("iqf-orange", t("Fresh orange slices", "Rodajas de naranja fresca")),
  "iqf-lime": photo("iqf-lime", t("Fresh lime halves", "Mitades de lima fresca"), "50% 65%"),
  "iqf-grapefruit": photo("iqf-grapefruit", t("Fresh grapefruit slices", "Rodajas de pomelo fresco")),
  "lemon-zest": photo(
    "lemon-zest",
    t("Lemon zest curls beside a lemon wedge", "Tiras de ralladura de limón junto a un gajo"),
    "60% 45%"
  ),
  "citrus-peel": photo(
    "citrus-peel",
    t("Pieces of fresh orange and lemon peel", "Trozos de piel fresca de naranja y limón")
  ),
  "soft-drinks": photo(
    "soft-drinks",
    t("A glass bottle beside a glass of orange drink", "Una botella de vidrio junto a un vaso de bebida de naranja"),
    "50% 45%"
  ),
  "alcoholic-beverages": photo(
    "alcoholic-beverages",
    t("An amber glass beer bottle", "Una botella de cerveza de vidrio ámbar")
  ),
  water: photo("water", t("A glass bottle of water beside a glass", "Una botella de agua de vidrio junto a un vaso")),
  // A single plain tall can: sleek (57 mm) and slim (53 mm) can pages; illustrative, unbranded.
  "plain-can": photo(
    "slim-can",
    t("A plain unprinted aluminium can", "Una lata de aluminio lisa sin impresión"),
    "50% 50%"
  ),
  // Commercially verified plain-can illustrations from Unsplash.
  // Plain unprinted cans (a 3D studio render per its Unsplash tags), 2571 × 2160: no upscaling.
  cans: photo(
    "cans-pair",
    t("Two plain aluminium cans, tall and standard", "Dos latas de aluminio lisas, alta y estándar"),
    "45% 55%"
  ),
  "can-ends": photo(
    "can-ends",
    t("Close-up of two aluminium can ends", "Primer plano de dos tapas de lata de aluminio"),
    "45% 40%"
  ),
  "white-grapefruit": generated(
    "white-grapefruit",
    t(
      "Generated illustration of a whole and halved white grapefruit",
      "Ilustración generada de un pomelo blanco entero y otro partido"
    )
  ),
  "label-types": generated(
    "label-types",
    t(
      "Generated illustration of three unbranded beverage label applications",
      "Ilustración generada de tres aplicaciones de etiquetas para bebidas sin marca"
    )
  ),
  "bottle-closures": generated(
    "bottle-closures",
    t(
      "Generated illustration of crown and ring-pull bottle closure formats",
      "Ilustración generada de formatos de cierre corona y con anilla para botellas"
    )
  ),
  "iqf-lemon-formats": generated(
    "iqf-lemon-formats",
    t("Generated illustration of assorted IQF lemon formats", "Ilustración generada de varios formatos IQF de limón")
  ),
  "iqf-orange-formats": generated(
    "iqf-orange-formats",
    t("Generated illustration of assorted IQF orange formats", "Ilustración generada de varios formatos IQF de naranja")
  ),
  "iqf-lime-formats": generated(
    "iqf-lime-formats",
    t("Generated illustration of assorted IQF lime formats", "Ilustración generada de varios formatos IQF de lima")
  ),
  "iqf-grapefruit-formats": generated(
    "iqf-grapefruit-formats",
    t(
      "Generated illustration of assorted IQF pink grapefruit formats",
      "Ilustración generada de varios formatos IQF de pomelo rosa"
    )
  )
};

/** IQF cut or presentation → one exact, isolated, documented visual. */
const IQF_CUT_PHOTOS: Record<string, string> = {
  "iqf-lemon-slices": "lemon-slices",
  "iqf-lemon-half-slices": "lemon-half-slices",
  "iqf-lemon-one-fourths-cut": "lemon-quarter-cuts",
  "iqf-lemon-one-eights-cut": "lemon-eighth-cuts",
  "iqf-lemon-sticks": "lemon-sticks-13x13",
  "iqf-lemon-zest": "lemon-zest-exact",
  "frozen-block-lemon-zest": "lemon-zest-block",
  "iqf-lemon-peel-shells": "lemon-peel-shells",
  "iqf-lemon-peel-square": "lemon-peel-squares",
  "iqf-orange-slices--6-%2F-9-mm": "orange-slices",
  "iqf-orange-half-slices-6-%2F-9-mm": "orange-half-slices",
  "iqf-orange-1%2F4--cut": "orange-quarter-cuts",
  "iqf-orange-1%2F8-cut": "orange-eighth-cuts",
  "iqf-orange-13-x-13-sticks": "orange-sticks-13x13",
  "iqf-orange-julienne-cut": "orange-julienne",
  "iqf-orange-zest": "orange-zest-exact",
  "frozen-block-orange-zest": "orange-zest-block",
  "iqf-orange-peel-shells": "orange-peel-shells",
  "iqf-orange-peel-square": "orange-peel-squares",
  "iqf-lime-slice--6-%2F-9-mm": "lime-slices",
  "iqf-lime-half-slices-6-%2F-9-mm": "lime-half-slices",
  "iqf-lime-1%2F4-cut": "lime-quarter-cuts",
  "iqf-lime-1%2F8-cut": "lime-eighth-cuts",
  "iqf-lime-13-x-13-sticks": "lime-sticks-13x13",
  "iqf-lime-zest": "lime-zest-exact",
  "iqf-grapefruit-slices": "grapefruit-slices",
  "iqf-grapefruit-half-slices": "grapefruit-half-slices",
  "iqf-grapefruit-one-fourths-cut": "grapefruit-quarter-cuts",
  "iqf-grapefruit-one-eights-cut": "grapefruit-eighth-cuts"
};

/** Subject of a legacy product page, or undefined when no suitable photograph exists. */
function subjectOf(path: string): string | undefined {
  const family = familyOf(path);
  if (!family) return undefined;
  const slug = path.split("/").pop() ?? "";
  switch (family.id) {
    case "red-grape-concentrates":
      return "red-grape";
    case "plant-based-concentrates":
      return slug.replace(/-concentrate$/, "");
    case "iqf-lemon":
    case "iqf-orange":
    case "iqf-lime":
    case "iqf-grapefruit":
      // Assortment composites belong only on family overviews; every product route is exact.
      if (path === family.hub || path === "/frozen-lemon") return `${family.id}-formats`;
      return IQF_CUT_PHOTOS[slug];
    case "bottle-formats":
      return { "soft-drinks": "soft-drinks", "alcoholic-beverage": "alcoholic-beverages", water: "water" }[slug];
    case "aluminium-cans":
      return /^(sleek|slim)-can/.test(slug) ? "plain-can" : "cans";
    case "can-ends":
      return "can-ends";
    case "crown-corks":
      return "bottle-closures";
    case "label-types":
      return "label-types";
    default:
      // Fruit and vegetable concentrates: /citrics/orange-concentrate, /mediterranean/apple…
      return family.id.endsWith("-concentrates") ? slug.replace(/-concentrate$/, "") : undefined;
  }
}

/** Product pages with no suitable publishable visual yet (business-status overviews stay intentional). */
export const missingHeroSubjects: string[] = [];

export function productHeroImage(path: string): HeroPhoto | undefined {
  const subject = subjectOf(path);
  return subject ? subjects[subject] : undefined;
}

/** Files referenced by the mapping (tests). */
export const heroImageFiles = Object.values(subjects).map((item) => item.src);

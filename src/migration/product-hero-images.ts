import type { LocalizedText } from "../i18n/config.ts";
import { familyOf } from "./families.ts";

/**
 * Photograph of each product-detail hero (components/sections/product-detail-hero.tsx), by legacy
 * path. Licensed (Unsplash License, verified per photo) or approved repository images only — see
 * docs/asset-provenance.md, "Product detail heroes". All photographs are illustrative: they show
 * the fruit, vegetable, ingredient or packaging type, never a GFB concentrate, frozen product,
 * format or facility. Pages without a suitable photograph (white grapefruit, IQF peel squares,
 * block zest, orange and lime zest, RipCaps, two label types, overviews) get the image-free layout.
 */

export type HeroPhoto = { src: string; alt: LocalizedText; position?: string };

const P = "/images/products/hero";
const t = (en: string, es: string): LocalizedText => ({ en, es });
const photo = (name: string, alt: LocalizedText, position?: string): HeroPhoto => ({
  src: `${P}/${name}.webp`,
  alt,
  ...(position ? { position } : {})
});

/** One photograph per subject (fruit, vegetable, ingredient or packaging type). */
const subjects: Record<string, HeroPhoto> = {
  orange: photo("orange", t("Two oranges with leaves", "Dos naranjas con hojas"), "50% 55%"),
  lime: photo("lime", t("A lime cut in half", "Una lima cortada por la mitad")),
  "blood-orange": photo("blood-orange", t("A blood orange cut in half", "Una naranja sanguina cortada por la mitad")),
  lemon: photo("lemon", t("Half a lemon", "Medio limón")),
  "pink-grapefruit": photo(
    "pink-grapefruit",
    t("A pink grapefruit cut in half", "Un pomelo rosa cortado por la mitad")
  ),
  tangerine: photo("tangerine", t("Tangerines, whole and peeled", "Mandarinas enteras y peladas")),
  apple: photo("apple", t("A red apple", "Una manzana roja")),
  "white-grape": photo("white-grape", t("Green grapes in a wooden bowl", "Uvas verdes en un cuenco de madera")),
  persimmon: photo("persimmon", t("Persimmons", "Caquis"), "50% 60%"),
  "red-grape": photo("red-grape", t("Red grapes on a plate", "Uvas tintas en un plato"), "50% 45%"),
  peach: photo("peach", t("Peaches, one cut in half", "Melocotones, uno cortado por la mitad")),
  watermelon: photo("watermelon", t("A watermelon and a slice", "Una sandía y una tajada")),
  pear: photo("pear", t("A green pear", "Una pera verde"), "50% 60%"),
  pomegranate: photo("pomegranate", t("An open pomegranate and its seeds", "Una granada abierta y sus granos")),
  apricot: photo("apricot", t("Apricots, whole and halved", "Albaricoques enteros y partidos")),
  melon: photo("melon", t("A melon and a melon half", "Un melón y medio melón")),
  "passion-fruit": photo("passion-fruit", t("A passion fruit cut open", "Un maracuyá abierto"), "30% 50%"),
  pineapple: photo("pineapple", t("A pineapple", "Una piña")),
  "pink-guava": photo("pink-guava", t("A pink guava cut in half", "Una guayaba rosa cortada por la mitad")),
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
  mango: photo("mango", t("A ripe mango", "Un mango maduro")),
  coconut: photo("coconut", t("Coconut halves", "Mitades de coco")),
  cranberry: photo("cranberry", t("Cranberries spilling from a jar", "Arándanos rojos saliendo de un tarro")),
  blueberry: photo("blueberry", t("Blueberries in a bowl", "Arándanos en un cuenco")),
  cherry: photo("cherry", t("A pair of cherries", "Un par de cerezas")),
  raspberry: photo("raspberry", t("Raspberries", "Frambuesas")),
  blackberry: photo("blackberry", t("Blackberries on the bush", "Moras en la planta")),
  strawberry: photo("strawberry", t("Strawberries", "Fresas")),
  turnip: photo("turnip", t("Purple-top turnips", "Nabos de cuello morado")),
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
  )
};

/**
 * IQF cut or presentation → the photograph that shows it (fruit + cut). Cuts not listed (1/4 and
 * 1/8 cuts, sticks, julienne, lemon and grapefruit half slices, every lime cut, block zest,
 * orange and lime zest, peel squares) have no matching photograph: image-free layout, listed in
 * docs/asset-requests.md.
 */
const IQF_CUT_PHOTOS: Record<string, string> = {
  "iqf-lemon-slices": "iqf-lemon",
  "iqf-orange-slices--6-%2F-9-mm": "iqf-orange",
  "iqf-orange-half-slices-6-%2F-9-mm": "iqf-orange",
  "iqf-grapefruit-slices": "iqf-grapefruit",
  "iqf-lemon-zest": "lemon-zest",
  "iqf-lemon-peel-shells": "citrus-peel",
  "iqf-orange-peel-shells": "citrus-peel"
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
      // The family hub and range overview use the family photograph; a cut or presentation gets
      // a photograph only when it shows that cut (IQF_CUT_PHOTOS). The lime photograph shows
      // halves, which is none of the lime cuts.
      if (path === family.hub || path === "/frozen-lemon") return family.id;
      return IQF_CUT_PHOTOS[slug];
    case "bottle-formats":
      return { "soft-drinks": "soft-drinks", "alcoholic-beverage": "alcoholic-beverages", water: "water" }[slug];
    case "aluminium-cans":
      return /^(sleek|slim)-can/.test(slug) ? "plain-can" : "cans";
    case "can-ends":
      return "can-ends";
    case "crown-corks":
      return undefined;
    case "label-types":
      return undefined;
    default:
      // Fruit and vegetable concentrates: /citrics/orange-concentrate, /mediterranean/apple…
      return family.id.endsWith("-concentrates") ? slug.replace(/-concentrate$/, "") : undefined;
  }
}

/** Product pages with no suitable licensed photograph yet (documented gaps). */
export const missingHeroSubjects = ["white-grapefruit"];

export function productHeroImage(path: string): HeroPhoto | undefined {
  const subject = subjectOf(path);
  return subject ? subjects[subject] : undefined;
}

/** Files referenced by the mapping (tests). */
export const heroImageFiles = Object.values(subjects).map((item) => item.src);

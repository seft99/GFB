import type { Locale } from "../config.ts";
import { en, type Dictionary } from "./en.ts";
import { es } from "./es.ts";

export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { en, es };

/**
 * Dictionaries are plain modules so they type-check against each other and tree-shake.
 * Client components receive only the slice they need as props.
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

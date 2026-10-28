/**
 * The `family` URL parameter shared by the concentrate explorer and the technical library of
 * the same page (one stable identifier: the family slug, e.g. `tropical`). Whoever changes it
 * writes the URL and announces the change; both components read the URL back, so a deep link,
 * a reload, Back/Forward or a selection in either component leaves them in agreement.
 * Client-only helpers (they touch `window`); callers use them from effects and event handlers.
 */

export const FAMILY_PARAM = "family";
const FAMILY_EVENT = "gfb:family-change";

export const readFamilyParam = () => new URLSearchParams(window.location.search).get(FAMILY_PARAM);

export const notifyFamilyChange = () => window.dispatchEvent(new Event(FAMILY_EVENT));

/** Calls `listener` after any change of the family: own writes, other components, Back/Forward. */
export function subscribeFamilyChange(listener: () => void) {
  window.addEventListener(FAMILY_EVENT, listener);
  window.addEventListener("popstate", listener);
  return () => {
    window.removeEventListener(FAMILY_EVENT, listener);
    window.removeEventListener("popstate", listener);
  };
}

/** Sets the family in the URL (keeping the other parameters) and announces it. */
export function writeFamilyParam(slug: string, mode: "push" | "replace" = "push") {
  const url = new URL(window.location.href);
  url.searchParams.set(FAMILY_PARAM, slug);
  if (url.href !== window.location.href)
    window.history[mode === "push" ? "pushState" : "replaceState"](window.history.state, "", url);
  notifyFamilyChange();
}

/** Id of the technical library heading that family deep links scroll to. */
export const LIBRARY_ANCHOR = "concentrates-library-title";

/** Deep link to one family of a category page's technical library (pure; safe on the server). */
export function familyLibraryHref(categoryHref: string, slug: string) {
  return `${categoryHref}${categoryHref.includes("?") ? "&" : "?"}${FAMILY_PARAM}=${slug}#${LIBRARY_ANCHOR}`;
}

/** Library and explorer parameters a language switch carries to the other language. */
export const PRESERVED_PARAMS = [FAMILY_PARAM, "type", "q"] as const;

import assert from "node:assert/strict";
import test from "node:test";
import { divisions, slugTree } from "../../src/content/catalog.ts";
import { locales, otherLocale, type Locale } from "../../src/i18n/config.ts";
import { legacyPaths, legacyRedirects } from "../../src/i18n/legacy-redirects.ts";
import { negotiateLocale } from "../../src/i18n/negotiate.ts";
import {
  legalPolicies,
  paths,
  resolveStaticSegment,
  translatePathname,
  type LegalPolicy
} from "../../src/i18n/routes.ts";

test("locale negotiation honours cookie, then quality-ranked Accept-Language", () => {
  assert.equal(negotiateLocale("es-ES,es;q=0.9,en;q=0.8"), "es");
  assert.equal(negotiateLocale("fr-FR,en;q=0.5,es;q=0.9"), "es");
  assert.equal(negotiateLocale("fr-FR,de;q=0.8"), "en");
  assert.equal(negotiateLocale("es;q=0,en"), "en");
  assert.equal(negotiateLocale(null), "en");
  assert.equal(negotiateLocale("en-GB", "es"), "es");
  assert.equal(negotiateLocale("es", "fr"), "es");
});

test("static segments rewrite public slugs and redirect everything else", () => {
  assert.deepEqual(resolveStaticSegment("es", "sobre-gfb"), { type: "rewrite", page: "about" });
  assert.deepEqual(resolveStaticSegment("es", "about"), { type: "redirect", page: "about" });
  assert.deepEqual(resolveStaticSegment("en", "about"), { type: "none" });
  assert.deepEqual(resolveStaticSegment("en", "contacto"), { type: "redirect", page: "contact" });
  assert.deepEqual(resolveStaticSegment("es", "materias-primas"), { type: "none" });
  assert.deepEqual(resolveStaticSegment("es", undefined), { type: "none" });
});

function everyPublicPath(locale: Locale): string[] {
  return [
    paths.home(locale),
    paths.page(locale, "about"),
    paths.page(locale, "contact"),
    ...(Object.keys(legalPolicies) as LegalPolicy[]).map((policy) => paths.legal(locale, policy)),
    ...divisions.flatMap((division) => [
      paths.division(locale, division),
      ...division.categories.map((category) => paths.category(locale, division, category))
    ])
  ];
}

test("every page translates to its counterpart and back", () => {
  for (const locale of locales) {
    const target = otherLocale(locale);
    const sources = everyPublicPath(locale);
    const targets = everyPublicPath(target);
    sources.forEach((path, index) => {
      assert.equal(translatePathname(path, target, slugTree), targets[index], `${path} → ${target}`);
      assert.equal(translatePathname(targets[index], locale, slugTree), path);
    });
  }
});

test("unknown paths translate to the target home page", () => {
  assert.equal(translatePathname("/en/nope", "es", slugTree), "/es");
  assert.equal(translatePathname("/", "es", slugTree), "/es");
  assert.equal(translatePathname("/es/materias-primas/nope", "en", slugTree), "/en/raw-materials");
});

test("contact links carry inquiry context", () => {
  assert.equal(
    paths.contact("es", { interest: "raw-materials", category: "Latas & tapas" }),
    "/es/contacto?interest=raw-materials&category=Latas+%26+tapas"
  );
  assert.equal(paths.contact("en"), "/en/contact");
});

test("legacy redirects resolve to real pages, Spanish rules first", () => {
  const known = new Set(locales.flatMap(everyPublicPath));
  const redirects = legacyRedirects();
  for (const redirect of redirects)
    assert.ok(known.has(redirect.destination), `${redirect.source} → ${redirect.destination}`);
  for (const source of Object.keys(legacyPaths)) {
    const rules = redirects.filter((redirect) => redirect.source === source);
    assert.equal(rules.length, 2);
    assert.ok(rules[0].has, `${source}: the query-matched Spanish rule must come first`);
    assert.match(rules[0].destination, /^\/es\//);
    assert.match(rules[1].destination, /^\/en\//);
  }
});

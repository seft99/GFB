import assert from "node:assert/strict";
import test from "node:test";
import { divisions, slugTree } from "../../src/content/catalog.ts";
import { locales, otherLocale, type Locale } from "../../src/i18n/config.ts";
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

test("unknown localized paths translate to the target home page; legacy paths switch the lang query", () => {
  assert.equal(translatePathname("/en/nope", "es", slugTree), paths.home("es"));
  assert.equal(translatePathname("/", "es", slugTree), "/?lang=es");
  assert.equal(translatePathname("/citrics/orange-concentrate", "es", slugTree), "/citrics/orange-concentrate?lang=es");
  assert.equal(translatePathname("/citrics/orange-concentrate", "en", slugTree), "/citrics/orange-concentrate");
  assert.equal(translatePathname("/es/materias-primas/nope", "en", slugTree), "/raw-materials");
});

test("contact links carry inquiry context", () => {
  assert.equal(
    paths.contact("es", { interest: "raw-materials", category: "Latas & tapas" }),
    "/es/contacto?interest=raw-materials&category=Latas+%26+tapas"
  );
  assert.equal(paths.contact("en"), "/en/contact");
});

test("redesigned pages keep their legacy URL as public canonical", () => {
  const cans = divisions[0].categories.find((category) => category.id === "cans")!;
  assert.equal(paths.category("en", divisions[0], cans), "/cans");
  assert.equal(paths.category("es", divisions[0], cans), "/cans?lang=es");
  assert.equal(paths.home("en"), "/");
  assert.equal(paths.page("es", "about"), "/about-us?lang=es");
  assert.equal(paths.page("es", "contact"), "/es/contacto");
});

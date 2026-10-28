import { expect, test } from "@playwright/test";

// Public URL model (src/migration): legacy Wix paths are the canonical URLs — the clean path in
// English and the same path with ?lang=es in Spanish. The full manifest is verified by
// `npm run test:migration`; these specs cover the browser-level behaviour.

test.describe("language model", () => {
  test("the root is English and never negotiates the browser language", async ({ browser }) => {
    const context = await browser.newContext({ locale: "es-ES" });
    const page = await context.newPage();
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await context.close();
  });

  test("?lang=es serves Spanish on the same path", async ({ page }) => {
    await page.goto("/?lang=es");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await page.goto("/cans?lang=es");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Latas y tapas de aluminio");
  });
});

test.describe("public routes", () => {
  for (const [locale, path, heading] of [
    ["en", "/about-us", "Experience and tailored solutions"],
    ["es", "/about-us?lang=es", "Experiencia y soluciones a medida"],
    ["es", "/fruits-concentrates?lang=es", "Concentrados de frutas y vegetales"],
    ["en", "/citrics/orange-concentrate", "Orange concentrate"],
    ["es", "/iqf-lime-slices/iqf-lime-1%2F4-cut?lang=es", "Lima IQF en cuartos"],
    ["es", "/es/legal/privacidad", "Privacidad"]
  ] as const) {
    test(`${path} renders in ${locale}`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
    });
  }

  test("localized aliases reach the legacy canonical in one permanent redirect", async ({ request }) => {
    for (const [alias, target] of [
      ["/es/about", "/about-us?lang=es"],
      ["/en/raw-materials/fruit-concentrates?utm_source=e2e", "/fruits-concentrates?utm_source=e2e"],
      ["/es/soluciones-de-embalaje/latas", "/cans?lang=es"]
    ]) {
      const response = await request.get(alias, { maxRedirects: 0 });
      expect(response.status(), alias).toBe(308);
      expect(
        new URL(response.headers().location, "http://x").pathname +
          new URL(response.headers().location, "http://x").search
      ).toBe(target);
    }
  });

  test("route folder names of new pages still redirect to their localized slug", async ({ page }) => {
    await page.goto("/en/contacto?interest=raw-materials");
    await expect(page).toHaveURL(/\/en\/contact\?interest=raw-materials$/);
  });

  test("canonical and hreflang alternates use the legacy public URLs", async ({ page }) => {
    await page.goto("/cans?lang=es");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://www.gfb-solutions.com/cans?lang=es"
    );
    await expect(page.locator('link[hreflang="en-US"]')).toHaveAttribute("href", "https://www.gfb-solutions.com/cans");
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
      "href",
      "https://www.gfb-solutions.com/cans"
    );
  });

  test("unknown pages return a localized 404", async ({ page }) => {
    const response = await page.goto("/es/no-existe");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Esa página no está en el portafolio.");
  });
});

test("the language switcher keeps the visitor on the equivalent page", async ({ page }) => {
  await page.goto("/fruits-concentrates");
  await page.getByRole("link", { name: "Ver en español" }).click();
  await expect(page).toHaveURL(/\/fruits-concentrates\?lang=es$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("listitem").filter({ hasText: "Uva blanca" }).first()).toBeVisible();
});

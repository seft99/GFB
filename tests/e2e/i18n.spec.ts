import { expect, test } from "@playwright/test";

test.describe("locale negotiation", () => {
  test("the root redirects using Accept-Language", async ({ browser }) => {
    const context = await browser.newContext({ locale: "es-ES" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/es$/);
    await context.close();
  });

  test("paths without a locale keep their suffix", async ({ page }) => {
    await page.goto("/raw-materials");
    await expect(page).toHaveURL(/\/en\/raw-materials$/);
  });

  test("the last visited locale wins over the browser language", async ({ page }) => {
    await page.goto("/es");
    await page.goto("/");
    await expect(page).toHaveURL(/\/es$/);
  });
});

test.describe("localized routes", () => {
  for (const [locale, path, heading] of [
    ["en", "/en/about", "Connecting technical detail"],
    ["es", "/es/sobre-gfb", "Conectar el detalle técnico"],
    ["es", "/es/materias-primas/concentrados-de-frutas", "Concentrados de frutas y vegetales"],
    ["es", "/es/legal/privacidad", "Privacidad"]
  ] as const) {
    test(`${path} renders in ${locale}`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
    });
  }

  test("route folder names redirect to the canonical localized slug", async ({ page }) => {
    await page.goto("/es/about");
    await expect(page).toHaveURL(/\/es\/sobre-gfb$/);
    await page.goto("/en/contacto?interest=raw-materials");
    await expect(page).toHaveURL(/\/en\/contact\?interest=raw-materials$/);
  });

  test("legacy Wix URLs redirect permanently, honouring ?lang=es", async ({ page }) => {
    await page.goto("/fruits-concentrates?lang=es");
    await expect(page).toHaveURL(/\/es\/materias-primas\/concentrados-de-frutas/);
    await page.goto("/about-us");
    await expect(page).toHaveURL(/\/en\/about$/);
  });

  test("canonical and hreflang alternates point at localized URLs", async ({ page }) => {
    await page.goto("/es/soluciones-de-embalaje/latas");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/es\/soluciones-de-embalaje\/latas$/);
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute("href", /\/en\/packaging-solutions\/cans$/);
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
      "href",
      /\/en\/packaging-solutions\/cans$/
    );
  });

  test("unknown pages return a localized 404", async ({ page }) => {
    const response = await page.goto("/es/no-existe");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Esa página no está en el portafolio.");
  });
});

test("the language switcher keeps the visitor on the equivalent page", async ({ page }) => {
  await page.goto("/en/raw-materials/fruit-concentrates");
  await page.getByRole("link", { name: "Ver en español" }).click();
  await expect(page).toHaveURL(/\/es\/materias-primas\/concentrados-de-frutas$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("listitem").filter({ hasText: "Naranja sanguina" })).toBeVisible();
});

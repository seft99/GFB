import { expect, test } from "@playwright/test";
import content from "../../src/migration/legacy-content.json" with { type: "json" };

type Page = { sections: { heading?: string; items: Record<string, unknown>[] }[] };
const pages = content as unknown as Record<string, { en: Page; es: Page }>;

const strings = (page: Page) =>
  page.sections.flatMap((section) => [
    ...(section.heading ? [section.heading] : []),
    ...section.items.flatMap((item) =>
      item.type === "specs"
        ? (item.rows as string[][]).flat()
        : item.type === "ul"
          ? (item.items as string[])
          : item.type === "p" || item.type === "h3"
            ? [item.text as string]
            : []
    )
  ]);
const decode = (html: string) =>
  html
    .replace(/<!-- -->/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
const urlOf = (path: string, locale: "en" | "es") => (locale === "es" ? `${path}?lang=es` : path);

test("every detail page serves every published string of its content in the server HTML", async ({ request }) => {
  test.setTimeout(240_000);
  const missing: string[] = [];
  for (const [path, page] of Object.entries(pages))
    for (const locale of ["en", "es"] as const) {
      const html = decode(await (await request.get(urlOf(path, locale))).text());
      const body = html.slice(html.indexOf('class="section pdc'));
      for (const text of strings(page[locale]))
        if (!body.includes(text.replace(/\s*\n\s*/g, "\n").split("\n")[0]))
          missing.push(`${path} (${locale}): ${text}`);
      if (page[locale].sections.length) expect(html, path).toContain('data-variant="');
    }
  expect(missing).toEqual([]);
});

test.describe("product information layouts", () => {
  test("formats-overview: format rows with chips and the editorial overview (Orange)", async ({ page }) => {
    await page.goto("/citrics/orange-concentrate");
    const section = page.locator(".pdc");
    await expect(section).toHaveAttribute("data-variant", "formats-overview");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Available formats & product overview");
    await expect(section.locator(".pdc-formats__row")).toHaveCount(6);
    await expect(section.locator(".pdc-formats__row").first()).toContainText("Juice concentrate cloudy");
    await expect(
      section.getByRole("heading", { name: "Discover the Pure Essence of Spanish Orange Concentrate" })
    ).toBeVisible();
  });

  test("health text published in the oat formats table is not shown as a format", async ({ page }) => {
    await page.goto("/plant-based-concentrate-1/oat-concentrate");
    const section = page.locator(".pdc");
    await expect(section.locator(".pdc-formats__row")).toHaveCount(1);
    await expect(section.locator(".pdc-chips")).not.toContainText("cholesterol");
    await expect(section.locator(".pdc-note")).toHaveCount(2);
  });

  test("facts-applications: fact cards from the published table (IQF lemon slices, EN/ES)", async ({ page }) => {
    await page.goto("/iqf-lemon-slices/iqf-lemon-slices");
    const section = page.locator(".pdc");
    await expect(section).toHaveAttribute("data-variant", "facts-applications");
    await expect(section.locator(".pdc-fact")).toHaveCount(5);
    await expect(section.locator(".pdc-fact").filter({ hasText: "Presentation" })).toContainText(
      "Lemon slices from 6 millimetres to 9 millimetres"
    );
    await page.goto("/iqf-lemon-slices/iqf-lemon-slices?lang=es");
    await expect(page.locator(".pdc h2")).toHaveText("Datos del producto y aplicaciones");
  });

  test("technical-specification: semantic tables with published values only (Merlot, Sleek can)", async ({ page }) => {
    await page.goto("/merlot");
    const section = page.locator(".pdc");
    await expect(section).toHaveAttribute("data-variant", "technical-specification");
    const analysis = section.locator("section").filter({ has: page.getByRole("heading", { name: "Analysis" }) });
    await expect(analysis.locator('th[scope="row"]')).toHaveCount(7);
    await expect(analysis.getByRole("row", { name: /^ºBrix/ })).toContainText("67 - 69 @ 20 ºC");
    await expect(section).not.toContainText(/Published method|—|Download/);
    await expect(section.locator('a[href$=".pdf"], a[download]')).toHaveCount(0);
    await page.goto("/sleek-can-d57mm");
    await expect(page.locator(".pdc-identifiers li")).toHaveText(["D57.4 mm", "202# cap/lid", "Aluminium cans"]);
    await expect(page.locator(".pdc-table.is-values").first()).toContainText("250ml");
  });

  test("product-range-features: bottle models under their published groups (EN/ES)", async ({ page }) => {
    await page.goto("/alcoholic-beverage?lang=es");
    const section = page.locator(".pdc");
    await expect(section).toHaveAttribute("data-variant", "product-range-features");
    await expect(section.locator(".pdc-model")).toHaveCount(10);
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Gama y características");
    await page.goto("/soft-drinks");
    await expect(page.locator(".pdc-model")).toHaveCount(12);
    await expect(page.locator(".pdc-count")).toHaveText("12 published references");
  });

  test("range overviews keep their product links (IQF lemon, red grape)", async ({ page }) => {
    await page.goto("/iqf-lemon");
    await expect(page.locator(".pdc .legacy-detail__refs a")).toHaveCount(9);
    await page.goto("/red-grape-concentrate");
    await expect(page.locator(".pdc .legacy-detail__section-link")).toHaveCount(7);
  });

  test("no horizontal overflow at the target desktop widths", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop widths");
    for (const width of [1280, 1366, 1440, 1600, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const url of [
        "/aluminum-can-end-52mm-202-ise-sot",
        "/alcoholic-beverage",
        "/plant-based-concentrate-1/almond-concentrate"
      ]) {
        await page.goto(url);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${url} @${width}`).toBe(
          0
        );
      }
    }
  });
});

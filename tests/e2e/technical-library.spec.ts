import { expect, test, type Page } from "@playwright/test";

const library = (page: Page) => page.locator(".tech-library");
const panel = (page: Page) => library(page).locator(".tech-library__family-panel:visible");
const cards = (page: Page) => panel(page).locator(".tech-library__card");
/** Family navigator: a single-choice radio group. */
const family = (page: Page, name: string) =>
  library(page)
    .getByRole("group", { name: /Product families|Familias de producto/ })
    .getByRole("radio", { name: new RegExp(`^${name}`) });
const typeFilter = (page: Page, name: string) =>
  library(page)
    .getByRole("group", { name: /^(Show|Mostrar)$/ })
    .getByRole("radio", { name, exact: true });

test.describe("technical product library", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fruits-concentrates");
  });

  test("server HTML links every product, specification and overview page, also for hidden families", async ({
    page
  }) => {
    const hrefs = await library(page)
      .locator("a.tech-library__resource, a.tech-library__overview")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(hrefs).toHaveLength(43 + 16);
    expect(hrefs).toContain("/citrics/orange-concentrate");
    expect(hrefs).toContain("/merlot");
    expect(hrefs).toContain("/red-grape-juice/merlot");
    expect(hrefs).toContain("/fruit-concentrates");
    await expect(library(page).getByRole("heading", { level: 2 })).toHaveText(
      "Find products and technical specifications"
    );
  });

  test("families are a radio group that switches the panel and keeps verified counts", async ({ page }) => {
    // Same default family as the concentrate explorer above it.
    await expect(family(page, "Mediterranean")).toBeChecked();
    await expect(cards(page)).toHaveCount(10);
    for (const [name, count] of [
      ["Citrus", 7],
      ["Tropical", 8],
      ["Red fruits", 6],
      ["Vegetables", 12]
    ] as const) {
      await family(page, name).check();
      await expect(family(page, name)).toBeChecked();
      await expect(cards(page)).toHaveCount(count);
      await expect(panel(page).locator(".tech-library__count")).toHaveText(`${count} products`);
    }
    expect(new URL(page.url()).pathname).toBe("/fruits-concentrates");
  });

  test("product families have no fabricated specifications", async ({ page }) => {
    await typeFilter(page, "Specifications").check();
    await expect(panel(page).getByText("This family has no separate technical specifications.")).toBeVisible();
    await expect(panel(page).locator("a")).toHaveCount(0);
    await panel(page).getByRole("button", { name: "Show all products" }).click();
    await expect(cards(page)).toHaveCount(10);
  });

  test("red grape: one card per variety, range overviews apart, distinct actions", async ({ page }) => {
    await page.getByRole("button", { name: "Browse grape specifications" }).click();
    await expect(family(page, "Red grape specifications")).toBeChecked();
    await expect(page.getByRole("button", { name: "Browse grape specifications" })).toHaveCount(0);
    await expect(cards(page)).toHaveCount(7);
    await expect(panel(page).locator(".tech-library__count")).toHaveText("7 products · 7 specifications");
    await expect(panel(page).locator("a.tech-library__overview")).toHaveCount(2);
    const merlot = cards(page).filter({ has: page.getByRole("heading", { name: "Merlot", exact: true }) });
    await expect(merlot.getByRole("link", { name: /^View product/ })).toHaveAttribute(
      "href",
      "/red-grape-juice/merlot"
    );
    await expect(merlot.getByRole("link", { name: /^View specifications/ })).toHaveAttribute("href", "/merlot");
    await typeFilter(page, "Specifications").check();
    await expect(cards(page)).toHaveCount(7);
    await expect(panel(page).getByRole("link", { name: /^View product/ })).toHaveCount(0);
    await expect(panel(page).locator("a.tech-library__overview")).toHaveCount(0);
    await typeFilter(page, "Products").check();
    await expect(cards(page)).toHaveCount(7);
    await expect(panel(page).getByRole("link", { name: /^View specifications/ })).toHaveCount(0);
  });

  test("search covers every family, codes, and combines with family and type", async ({ page }) => {
    const input = page.getByRole("searchbox", { name: "Search products, varieties or codes" });
    await input.fill("grapefruit");
    await expect(panel(page).getByText("2 results")).toBeVisible();
    await input.fill("red800");
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).getByRole("heading")).toHaveText("RED-800");
    await input.fill("concentrate");
    const all = await cards(page).count();
    await family(page, "Tropical").click();
    await expect(cards(page)).toHaveCount(8);
    await page.getByRole("button", { name: "Show matches in all families" }).click();
    await expect(cards(page)).toHaveCount(all);
    await input.fill("merlot");
    await typeFilter(page, "Specifications").check();
    await expect(cards(page)).toHaveCount(1);
    await expect(panel(page).getByRole("link")).toHaveAttribute("href", "/merlot");
  });

  test("empty results offer a working reset; Escape clears the query", async ({ page }) => {
    const input = page.getByRole("searchbox", { name: "Search products, varieties or codes" });
    await input.fill("zzz no such reference");
    await expect(panel(page).getByText("No matching products found.")).toBeVisible();
    await panel(page).getByRole("button", { name: "Clear search and filters" }).click();
    await expect(input).toHaveValue("");
    await expect(cards(page)).toHaveCount(10);
    await input.fill("lime");
    await input.press("Escape");
    await expect(input).toHaveValue("");
  });

  test("family and type are deep-linkable and follow Back/Forward", async ({ page }) => {
    await family(page, "Vegetables").check();
    await expect(page).toHaveURL(/family=vegetable/);
    await family(page, "Tropical").check();
    await page.goBack();
    await expect(family(page, "Vegetables")).toBeChecked();
    await page.goForward();
    await expect(family(page, "Tropical")).toBeChecked();
    await page.goto("/fruits-concentrates?family=red-grape&type=technical");
    await expect(family(page, "Red grape specifications")).toBeChecked();
    await expect(cards(page)).toHaveCount(7);
  });

  test("Spanish keeps the Spanish URLs and labels", async ({ page }) => {
    await page.goto("/fruits-concentrates?lang=es&family=red-grape");
    await expect(library(page).getByRole("heading", { level: 2 })).toHaveText(
      "Encuentre productos y especificaciones técnicas"
    );
    const merlot = cards(page).filter({ has: page.getByRole("heading", { name: "Merlot", exact: true }) });
    await expect(merlot.getByRole("link", { name: /^Ver especificaciones/ })).toHaveAttribute(
      "href",
      "/merlot?lang=es"
    );
    await expect(page).toHaveURL(/lang=es/);
  });

  test("a search across all families keeps its scope after a reload", async ({ page }) => {
    await family(page, "Tropical").check();
    await page.getByRole("searchbox", { name: "Search products, varieties or codes" }).fill("merlot");
    await expect(page).toHaveURL(/\?q=merlot$/);
    await page.reload();
    await expect(cards(page).getByRole("heading")).toHaveText(["Merlot"]);
    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(page).toHaveURL(/family=mediterranean/);
  });

  test("an unknown family or type falls back to the defaults", async ({ page }) => {
    await page.goto("/fruits-concentrates?family=lemon&type=bogus");
    await expect(family(page, "Mediterranean")).toBeChecked();
    await expect(typeFilter(page, "All")).toBeChecked();
    await expect(cards(page)).toHaveCount(10);
  });
});

test.describe("concentrate explorer and technical library share one family", () => {
  test.skip(({ isMobile }) => isMobile, "the explorer is desktop-only");
  const tab = (page: Page, name: string) => page.getByRole("tab", { name: new RegExp(`^${name}`) });

  test("a deep link selects the same family in both; selections and history stay in sync", async ({ page }) => {
    await page.goto("/fruits-concentrates?family=tropical");
    await expect(tab(page, "Tropical")).toHaveAttribute("aria-selected", "true");
    await expect(family(page, "Tropical")).toBeChecked();
    // Explorer → library.
    await tab(page, "Vegetables").click();
    await expect(page).toHaveURL(/family=vegetables/);
    await expect(family(page, "Vegetables")).toBeChecked();
    // Library → explorer.
    await family(page, "Citrus").check();
    await expect(tab(page, "Citrus")).toHaveAttribute("aria-selected", "true");
    // The red grape group lives in the Mediterranean family of the explorer.
    await family(page, "Red grape specifications").check();
    await expect(tab(page, "Mediterranean")).toHaveAttribute("aria-selected", "true");
    await page.goBack();
    await expect(tab(page, "Citrus")).toHaveAttribute("aria-selected", "true");
    await expect(family(page, "Citrus")).toBeChecked();
    await page.reload();
    await expect(tab(page, "Citrus")).toHaveAttribute("aria-selected", "true");
    await expect(family(page, "Citrus")).toBeChecked();
  });

  test("the explorer links to its family in the library, and the language switch keeps it", async ({ page }) => {
    await page.goto("/fruits-concentrates");
    await expect(tab(page, "Mediterranean")).toHaveAttribute("aria-selected", "true");
    await expect(family(page, "Mediterranean")).toBeChecked();
    await tab(page, "Red fruits").click();
    await page.getByRole("link", { name: "View products and specifications" }).click();
    await expect(page).toHaveURL(/family=red-fruits#concentrates-library-title$/);
    await expect(family(page, "Red fruits")).toBeChecked();
    const language = page.locator("a.language-link");
    await expect(language).toHaveAttribute("href", "/fruits-concentrates?lang=es&family=red-fruits");
    await language.click();
    await expect(page).toHaveURL(/lang=es&family=red-fruits/);
    await expect(family(page, "Frutos rojos")).toBeChecked();
    await expect(tab(page, "Frutos rojos")).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("frozen fruits reuse the same technical library", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/frozen-fruits");
  });

  test("server HTML links every published IQF page; no type filter, no grape banner", async ({ page }) => {
    await expect(library(page)).toHaveAttribute("data-library", "frozen-fruits");
    const hrefs = await library(page)
      .locator("a.tech-library__resource, a.tech-library__overview")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(hrefs).toHaveLength(34);
    expect(new Set(hrefs).size).toBe(34);
    expect(hrefs).toContain("/iqf-lemon");
    expect(hrefs).toContain("/iqf-orange-frozen/iqf-orange-13-x-13-sticks");
    expect(hrefs).toContain("/iqf-grapefruit-frozen/iqf-grapefruit-slices");
    await expect(library(page).getByRole("radio", { name: "Specifications" })).toHaveCount(0);
    await expect(library(page).locator(".tech-library__banner")).toHaveCount(0);
    await expect(library(page).getByRole("link", { name: /View specifications/ })).toHaveCount(0);
    await expect(library(page)).not.toContainText(/red grape|concentrate|one eights|one fourths/i);
    await expect(library(page).getByRole("heading", { level: 2 })).toHaveText("Explore citrus formats");
  });

  test("groups separate range overviews from formats and keep verified counts", async ({ page }) => {
    await expect(family(page, "Lemon")).toBeChecked();
    await expect(cards(page)).toHaveCount(9);
    await expect(panel(page).locator("a.tech-library__overview")).toHaveCount(2);
    await expect(panel(page).locator(".tech-library__count")).toHaveText("9 formats");
    for (const [name, count] of [
      ["Orange", 10],
      ["Lime", 6],
      ["Grapefruit", 4]
    ] as const) {
      await family(page, name).check();
      await expect(family(page, name)).toBeChecked();
      await expect(cards(page)).toHaveCount(count);
      await expect(panel(page).locator("a.tech-library__overview")).toHaveCount(1);
    }
    await expect(page).toHaveURL(/\/frozen-fruits\?family=grapefruit$/);
  });

  test("search finds formats across groups", async ({ page }) => {
    const input = page.getByRole("searchbox", { name: "Search products, varieties or codes" });
    await input.fill("13x13 sticks");
    await expect(cards(page).getByRole("heading")).toHaveText(["IQF orange 13 x 13 sticks", "IQF lime 13 x 13 sticks"]);
    await input.fill("zest");
    await expect(panel(page).getByText("5 results")).toBeVisible();
    await input.fill("merlot");
    await expect(panel(page).getByText("No matching products found.")).toBeVisible();
  });

  test("deep links restore a group; unknown values fall back", async ({ page }) => {
    await page.goto("/frozen-fruits?family=lime");
    await expect(family(page, "Lime")).toBeChecked();
    await expect(cards(page)).toHaveCount(6);
    await page.goto("/frozen-fruits?family=red-grape&type=technical");
    await expect(family(page, "Lemon")).toBeChecked();
    await expect(cards(page)).toHaveCount(9);
  });

  test("Spanish keeps the Spanish URLs and labels", async ({ page }) => {
    await page.goto("/frozen-fruits?lang=es&family=grapefruit");
    await expect(library(page).getByRole("heading", { level: 2 })).toHaveText("Explore los formatos de cítricos");
    await expect(family(page, "Pomelo")).toBeChecked();
    const slices = cards(page).filter({
      has: page.getByRole("heading", { name: "Rodajas de pomelo IQF", exact: true })
    });
    await expect(slices.getByRole("link", { name: /^Ver producto/ })).toHaveAttribute(
      "href",
      "/iqf-grapefruit-frozen/iqf-grapefruit-slices?lang=es"
    );
  });
});

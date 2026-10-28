import { expect, test, type Page } from "@playwright/test";

const library = (page: Page) => page.locator(".tech-library");
const panel = (page: Page) => library(page).locator(".tech-library__family-panel:visible");
const cards = (page: Page) => panel(page).locator(".tech-library__card");
const family = (page: Page, name: string) => library(page).getByRole("button", { name: new RegExp(`^${name}`) });
const typeFilter = (page: Page, name: string) =>
  library(page)
    .getByRole("group", { name: /Resource type|Tipo de recurso/ })
    .getByRole("button", { name });

test.describe("technical product library", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fruits-concentrates");
  });

  test("server HTML links every product and technical page, also for hidden families", async ({ page }) => {
    const hrefs = await library(page)
      .locator("a.tech-library__resource")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(hrefs).toHaveLength(43 + 16);
    expect(hrefs).toContain("/citrics/orange-concentrate");
    expect(hrefs).toContain("/merlot");
    expect(hrefs).toContain("/red-grape-juice/merlot");
  });

  test("families switch the panel without navigation and keep verified counts", async ({ page }) => {
    await expect(family(page, "Citrus")).toHaveAttribute("aria-pressed", "true");
    await expect(cards(page)).toHaveCount(7);
    for (const [name, count] of [
      ["Mediterranean", 10],
      ["Tropical", 8],
      ["Red fruits", 6],
      ["Vegetables", 12]
    ] as const) {
      await family(page, name).click();
      await expect(family(page, name)).toHaveAttribute("aria-pressed", "true");
      await expect(cards(page)).toHaveCount(count);
    }
    expect(new URL(page.url()).pathname).toBe("/fruits-concentrates");
  });

  test("product families have no fabricated technical sheets", async ({ page }) => {
    await typeFilter(page, "Technical sheets").click();
    await expect(panel(page).getByText("No separate technical sheets are published for this family.")).toBeVisible();
    await expect(panel(page).locator("a")).toHaveCount(0);
    await panel(page).getByRole("button", { name: "Show all resources" }).click();
    await expect(cards(page)).toHaveCount(7);
  });

  test("red grape keeps product overviews and technical sheets distinct", async ({ page }) => {
    await page.getByRole("button", { name: "Browse grape specifications" }).click();
    await expect(family(page, "Red grape specifications")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Browse grape specifications" })).toHaveCount(0);
    await expect(cards(page)).toHaveCount(9);
    const merlot = cards(page).filter({ has: page.getByRole("heading", { name: "Merlot", exact: true }) });
    await expect(merlot.getByRole("link", { name: /Product page/ })).toHaveAttribute("href", "/red-grape-juice/merlot");
    await expect(merlot.getByRole("link", { name: /Technical sheet/ })).toHaveAttribute("href", "/merlot");
    await typeFilter(page, "Technical sheets").click();
    await expect(cards(page)).toHaveCount(7);
    await expect(panel(page).getByRole("link", { name: /Product page/ })).toHaveCount(0);
    await typeFilter(page, "Product pages").click();
    await expect(cards(page)).toHaveCount(9);
    await expect(panel(page).getByRole("link", { name: /Technical sheet/ })).toHaveCount(0);
  });

  test("search covers every family, codes, and combines with family and type", async ({ page }) => {
    const input = page.getByRole("searchbox", { name: "Search products, varieties or codes" });
    await input.fill("grapefruit");
    await expect(panel(page).getByText("2 references found")).toBeVisible();
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
    await typeFilter(page, "Technical sheets").click();
    await expect(cards(page)).toHaveCount(1);
    await expect(panel(page).getByRole("link")).toHaveAttribute("href", "/merlot");
  });

  test("empty results offer a working reset; Escape clears the query", async ({ page }) => {
    const input = page.getByRole("searchbox", { name: "Search products, varieties or codes" });
    await input.fill("zzz no such reference");
    await expect(panel(page).getByText("No matching references found.")).toBeVisible();
    await panel(page).getByRole("button", { name: "Clear search and filters" }).click();
    await expect(input).toHaveValue("");
    await expect(cards(page)).toHaveCount(7);
    await input.fill("lime");
    await input.press("Escape");
    await expect(input).toHaveValue("");
  });

  test("family and type are deep-linkable and follow Back/Forward", async ({ page }) => {
    await family(page, "Vegetables").click();
    await expect(page).toHaveURL(/family=vegetable/);
    await family(page, "Tropical").click();
    await page.goBack();
    await expect(family(page, "Vegetables")).toHaveAttribute("aria-pressed", "true");
    await page.goForward();
    await expect(family(page, "Tropical")).toHaveAttribute("aria-pressed", "true");
    await page.goto("/fruits-concentrates?family=red-grape&type=technical");
    await expect(family(page, "Red grape specifications")).toHaveAttribute("aria-pressed", "true");
    await expect(cards(page)).toHaveCount(7);
  });

  test("Spanish keeps the Spanish URLs and labels", async ({ page }) => {
    await page.goto("/fruits-concentrates?lang=es&family=red-grape");
    await expect(library(page).getByRole("heading", { level: 2 })).toHaveText("Fichas de producto y especificaciones");
    const merlot = cards(page).filter({ has: page.getByRole("heading", { name: "Merlot", exact: true }) });
    await expect(merlot.getByRole("link", { name: /Ficha técnica/ })).toHaveAttribute("href", "/merlot?lang=es");
    await expect(page).toHaveURL(/lang=es/);
  });

  test("a search across all families keeps its scope after a reload", async ({ page }) => {
    await family(page, "Tropical").click();
    await page.getByRole("searchbox", { name: "Search products, varieties or codes" }).fill("merlot");
    await expect(page).toHaveURL(/\?q=merlot$/);
    await page.reload();
    await expect(cards(page).getByRole("heading")).toHaveText(["Merlot"]);
    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(page).toHaveURL(/family=citrus/);
  });

  test("an unknown family or type falls back to the defaults", async ({ page }) => {
    await page.goto("/fruits-concentrates?family=lemon&type=bogus");
    await expect(family(page, "Citrus")).toHaveAttribute("aria-pressed", "true");
    await expect(typeFilter(page, "All resources")).toHaveAttribute("aria-pressed", "true");
    await expect(cards(page)).toHaveCount(7);
  });
});

test.describe("frozen fruits reuse the same technical library", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/frozen-fruits");
  });

  test("server HTML links every published IQF page; no type filter, no grape banner", async ({ page }) => {
    await expect(library(page)).toHaveAttribute("data-library", "frozen-fruits");
    const hrefs = await library(page)
      .locator("a.tech-library__resource")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(hrefs).toHaveLength(34);
    expect(new Set(hrefs).size).toBe(34);
    expect(hrefs).toContain("/iqf-lemon");
    expect(hrefs).toContain("/iqf-orange-frozen/iqf-orange-13-x-13-sticks");
    expect(hrefs).toContain("/iqf-grapefruit-frozen/iqf-grapefruit-slices");
    await expect(library(page).getByRole("group", { name: "Resource type" })).toHaveCount(0);
    await expect(library(page).locator(".tech-library__banner")).toHaveCount(0);
    await expect(library(page).getByRole("link", { name: /Technical sheet/ })).toHaveCount(0);
    await expect(library(page)).not.toContainText(/red grape|concentrate/i);
  });

  test("groups switch the panel and keep verified counts", async ({ page }) => {
    await expect(family(page, "Lemon")).toHaveAttribute("aria-pressed", "true");
    await expect(cards(page)).toHaveCount(11);
    for (const [name, count] of [
      ["Orange", 11],
      ["Lime", 7],
      ["Grapefruit", 5]
    ] as const) {
      await family(page, name).click();
      await expect(family(page, name)).toHaveAttribute("aria-pressed", "true");
      await expect(cards(page)).toHaveCount(count);
    }
    await expect(page).toHaveURL(/\/frozen-fruits\?family=grapefruit$/);
  });

  test("search finds formats across groups", async ({ page }) => {
    const input = page.getByRole("searchbox", { name: "Search products, varieties or codes" });
    await input.fill("13x13 sticks");
    await expect(cards(page).getByRole("heading")).toHaveText(["IQF orange 13 x 13 sticks", "IQF lime 13 x 13 sticks"]);
    await input.fill("zest");
    await expect(panel(page).getByText("5 references found")).toBeVisible();
    await input.fill("merlot");
    await expect(panel(page).getByText("No matching references found.")).toBeVisible();
  });

  test("deep links restore a group; unknown values fall back", async ({ page }) => {
    await page.goto("/frozen-fruits?family=lime");
    await expect(family(page, "Lime")).toHaveAttribute("aria-pressed", "true");
    await expect(cards(page)).toHaveCount(7);
    await page.goto("/frozen-fruits?family=red-grape&type=technical");
    await expect(family(page, "Lemon")).toHaveAttribute("aria-pressed", "true");
    await expect(cards(page)).toHaveCount(11);
  });

  test("Spanish keeps the Spanish URLs and labels", async ({ page }) => {
    await page.goto("/frozen-fruits?lang=es&family=grapefruit");
    await expect(library(page).getByRole("heading", { level: 2 })).toHaveText("Fichas de producto y especificaciones");
    await expect(family(page, "Pomelo")).toHaveAttribute("aria-pressed", "true");
    const slices = cards(page).filter({
      has: page.getByRole("heading", { name: "Rodajas de pomelo IQF", exact: true })
    });
    await expect(slices.getByRole("link", { name: /Ficha de producto|Página de producto/ })).toHaveAttribute(
      "href",
      "/iqf-grapefruit-frozen/iqf-grapefruit-slices?lang=es"
    );
  });
});

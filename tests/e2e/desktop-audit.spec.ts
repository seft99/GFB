import { expect, test } from "@playwright/test";

/** Checks for the desktop audit (GFB_Auditoria_Integral_Escritorio): content, layout and index. */

test.describe("content corrections", () => {
  test("RipCap coatings are label/value pairs and the duplicated block is shown once (C07)", async ({ page }) => {
    await page.goto("/42mm-ripcap");
    await expect(page.getByRole("heading", { name: "Coatings and printing" })).toHaveCount(1);
    await expect(page.getByRole("row", { name: /^White coating/ })).toContainText("Mod. Polyester");
    await expect(page.getByRole("row", { name: /^Inside lacquer/ })).toContainText(
      "Mod. vinyl resin or polyester-phenolic"
    );
  });

  test("wet glue labels lead to a quotation, not to online ordering (C06)", async ({ page }) => {
    await page.goto("/wet-glue-labels");
    await expect(page.locator(".pdc")).not.toContainText(/online/i);
    await expect(page.locator(".pdc")).toContainText("100% recycled paper on request");
  });

  test("shrink sleeve benefits are shown (C05)", async ({ page }) => {
    await page.goto("/shrink-sleeve-labels");
    await expect(page.locator(".pdc")).toContainText("360° decoration");
  });

  test("the standard-aperture end no longer describes the ISE end (C01)", async ({ page }) => {
    await page.goto("/aluminium-can-ends/52mm-(202)-dia-aluminium-end");
    await expect(page.locator(".pdc")).not.toContainText(/ISE|Botcherby/);
    await expect(page.locator(".pdc")).toContainText("standard aperture (Korinthos)");
  });

  test("Spanish pages show Spanish content (C03)", async ({ page }) => {
    await page.goto("/iqf-lemon-slices/iqf-lemon-slices?lang=es");
    const section = page.locator(".pdc");
    await expect(section).toContainText("Conservación");
    await expect(section).not.toContainText(/Storage Conditions|The Uses/);
    await expect(section.locator('[lang="en"]')).toHaveCount(0);
    await page.goto("/plant-based-concentrate-1/oat-concentrate?lang=es");
    await expect(page.locator(".pdc")).not.toContainText("Juice concentrate");
  });

  test("fruit concentrates list their packaging options at category level (C04)", async ({ page }) => {
    await page.goto("/fruits-concentrates");
    const scope = page.locator(".detail-scope");
    await expect(scope.getByRole("heading", { name: "Packaging options" })).toBeVisible();
    await expect(scope).toContainText("drums of 160 to 270 kg");
    await expect(scope).toContainText("Bulk: tank trucks");
  });
});

test.describe("desktop presentation", () => {
  test("can pages lead with the height table, diameter and lid as properties (D01)", async ({ page }) => {
    await page.goto("/aluminum-cans/std-can-d66mm");
    await expect(page.getByRole("row", { name: /^Outside diameter/ })).toContainText("66.30 mm");
    await expect(page.locator(".pdc-table--compare tbody tr")).toHaveCount(6);
    await expect(page.locator(".pdc")).not.toContainText("These precise measurements");
  });

  test("bottle references are grouped once per application, without losing a code (D03)", async ({ page }) => {
    await page.goto("/water");
    const table = page.locator(".pdc-table--references");
    await expect(table.locator('th[scope="rowgroup"]')).toHaveText(["Mineral Water Bottles", "Water Bottles"]);
    await expect(table.locator('tbody th[scope="row"]')).toHaveCount(12);
    await expect(table.locator("thead th")).not.toContainText(["Application"]);
  });

  test("a sparse formats page names only what it has (D02)", async ({ page }) => {
    await page.goto("/plant-based-concentrate-1/oat-concentrate");
    await expect(page.locator("#pdc-title")).toHaveText("Available formats");
  });

  test("product headings use the brand typeface on desktop (D10)", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop only");
    await page.goto("/merlot");
    const family = await page.locator(".product-hero h1").evaluate((h1) => getComputedStyle(h1).fontFamily);
    expect(family).toMatch(/Noto/i);
  });

  test("specification counters are singular for one (D08)", async ({ page }) => {
    await page.goto("/closures");
    await expect(page.locator(".resource-group__count").first()).not.toContainText(/\b1 specifications\b/);
  });
});

test.describe("product index (D07)", () => {
  test("one row per product with explicit actions, category jumps and search", async ({ page }) => {
    await page.goto("/en/product-index");
    const merlot = page.locator(".product-index__entries li").filter({ hasText: /^Merlot/ });
    await expect(merlot.getByRole("link", { name: "Product: Merlot" })).toHaveAttribute(
      "href",
      "/red-grape-juice/merlot"
    );
    await expect(merlot.getByRole("link", { name: "Specification: Merlot" })).toHaveAttribute("href", "/merlot");
    await expect(page.getByRole("navigation", { name: "Jump to" }).getByRole("link")).not.toHaveCount(0);
    await page.getByRole("searchbox", { name: "Search the index" }).fill("r-600");
    await expect(page.locator(".product-index__entries li")).toHaveCount(1);
    await page.getByRole("searchbox", { name: "Search the index" }).fill("zzzz");
    await expect(page.getByText("No product matches your search.")).toBeVisible();
    await page.getByRole("button", { name: "Clear search" }).first().click();
    await expect(page.locator(".product-index__entries li").first()).toBeVisible();
  });

  test("every detail page is linked from the index server HTML", async ({ request }) => {
    const html = await (await request.get("/en/product-index")).text();
    for (const path of [
      "/merlot",
      "/iqf-lime-slices/iqf-lime-1%2F4-cut",
      "/aluminium-can-ends/52mm-(202)-dia-aluminium-end",
      "/additives"
    ])
      expect(html).toContain(`href="${path}"`);
  });
});

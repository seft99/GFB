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
      const html = await (await request.get(urlOf(path, locale))).text();
      // Text as read: tags become spaces (table cells of one measurement read in order), then
      // entities are decoded so "&lt; 50" is not taken for a tag.
      const body = decode(
        html
          .slice(html.indexOf('class="section pdc'))
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
      );
      for (const text of strings(page[locale])) {
        const first = text
          .replace(/\s*\n\s*/g, "\n")
          .split("\n")[0]
          .replace(/\s+/g, " ");
        // "95.6 mm for 200 ml" cells are shown as Volume | Height rows: both values must be there.
        const pair = first.match(/^(\S+ mm) (?:for|para) (\S+ ml)$/);
        const found = pair ? body.includes(`${pair[2]} ${pair[1]}`) : body.includes(first);
        if (!found) missing.push(`${path} (${locale}): ${text}`);
      }
      if (page[locale].sections.length) expect(html, path).toContain('data-variant="');
    }
  expect(missing).toEqual([]);
});

test.describe("product information layouts", () => {
  test("the supplied premium background is limited to product detail context", async ({ page, request }) => {
    const asset = "/images/backgrounds/gfb-product-detail-background.png";
    expect((await request.get(asset)).status()).toBe(200);

    // The shared product context owns the background, rather than an inner content card.
    await page.goto("/merlot");
    await page.waitForLoadState("networkidle");
    const context = page.locator(".legacy-detail__product-context");
    await expect(context).toHaveCount(1);
    await expect
      .poll(() => context.evaluate((element) => getComputedStyle(element, "::before").backgroundImage))
      .toContain("gfb-product-detail-background.png");

    for (const url of [
      "/citrics/orange-concentrate",
      "/iqf-lemon-slices/iqf-lemon-slices",
      "/aluminium-cans"
    ]) {
      await page.goto(url);
      await expect(page.locator(".legacy-detail__product-context")).toHaveCount(1);
      await expect(page.locator(".pdc__body .legacy-detail__product-context")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    }

    // Unrelated pages never render the product-detail context.
    await page.goto("/alcoholic-beverage");
    await expect(page.locator(".legacy-detail__product-context")).toHaveCount(1);
    await page.goto("/");
    await expect(page.locator(".legacy-detail__product-context")).toHaveCount(0);
  });

  test("formats-overview: format rows with chips and the editorial overview (Orange)", async ({ page }) => {
    await page.goto("/citrics/orange-concentrate");
    const section = page.locator(".pdc");
    await expect(section).toHaveAttribute("data-variant", "formats-overview");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Available formats & product overview");
    await expect(section.locator(".pdc-formats__row")).toHaveCount(6);
    await expect(section.locator(".pdc-formats__row").first()).toContainText("Juice concentrate cloudy");
    // Promotional heading and energy/well-being copy replaced by the uses the page states.
    await expect(section.getByRole("heading", { name: "Applications" })).toBeVisible();
    await expect(section).not.toContainText(/Energizing|nutritious|Spanish orange/);
  });

  test("health text published in the oat formats table is not shown as a format", async ({ page }) => {
    await page.goto("/plant-based-concentrate-1/oat-concentrate");
    const section = page.locator(".pdc");
    await expect(section.locator(".pdc-formats__row")).toHaveCount(1);
    await expect(section).not.toContainText(/cholesterol|heart health|Benefits/);
    await expect(section.locator(".pdc-note")).toHaveCount(0);
  });

  test("facts-applications: fact cards from the published table (IQF lemon slices, EN/ES)", async ({ page }) => {
    await page.goto("/iqf-lemon-slices/iqf-lemon-slices");
    const section = page.locator(".pdc");
    await expect(section).toHaveAttribute("data-variant", "facts-applications");
    // Storage, presentation, applications, instructions; the vitamin note is a note, not a fact.
    await expect(section.locator(".pdc-fact")).toHaveCount(4);
    await expect(section.locator(".pdc-notes")).toContainText("Vitamin C");
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
    await expect(analysis.locator("thead th")).toHaveText(["Parameter", "Value", "Unit", "Condition / method"]);
    const brix = analysis.getByRole("row", { name: /^°Brix/ });
    await expect(brix.locator("td").first()).toHaveText("67 - 69");
    await expect(brix).toContainText("@ 20 °C");
    await expect(section.getByText("SO₂ Total (mg/kg)")).toBeVisible();
    // The split characteristic is one complete negative statement.
    await expect(section.getByText("No additives, flavourings or colourings of any kind")).toBeVisible();
    await expect(section).not.toContainText(/Published method|—|Download/);
    await expect(section.locator('a[href$=".pdf"], a[download]')).toHaveCount(0);
    await page.goto("/sleek-can-d57mm");
    await expect(page.locator(".pdc-identifiers li")).toHaveText(["D57.4 mm", "202# cap/lid", "Aluminium cans"]);
    await expect(page.locator(".pdc-table.is-values").first()).toContainText("250 ml");
    const heights = page.locator(".pdc-table--compare");
    await expect(heights.getByRole("row", { name: /^200 ml/ })).toContainText("95.6 mm");
    await page.goto("/aluminum-can-end-52mm-202-ise-sot");
    await expect(page.locator(".pdc-definitions dt")).toHaveText([
      "Internal lacquer specs",
      "External lacquer specs",
      "Lining compound specs"
    ]);
  });

  test("mixed technical panels compose in semantic rows, while IQF facts remain balanced", async ({ page }) => {
    await page.goto("/ripcap/crown-cork-bottle-caps");
    const crown = page.locator(".pdc-technical");
    await expect(crown.locator(":scope > .pdc-technical__pair")).toHaveCount(0);
    const crownPanels = crown.locator(":scope > .pdc-spec");
    await expect(crownPanels).toHaveCount(4);
    const crownBoxes = await crownPanels.evaluateAll((panels) => panels.map((panel) => panel.getBoundingClientRect()));
    expect(crownBoxes.every((box) => box.width > 1000)).toBe(true);
    expect(crownBoxes.slice(1).every((box, index) => box.y >= crownBoxes[index]!.bottom)).toBe(true);

    await page.goto("/merlot");
    const technical = page.locator(".pdc-technical");
    await expect(technical.locator(":scope > .pdc-technical__pair")).toHaveCount(1);
    await expect(technical.locator(".pdc-technical__pair > .pdc-spec")).toHaveCount(2);
    await expect(technical.locator(":scope > .pdc-spec")).toHaveCount(1);

    await page.goto("/iqf-orange-frozen/iqf-orange-slices--6-%2F-9-mm");
    const facts = page.locator(".pdc-facts__grid");
    await expect(facts.locator(".pdc-fact")).toHaveCount(4);
    const factsBox = (await facts.boundingBox())!;
    const detailBox = (await page.locator(".pdc-details").boundingBox())!;
    expect(detailBox.y).toBeGreaterThanOrEqual(factsBox.y + factsBox.height);
  });

  test("product-range-features: bottle models under their published groups (EN/ES)", async ({ page }) => {
    await page.goto("/alcoholic-beverage?lang=es");
    const section = page.locator(".pdc");
    await expect(section).toHaveAttribute("data-variant", "product-range-features");
    const table = section.locator(".pdc-table--references");
    await expect(table.locator('tbody th[scope="row"]')).toHaveCount(10);
    await expect(table.locator('th[scope="rowgroup"]')).toHaveCount(3);
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Referencias de producto");
    await page.goto("/soft-drinks");
    const rows = page.locator('.pdc-table--references tbody th[scope="row"]');
    await expect(rows).toHaveCount(12);
    await expect(page.getByRole("row", { name: /Soft Drinks - 455020/ })).toContainText("182.7 mm");
    await expect(page.locator(".pdc-count")).toHaveText("12 references");
    // The description sits above the table, not in a side column.
    const intro = (await page.locator(".pdc-intro").boundingBox())!;
    const box = (await page.locator(".pdc-table--references").boundingBox())!;
    expect(intro.y + intro.height).toBeLessThan(box.y);
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

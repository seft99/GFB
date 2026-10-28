import { expect, test, type Page } from "@playwright/test";

/** The e2e server runs with GFB_COMPONENT_PREVIEW=1 (playwright.config.ts). */
const preview = (page: Page, id: string) => page.locator(`[data-preview="${id}"] .resource-section`);
const rows = (page: Page, id: string) => preview(page, id).locator(".resource-row");
const cards = (page: Page, id: string) => preview(page, id).locator(".resource-card");
/** Type filter: a single-choice radio group. */
const filter = (page: Page, id: string, name: string) =>
  preview(page, id)
    .getByRole("group", { name: /^(Show|Mostrar)$/ })
    .getByRole("radio", { name, exact: true });

test.describe("product resource variants (development preview)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/component-preview");
  });

  test("is not indexable and renders both variants", async ({ page }) => {
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('[data-variant="compact-groups"]')).toHaveCount(3);
    await expect(page.locator('[data-variant="visual-cards"]')).toHaveCount(4);
  });

  test("compact groups show one row per product, its actions and the range overview", async ({ page }) => {
    const id = "preview-cans";
    const groups = preview(page, id).locator(".resource-group");
    await expect(groups).toHaveCount(2);
    await expect(groups.nth(0).locator(".resource-row")).toHaveCount(3);
    await expect(groups.nth(1).locator(".resource-row")).toHaveCount(2);
    await expect(groups.nth(0).locator(".resource-group__count")).toHaveText("3 products · 3 specifications");
    await expect(groups.nth(0).getByRole("link", { name: /^Explore range/ })).toHaveAttribute(
      "href",
      "/aluminium-cans"
    );
    const sleek = rows(page, id).filter({ hasText: "Sleek can" });
    await expect(sleek.getByRole("link", { name: "View product: Sleek can" })).toHaveAttribute(
      "href",
      "/aluminum-cans/sleek-can-d57mm"
    );
    await expect(sleek.getByRole("link", { name: "View specifications: Sleek can" })).toHaveAttribute(
      "href",
      "/sleek-can-d57mm"
    );
    await filter(page, id, "Specifications").check();
    await expect(rows(page, id)).toHaveCount(5);
    await expect(preview(page, id).getByRole("link", { name: /^View product/ })).toHaveCount(0);
  });

  test("search combines with the filter, shows an empty state and resets", async ({ page }) => {
    const id = "preview-cans";
    const input = preview(page, id).getByRole("searchbox", { name: "Search products, varieties or codes" });
    await input.fill("d66");
    await expect(rows(page, id)).toHaveCount(1);
    await expect(rows(page, id).getByRole("link", { name: /^View specifications/ })).toHaveAttribute(
      "href",
      "/std-can-d66mm"
    );
    await input.fill("korinthos");
    await filter(page, id, "Specifications").check();
    await expect(rows(page, id).getByRole("link")).toHaveAttribute("href", "/aluminum-can-end-52mm-202-std-sot");
    await input.fill("no such reference");
    await expect(preview(page, id).getByText("No matching products found.")).toBeVisible();
    await preview(page, id).getByRole("button", { name: "Clear search and filters" }).click();
    await expect(input).toHaveValue("");
    await expect(input).toBeFocused();
    await expect(rows(page, id)).toHaveCount(5);
    await input.fill("slim");
    await input.press("Escape");
    await expect(input).toHaveValue("");
  });

  test("a single group uses the full width with its header beside the rows", async ({ page }) => {
    const id = "preview-single-group";
    await expect(preview(page, id).locator(".resource-group")).toHaveCount(1);
    await expect(preview(page, id).locator(".resource-group__image")).toHaveCount(0);
    if (page.viewportSize()!.width >= 1000) {
      const group = await preview(page, id).locator(".resource-group").boundingBox();
      const head = await preview(page, id).locator(".resource-group__head").boundingBox();
      const list = await preview(page, id).locator(".resource-rows").boundingBox();
      expect(head!.x + head!.width).toBeLessThanOrEqual(list!.x);
      expect(group!.width).toBeGreaterThan(60 * 16);
    }
  });

  test("cards show licensed photos where available and a neutral fallback otherwise", async ({ page }) => {
    const bottles = cards(page, "preview-bottles");
    await expect(bottles).toHaveCount(3);
    await expect(bottles.getByRole("img")).toHaveCount(3);
    const fallbackCards = cards(page, "preview-cans-as-cards");
    await expect(fallbackCards).toHaveCount(5);
    await expect(fallbackCards.locator(".resource-card__fallback")).toHaveCount(5);
    const slim = fallbackCards.filter({ has: page.getByRole("heading", { name: "Slim can", exact: true }) });
    await expect(slim.getByRole("link", { name: /^View product/ })).toHaveAttribute(
      "href",
      "/aluminum-cans/slim-can-d53mm"
    );
    await expect(slim.getByRole("link", { name: /^View specifications/ })).toHaveAttribute("href", "/slim-can-d53mm");
    await filter(page, "preview-cans-as-cards", "Specifications").check();
    await expect(fallbackCards).toHaveCount(5);
  });

  test("collections without technical sheets get no type filter and no toolbar", async ({ page }) => {
    for (const id of ["preview-labels", "preview-bottles", "preview-plant-based-concentrates"]) {
      await expect(preview(page, id).getByRole("radio")).toHaveCount(0);
      await expect(preview(page, id).getByRole("searchbox")).toHaveCount(0);
      await expect(preview(page, id).getByRole("link", { name: /View specifications/ })).toHaveCount(0);
    }
  });

  test("Spanish uses Spanish labels and URLs", async ({ page }) => {
    await page.goto("/es/component-preview");
    const id = "preview-cans";
    await expect(preview(page, id).locator(".resource-group h3").first()).toHaveText("Latas de aluminio");
    const slim = rows(page, id).filter({ hasText: "Lata slim" });
    await expect(slim.getByRole("link", { name: /^Ver especificaciones/ })).toHaveAttribute(
      "href",
      "/slim-can-d53mm?lang=es"
    );
    await expect(filter(page, id, "Especificaciones")).toBeVisible();
  });

  test("type filters are a radio group operable with the keyboard", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard check on desktop");
    const id = "preview-cans";
    await filter(page, id, "All").focus();
    await page.keyboard.press("ArrowRight");
    await expect(filter(page, id, "Products")).toBeChecked();
    await expect(filter(page, id, "All")).not.toBeChecked();
    await expect(preview(page, id).getByRole("link", { name: /^View specifications/ })).toHaveCount(0);
    await expect(rows(page, id)).toHaveCount(5);
  });
});

test.describe("category pages use their assigned presentation", () => {
  for (const url of ["/fruits-concentrates", "/frozen-fruits"])
    test(`${url} keeps the technical library`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator(".tech-library")).toHaveCount(1);
      await expect(page.locator(".resource-section")).toHaveCount(0);
    });

  for (const [url, variant, links, images, title] of [
    ["/cans", "compact-groups", 12, 2, "Explore can formats and ends"],
    ["/closures", "compact-groups", 9, 1, "Explore closure formats"],
    ["/bottles", "visual-cards", 3, 3, "Explore bottle applications"],
    ["/labels", "visual-cards", 3, 1, "Explore label solutions"],
    ["/plant-based-concentrate", "visual-cards", 2, 2, "Explore oat and almond concentrates"]
  ] as const)
    test(`${url} renders ${variant} with every published page`, async ({ page }) => {
      await page.goto(url);
      const section = page.locator(".resource-section");
      await expect(section).toHaveAttribute("data-variant", variant);
      await expect(section.getByRole("heading", { level: 2 })).toHaveText(title);
      await expect(section.locator("a[href^='/']")).toHaveCount(links);
      await expect(section.locator("img")).toHaveCount(images);
      await expect(page.locator(".legacy-catalogue")).toHaveCount(0);
      await expect(section).not.toContainText(/published product pages|Product page|Download/);
      // The page keeps its own closing call to action; the section adds none.
      await expect(section.locator(".resource-cta")).toHaveCount(0);
      // Every image loads (no broken paths).
      for (const image of await section.locator("img").all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
      }
    });

  test("/cans links products and specifications with Spanish URLs", async ({ page }) => {
    await page.goto("/cans?lang=es");
    const section = page.locator(".resource-section");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Explore formatos de lata y tapas");
    await expect(section.locator(".resource-action.is-technical")).toHaveCount(5);
    await expect(
      section
        .locator(".resource-row")
        .filter({ hasText: "Lata slim" })
        .getByRole("link", { name: /^Ver especificaciones/ })
    ).toHaveAttribute("href", "/slim-can-d53mm?lang=es");
    await section.getByRole("radio", { name: "Especificaciones" }).check();
    await expect(section.getByRole("link", { name: /^Ver producto/ })).toHaveCount(0);
    await expect(section).not.toContainText("GFB have");
  });

  test("/bottles cards carry verified descriptions and Spanish URLs", async ({ page }) => {
    await page.goto("/bottles?lang=es");
    const water = page.locator(".resource-card").filter({ has: page.getByRole("heading", { name: "Agua" }) });
    await expect(water.getByRole("link", { name: /^Ver producto/ })).toHaveAttribute("href", "/water?lang=es");
    await expect(water.getByRole("img")).toHaveAttribute("alt", /vidrio/);
    await expect(water).toContainText("12 referencias de botella de vidrio para agua, de 330 a 750 cc.");
    await page.goto("/bottles");
    await expect(page.locator(".resource-section")).not.toContainText("contamination");
  });

  test("label cards use consistent names and an illustration instead of an empty placeholder", async ({ page }) => {
    await page.goto("/labels");
    const section = page.locator(".resource-section");
    await expect(section.getByRole("heading", { level: 3 })).toHaveText([
      "Shrink sleeve labels",
      "Wash-off labels",
      "Wet-glue labels"
    ]);
    await expect(section.locator(".resource-illustration")).toHaveCount(2);
    await expect(section.locator(".resource-card__fallback")).toHaveCount(0);
  });

  test("two products sit side by side across the content width", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop composition");
    await page.goto("/plant-based-concentrate");
    const [first, second] = await page.locator(".resource-card").all();
    const a = (await first.boundingBox())!;
    const b = (await second.boundingBox())!;
    expect(Math.abs(a.y - b.y)).toBeLessThan(2);
    const list = (await page.locator(".resource-cards").boundingBox())!;
    expect(b.x + b.width).toBeGreaterThan(list.x + list.width - 2);
  });
});

import { expect, test, type Page } from "@playwright/test";

/** The e2e server runs with GFB_COMPONENT_PREVIEW=1 (playwright.config.ts). */
const preview = (page: Page, id: string) => page.locator(`[data-preview="${id}"] .resource-section`);
const rows = (page: Page, id: string) => preview(page, id).locator(".resource-row");
const cards = (page: Page, id: string) => preview(page, id).locator(".resource-card");
const filter = (page: Page, id: string, name: string) =>
  preview(page, id)
    .getByRole("group", { name: /Resource type|Tipo de recurso/ })
    .getByRole("button", { name });

test.describe("product resource variants (development preview)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/component-preview");
  });

  test("is not indexable and renders both variants", async ({ page }) => {
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('[data-variant="compact-groups"]')).toHaveCount(2);
    await expect(page.locator('[data-variant="visual-cards"]')).toHaveCount(2);
  });

  test("compact groups list every resource with its verified type", async ({ page }) => {
    const id = "preview-cans-groups";
    const groups = preview(page, id).locator(".resource-group");
    await expect(groups).toHaveCount(2);
    await expect(groups.nth(0).locator(".resource-row")).toHaveCount(7);
    await expect(groups.nth(1).locator(".resource-row")).toHaveCount(5);
    await expect(groups.nth(0).locator(".resource-group__count")).toHaveText("7 resources");
    const sleekSheet = rows(page, id).filter({ hasText: "Sleek can" }).filter({ hasText: "Technical sheet" });
    await expect(sleekSheet).toHaveAttribute("href", "/sleek-can-d57mm");
    await filter(page, id, "Technical sheets").click();
    await expect(rows(page, id)).toHaveCount(4);
    await expect(rows(page, id).filter({ hasText: "Product page" })).toHaveCount(0);
  });

  test("search combines with the filter, shows an empty state and resets", async ({ page }) => {
    const id = "preview-cans-groups";
    const input = preview(page, id).getByRole("searchbox", { name: "Search products, varieties or codes" });
    await input.fill("d66");
    await expect(rows(page, id)).toHaveCount(1);
    await expect(rows(page, id)).toHaveAttribute("href", "/std-can-d66mm");
    await input.fill("korinthos");
    await filter(page, id, "Technical sheets").click();
    await expect(rows(page, id)).toHaveAttribute("href", "/aluminum-can-end-52mm-202-std-sot");
    await input.fill("no such reference");
    await expect(preview(page, id).getByText("No matching references found.")).toBeVisible();
    await preview(page, id).getByRole("button", { name: "Clear search and filters" }).click();
    await expect(input).toHaveValue("");
    await expect(input).toBeFocused();
    await expect(rows(page, id)).toHaveCount(12);
    await input.fill("slim");
    await input.press("Escape");
    await expect(input).toHaveValue("");
  });

  test("a single group renders as one contained panel", async ({ page }) => {
    const id = "preview-closures-group";
    await expect(preview(page, id).locator(".resource-group")).toHaveCount(1);
    await expect(rows(page, id)).toHaveCount(9);
    await expect(preview(page, id).getByRole("searchbox")).toHaveCount(0);
    const box = await preview(page, id).locator(".resource-groups").boundingBox();
    const viewport = page.viewportSize()!;
    if (viewport.width >= 1000) expect(box!.width).toBeLessThanOrEqual(54 * 16 + 1);
  });

  test("visual cards show photos where published, a neutral fallback otherwise, and real links", async ({ page }) => {
    const id = "preview-cans-cards";
    await expect(cards(page, id)).toHaveCount(8);
    const slim = cards(page, id).filter({ has: page.getByRole("heading", { name: "Slim can", exact: true }) });
    await expect(slim.getByRole("img")).toHaveAttribute("alt", "Plain aluminium can with condensation");
    await expect(slim.getByRole("link", { name: /^Product page/ })).toHaveAttribute(
      "href",
      "/aluminum-cans/slim-can-d53mm"
    );
    await expect(slim.getByRole("link", { name: /^Technical sheet/ })).toHaveAttribute("href", "/slim-can-d53mm");
    await expect(cards(page, id).locator(".resource-card__fallback")).toHaveCount(3);
    await filter(page, id, "Technical sheets").click();
    await expect(cards(page, id)).toHaveCount(4);
    await preview(page, id).getByRole("searchbox").fill("ise");
    await expect(cards(page, id)).toHaveCount(1);
  });

  test("collections without technical sheets get no type filter and no toolbar", async ({ page }) => {
    const id = "preview-labels-cards";
    await expect(cards(page, id)).toHaveCount(3);
    await expect(preview(page, id).getByRole("group", { name: "Resource type" })).toHaveCount(0);
    await expect(preview(page, id).getByRole("searchbox")).toHaveCount(0);
    await expect(preview(page, id).getByRole("link", { name: /Technical sheet/ })).toHaveCount(0);
    await expect(preview(page, id).locator(".resource-cta a")).toHaveAttribute("href", /^\/en\/contact\?/);
  });

  test("Spanish uses Spanish labels and URLs", async ({ page }) => {
    await page.goto("/es/component-preview");
    const id = "preview-cans-groups";
    await expect(preview(page, id).locator(".resource-group h3").first()).toHaveText("Latas de aluminio");
    const sheet = rows(page, id).filter({ hasText: "Lata slim" }).filter({ hasText: "Ficha técnica" });
    await expect(sheet).toHaveAttribute("href", "/slim-can-d53mm?lang=es");
    await expect(filter(page, id, "Fichas técnicas")).toBeVisible();
  });

  test("filters are keyboard operable and report their state", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard check on desktop");
    const id = "preview-cans-groups";
    const button = filter(page, id, "Product pages");
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(rows(page, id)).toHaveCount(8);
  });
});

test.describe("category pages use their assigned presentation", () => {
  for (const url of ["/fruits-concentrates", "/frozen-fruits"])
    test(`${url} keeps the technical library`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator(".tech-library")).toHaveCount(1);
      await expect(page.locator(".resource-section")).toHaveCount(0);
    });

  for (const [url, variant, links] of [
    ["/cans", "compact-groups", 12],
    ["/closures", "compact-groups", 9],
    ["/bottles", "compact-groups", 3],
    ["/plant-based-concentrate", "compact-groups", 2],
    ["/labels", "visual-cards", 3]
  ] as const)
    test(`${url} renders ${variant} with every published page`, async ({ page }) => {
      await page.goto(url);
      const section = page.locator(".resource-section");
      await expect(section).toHaveAttribute("data-variant", variant);
      await expect(section.locator("a[href^='/']")).toHaveCount(links);
      await expect(page.locator(".legacy-catalogue")).toHaveCount(0);
      // The page keeps its own closing call to action; the section adds none.
      await expect(section.locator(".resource-cta")).toHaveCount(0);
    });

  test("/cans links product pages and technical sheets with Spanish URLs", async ({ page }) => {
    await page.goto("/cans?lang=es");
    const section = page.locator(".resource-section");
    await expect(section.locator(".resource-row.is-technical")).toHaveCount(4);
    await expect(section.locator(".resource-row").filter({ hasText: "Lata slim" }).last()).toHaveAttribute(
      "href",
      "/slim-can-d53mm?lang=es"
    );
    await section.getByRole("button", { name: "Fichas técnicas" }).click();
    await expect(section.locator(".resource-row")).toHaveCount(4);
  });

  test("/labels shows the published wash-off photograph and no technical filter", async ({ page }) => {
    await page.goto("/labels");
    const section = page.locator(".resource-section");
    await expect(section.getByRole("img", { name: /wash-off labels/ })).toHaveCount(1);
    await expect(section.getByRole("group", { name: "Resource type" })).toHaveCount(0);
  });
});

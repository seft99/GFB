import { expect, test, type Page } from "@playwright/test";

const toggle = (page: Page, id: string) => page.locator(`button[aria-controls="mega-${id}"]`);
const panel = (page: Page, id: string) => page.locator(`#mega-${id}`);
const libraryFamily = (page: Page, name: string) =>
  page.locator(".tech-library").getByRole("radio", { name: new RegExp(`^${name}`) });

test.describe("desktop mega menu", () => {
  test.skip(({ isMobile }) => isMobile, "desktop navigation");

  test("division labels stay links; chevrons open and close their panel", async ({ page }) => {
    await page.goto("/");
    await expect(toggle(page, "raw-materials")).toHaveAttribute("aria-expanded", "false");
    await toggle(page, "raw-materials").click();
    await expect(toggle(page, "raw-materials")).toHaveAttribute("aria-expanded", "true");
    await expect(panel(page, "raw-materials")).toBeVisible();
    // Open but not current: the homepage keeps Raw materials unmarked.
    await expect(
      page.locator(".desktop-nav").getByRole("link", { name: "Raw materials", exact: true })
    ).not.toHaveAttribute("aria-current", "page");
    await toggle(page, "packaging-solutions").click();
    await expect(panel(page, "raw-materials")).toBeHidden();
    await expect(panel(page, "packaging-solutions")).toBeVisible();
    await toggle(page, "packaging-solutions").click();
    await expect(panel(page, "packaging-solutions")).toBeHidden();
    await page.locator(".desktop-nav").getByRole("link", { name: "Packaging", exact: true }).click();
    await expect(page).toHaveURL(/\/packaging-solutions$/);
  });

  test("hover opens, the pointer can travel into the panel, leaving closes", async ({ page }) => {
    await page.goto("/");
    const link = page.locator(".desktop-nav").getByRole("link", { name: "Flavours", exact: true });
    await link.hover();
    await expect(panel(page, "flavours-aromas")).toBeVisible();
    const box = (await link.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height + 20, { steps: 6 });
    await panel(page, "flavours-aromas").getByRole("link", { name: "Beverage applications" }).hover();
    await expect(panel(page, "flavours-aromas")).toBeVisible();
    // "Explore all" keeps a readable brand colour on hover (never the navbar's white).
    const footer = panel(page, "flavours-aromas").locator(".mega-menu__footer");
    await footer.hover();
    await expect(footer).toHaveCSS("color", "rgb(20, 87, 217)");
    await page.mouse.move(20, 700, { steps: 4 });
    await expect(panel(page, "flavours-aromas")).toBeHidden();
  });

  test("Escape closes and returns focus; outside clicks close; Tab enters the panel", async ({ page }) => {
    await page.goto("/");
    await toggle(page, "industrial-consulting").focus();
    await page.keyboard.press("Enter");
    await expect(panel(page, "industrial-consulting")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(panel(page, "industrial-consulting").getByRole("link", { name: "Food sector" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(panel(page, "industrial-consulting")).toBeHidden();
    await expect(toggle(page, "industrial-consulting")).toBeFocused();
    await toggle(page, "raw-materials").click();
    await page.mouse.click(30, 760);
    await expect(panel(page, "raw-materials")).toBeHidden();
  });

  test("concentrate family links select the family in the technical library", async ({ page }) => {
    await page.goto("/");
    await toggle(page, "raw-materials").click();
    await panel(page, "raw-materials").getByRole("link", { name: "Mediterranean" }).click();
    await expect(page).toHaveURL(/\/fruits-concentrates\?family=mediterranean#concentrates-library-title$/);
    await expect(libraryFamily(page, "Mediterranean")).toBeChecked();
    await expect(page.locator("#concentrates-library-title")).toBeInViewport();
    await expect(panel(page, "raw-materials")).toBeHidden();
    // Same page: the selection follows a second family link.
    await toggle(page, "raw-materials").click();
    await panel(page, "raw-materials").getByRole("link", { name: "Tropical" }).click();
    await expect(page).toHaveURL(/family=tropical/);
    await expect(libraryFamily(page, "Tropical")).toBeChecked();
    await page.reload();
    await expect(libraryFamily(page, "Tropical")).toBeChecked();
    await page.goBack();
    await expect(libraryFamily(page, "Mediterranean")).toBeChecked();
  });

  test("quick access destinations exist", async ({ page }) => {
    for (const [name, url, check] of [
      ["Orange concentrate", /\/citrics\/orange-concentrate$/, "Orange concentrate"],
      ["IQF lemon", /\/iqf-lemon$/, "IQF frozen lemon"]
    ] as const) {
      await page.goto("/");
      await toggle(page, "raw-materials").click();
      await panel(page, "raw-materials").getByRole("link", { name }).click();
      await expect(page).toHaveURL(url);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(check);
    }
    await page.goto("/");
    await toggle(page, "raw-materials").click();
    await panel(page, "raw-materials").getByRole("link", { name: "Red grape specifications" }).click();
    await expect(libraryFamily(page, "Red grape specifications")).toBeChecked();
  });

  test("category pages mark their division as current", async ({ page }) => {
    await page.goto("/cans");
    await expect(page.locator(".desktop-nav").getByRole("link", { name: "Packaging", exact: true })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  test("Spanish labels and localized destinations", async ({ page }) => {
    await page.goto("/?lang=es");
    await toggle(page, "raw-materials").click();
    const raw = panel(page, "raw-materials");
    await expect(raw.getByText("Familias de concentrados")).toBeVisible();
    await expect(raw.getByRole("link", { name: "Cítricos", exact: true })).toHaveAttribute(
      "href",
      "/fruits-concentrates?lang=es&family=citrus#concentrates-library-title"
    );
    await expect(raw.getByRole("link", { name: "Explorar Materias primas" })).toHaveAttribute(
      "href",
      "/raw-materials?lang=es"
    );
    await toggle(page, "industrial-consulting").click();
    await expect(
      panel(page, "industrial-consulting").getByRole("link", { name: "Sector alimentario" })
    ).toHaveAttribute("href", "/es/consultoria-industrial/sector-alimentario");
  });
});

test.describe("mobile navigation accordions", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile navigation");

  test("division link and separate expand control", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open navigation" }).click();
    const menu = page.locator("#mobile-menu");
    const expand = menu.getByRole("button", { name: "Raw materials: show menu" });
    await expect(expand).toHaveAttribute("aria-expanded", "false");
    await expand.click();
    await expect(expand).toHaveAttribute("aria-expanded", "true");
    await expect(menu.getByRole("link", { name: "IQF frozen citrus" })).toBeVisible();
    await menu.getByRole("link", { name: "Orange concentrate" }).click();
    await expect(page).toHaveURL(/\/citrics\/orange-concentrate$/);
    await expect(menu).not.toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBe(0);
  });
});

test("every menu link is in the server HTML", async ({ request }) => {
  const html = await (await request.get("/")).text();
  for (const href of [
    "/fruits-concentrates?family=citrus#concentrates-library-title",
    "/citrics/orange-concentrate",
    "/iqf-lemon",
    "/en/industrial-consulting/pharmaceutical-sector",
    "/labels",
    "/savoury"
  ])
    expect(html).toContain(`href="${href}"`);
});

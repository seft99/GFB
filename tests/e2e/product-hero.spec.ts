import { expect, test } from "@playwright/test";

const hero = ".product-hero";

test.describe("product detail hero", () => {
  test("Orange concentrate: title, family, description, photograph and actions", async ({ page }) => {
    await page.goto("/citrics/orange-concentrate");
    const section = page.locator(hero);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(section.getByRole("heading", { level: 1 })).toHaveText("Orange concentrate");
    await expect(section.locator(".product-hero__eyebrow")).toHaveText("Citrus concentrates");
    await expect(section.locator(".product-hero__lead")).toHaveText(
      "Available as concentrates, juices & purees, organics, cells, essential oils and deionized concentrates."
    );
    const image = section.getByRole("img", { name: "Two oranges with leaves" });
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    await expect(section.getByRole("link", { name: "Discuss your project" })).toHaveAttribute(
      "href",
      /^\/en\/contact\?/
    );
    await expect(section.getByRole("link", { name: "Back to Fruit & vegetable concentrates" })).toHaveAttribute(
      "href",
      "/fruits-concentrates"
    );
    const crumbs = section.getByRole("navigation", { name: /breadcrumb/i });
    await expect(crumbs.locator('[aria-current="page"]')).toHaveText("Orange concentrate");
    await expect(section.locator(".product-hero__curves")).toHaveAttribute("aria-hidden", "true");
    // The page content below the hero is unchanged.
    await expect(page.getByRole("heading", { name: "Available formats", exact: true })).toBeVisible();
  });

  test("Spanish keeps Spanish content, alt text and URLs", async ({ page }) => {
    await page.goto("/citrics/orange-concentrate?lang=es");
    const section = page.locator(hero);
    await expect(section.getByRole("heading", { level: 1 })).toHaveText("Concentrado de naranja");
    await expect(section.getByRole("img", { name: "Dos naranjas con hojas" })).toBeVisible();
    await expect(section.getByRole("link", { name: /^Volver a/ })).toHaveAttribute(
      "href",
      "/fruits-concentrates?lang=es"
    );
  });

  test("technical specification pages use the technical-document variant", async ({ page }) => {
    // The H1 is the published name verbatim; a code it carries shows as a smaller second line.
    for (const [url, name, code] of [
      ["/merlot", "MERLOT", null],
      ["/slim-can-d53mm", "Slim can", "D53 mm 200# cap/lid"],
      ["/aluminum-can-end-52mm-202-ise-sot", "52mm (202) Dia ISE Aluminium End", "SOT - Large Aperture (Botcherby)"]
    ] as const) {
      await page.goto(url);
      const section = page.locator(hero);
      await expect(section).toHaveClass(/product-hero--technical-document/);
      await expect(section.getByRole("heading", { level: 1 })).toContainText(name, { ignoreCase: true });
      if (code) await expect(section.locator(".product-hero__code")).toHaveText(code);
      else await expect(section.locator(".product-hero__code")).toHaveCount(0);
      await expect(section.locator(".product-hero__eyebrow")).toHaveText("Technical specification");
      await expect(section.locator("img")).toHaveCount(0);
    }
  });

  test("products without an approved photograph get the image-free layout", async ({ page }) => {
    for (const url of [
      "/citrics/white-grapefruit-concentrate",
      "/iqf-lemon-peel-zest/iqf-lemon-peel-square",
      "/ripcap/26-mm-ripcap"
    ]) {
      await page.goto(url);
      await expect(page.locator(hero)).toHaveClass(/no-image/);
      await expect(page.locator(`${hero} img`)).toHaveCount(0);
    }
  });

  test("the back action follows each product's own parent category", async ({ page }) => {
    for (const [url, href] of [
      ["/iqf-orange-frozen/iqf-orange-13-x-13-sticks", "/frozen-fruits"],
      ["/aluminium-can-ends/52mm-(202)-dia-ise-aluminium-end", "/cans"],
      ["/soft-drinks", "/bottles"],
      ["/plant-based-concentrate-1/oat-concentrate", "/plant-based-concentrate"]
    ] as const) {
      await page.goto(url);
      await expect(page.locator(`${hero} .product-hero__secondary`)).toHaveAttribute("href", href);
    }
  });

  test("long names stay inside the editorial column without overflow", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop composition");
    await page.goto("/aluminum-can-end-52mm-202-ise-sot");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBe(0);
    const title = page.locator(`${hero} h1`);
    expect(await title.evaluate((h1) => h1.scrollWidth <= h1.clientWidth + 1)).toBe(true);
  });

  test("newly sourced photographs load at a sharp size", async ({ page }) => {
    for (const url of ["/tropical/white-guava", "/tropical/tamarind", "/aluminum-cans/std-can-d66mm"]) {
      await page.goto(url);
      const image = page.locator(`${hero} img`);
      await expect(image).toHaveCount(1);
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBeTruthy();
      await expect(image).not.toHaveAttribute("alt", "");
    }
  });

  test("the H1 keeps the published wording (page identity)", async ({ page }) => {
    await page.goto("/iqf-lemon-slices/iqf-lemon-one-eights-cut");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("IQF lemon one eights cut");
  });
});

test("the server HTML already links each product to the same product in the other language", async ({ request }) => {
  for (const [url, href] of [
    ["/aluminum-cans/std-can-d66mm", "/aluminum-cans/std-can-d66mm?lang=es"],
    ["/iqf-lime-slices/iqf-lime-1%2F4-cut", "/iqf-lime-slices/iqf-lime-1%2F4-cut?lang=es"],
    ["/tropical/white-guava?lang=es", "/tropical/white-guava"]
  ] as const) {
    const html = await (await request.get(url)).text();
    expect(html.match(/<a[^>]*class="language-link"[^>]*>/)?.[0]).toContain(`href="${href}"`);
  }
});

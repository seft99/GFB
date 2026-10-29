import { expect, test } from "@playwright/test";

const section = ".family-related";

test.describe("More in this family", () => {
  test("Merlot product page: one Merlot card that links only to its specification", async ({ page }) => {
    await page.goto("/red-grape-juice/merlot");
    const related = page.locator(section);
    await expect(related.locator(".eyebrow")).toHaveText("Red grape juice concentrates");
    await expect(related.getByRole("heading", { level: 2 })).toHaveText("More in this family");
    await expect(related.locator(".family-related__card")).toHaveCount(9);
    const merlot = related
      .locator(".family-related__card")
      .filter({ has: page.getByRole("heading", { name: "Merlot" }) });
    await expect(merlot.getByRole("link")).toHaveCount(1);
    await expect(merlot.getByRole("link", { name: "Technical specification: Merlot" })).toHaveAttribute(
      "href",
      "/merlot"
    );
    const malbec = related
      .locator(".family-related__card")
      .filter({ has: page.getByRole("heading", { name: "Malbec" }) });
    await expect(malbec.getByRole("link")).toHaveText(["Product page", "Technical specification"]);
    await expect(malbec.getByRole("link", { name: "Product page: Malbec" })).toHaveAttribute(
      "href",
      "/red-grape-juice/malbec"
    );
    await expect(related.locator('a[href="/red-grape-juice/merlot"]')).toHaveCount(0);
    await expect(related.getByRole("link", { name: "Explore all red grape resources" })).toHaveAttribute(
      "href",
      "/fruits-concentrates?family=red-grape#concentrates-library-title"
    );
  });

  test("Merlot specification links back to the Merlot product page, in Spanish", async ({ page }) => {
    await page.goto("/merlot?lang=es");
    const related = page.locator(section);
    await expect(related.getByRole("heading", { level: 2 })).toHaveText("Más en esta familia");
    await expect(related.getByRole("link", { name: "Ficha de producto: Merlot" })).toHaveAttribute(
      "href",
      "/red-grape-juice/merlot?lang=es"
    );
    await expect(related.locator('a[href="/merlot?lang=es"]')).toHaveCount(0);
  });

  test("no page links to itself and every link is a published page", async ({ page }) => {
    for (const url of [
      "/citrics/orange-concentrate",
      "/tropical/mango",
      "/red-800",
      "/iqf-lemon-slices/iqf-lemon-slices",
      "/iqf-lemon",
      "/plant-based-concentrate-1/oat-concentrate",
      "/soft-drinks",
      "/aluminum-can-end-52mm-202-ise-sot",
      "/26mm-ripcap"
    ]) {
      await page.goto(url);
      const hrefs = await page
        .locator(`${section} .family-related__links a`)
        .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
      expect(hrefs.length, url).toBeGreaterThan(0);
      expect(hrefs, url).not.toContain(url);
      expect(new Set(hrefs).size, url).toBe(hrefs.length);
    }
  });

  test("a family with one other product shows one card; a hub that lists all its formats shows none", async ({
    page
  }) => {
    await page.goto("/plant-based-concentrate-1/oat-concentrate");
    await expect(page.locator(`${section} .family-related__card`)).toHaveCount(1);
    await expect(page.locator(section).getByRole("link", { name: "Product page: Almond concentrate" })).toBeVisible();
    await page.goto("/iqf-orange");
    await expect(page.locator(section)).toHaveCount(0);
  });

  test("the family directory link lands on the family's group", async ({ page }) => {
    for (const url of ["/water", "/aluminum-cans/slim-can-d53mm", "/iqf-lime-slices/iqf-lime-zest"]) {
      await page.goto(url);
      const href = (await page.locator(".family-related__more a").getAttribute("href"))!;
      await page.goto(href);
      const anchor = href.split("#")[1];
      await expect(page.locator(`[id="${anchor}"]`), url).toHaveCount(1);
    }
  });

  test("single-destination cards are clickable as a whole; keyboard reaches each link", async ({ page, isMobile }) => {
    test.skip(isMobile, "pointer and keyboard on desktop");
    await page.goto("/citrics/orange-concentrate");
    const card = page.locator(`${section} .family-related__card`).first();
    await card.scrollIntoViewIfNeeded();
    const box = (await card.boundingBox())!;
    await page.mouse.click(box.x + box.width - 12, box.y + box.height / 2);
    await expect(page).toHaveURL(/\/citrics\/white-grapefruit-concentrate$/);
    await page.goto("/red-grape-juice/malbec");
    const links = page.locator(`${section} .family-related__links a`);
    await links.first().focus();
    await expect(links.first()).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(links.nth(1)).toBeFocused();
  });
});

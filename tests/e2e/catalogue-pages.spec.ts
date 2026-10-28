import { expect, test } from "@playwright/test";

const content = ".legacy-detail__content";

test.describe("catalogue product pages", () => {
  test("red grape overviews show their full product overview (Merlot, RED-800)", async ({ page }) => {
    for (const [url, text] of [
      ["/red-grape-juice/merlot", /Merlot is a 100% natural red grape juice concentrate/],
      ["/red-grape-juice/red-800", /RED-800 is a high-quality red grape extract/]
    ] as const) {
      await page.goto(url);
      const heading = page.locator(content).getByRole("heading", { name: /Product Overview$/ });
      await expect(heading).toBeVisible();
      await expect(heading.locator("xpath=following-sibling::*[1]")).toHaveText(text);
    }
  });

  test("detail pages render no empty headings", async ({ page }) => {
    for (const url of [
      "/red-grape-juice/merlot",
      "/red-grape-concentrate",
      "/tropical/coconut",
      "/iqf-lemon",
      "/iqf-orange?lang=es",
      "/iqf-grapefruit",
      "/iqf-grapefruit-frozen/iqf-grapefruit-slices"
    ]) {
      await page.goto(url);
      const empty = await page.locator(`${content} :is(h2, h3)`).evaluateAll((headings) =>
        headings
          .filter((heading) => {
            const next = heading.nextElementSibling;
            return !next || /^H[23]$/.test(next.tagName);
          })
          .map((heading) => heading.textContent)
      );
      expect(empty, url).toEqual([]);
    }
  });

  test("IQF overview pages link to every published reference", async ({ page }) => {
    for (const [url, count] of [
      ["/iqf-lemon", 9],
      ["/iqf-orange", 10],
      ["/iqf-lime", 6],
      ["/iqf-grapefruit", 4]
    ] as const) {
      await page.goto(url);
      await expect(page.locator(`${content} .legacy-detail__refs a`), url).toHaveCount(count);
    }
    await page.goto("/iqf-lemon");
    await page.locator(".legacy-detail__refs").getByRole("link", { name: "IQF lemon sticks" }).click();
    await expect(page).toHaveURL(/\/iqf-lemon-slices\/iqf-lemon-sticks$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("IQF lemon sticks");
  });

  test("the red grape overview links each variety and keeps Spanish URLs", async ({ page }) => {
    await page.goto("/red-grape-concentrate?lang=es");
    const links = page.locator(`${content} .legacy-detail__section-link`);
    await expect(links).toHaveCount(7);
    await expect(links.first()).toHaveAttribute("href", "/red-grape-juice/merlot?lang=es");
  });

  test("lime pages describe lime, not lemon", async ({ page }) => {
    await page.goto("/iqf-lime-slices/iqf-lime-slice--6-%2F-9-mm");
    await expect(page.locator(content)).toContainText("a slice cut from the lime fruit");
    await expect(page.locator(content)).not.toContainText(/lemon fruit|yellow skin/);
    await page.goto("/iqf-lime-slices/iqf-lime-1%2F8-cut");
    await expect(page.locator(content)).toContainText("IQF Lime 1/8 Cut");
  });

  test("frozen library labels references, pages and overview pages", async ({ page }) => {
    await page.goto("/frozen-fruits");
    const panel = page.locator(".tech-library__family-panel:visible");
    await expect(panel.locator(".tech-library__count")).toHaveText("9 references · 11 pages");
    await expect(panel.getByRole("link", { name: /^Overview page/ })).toHaveCount(2);
    await expect(panel.getByRole("link", { name: /^Product page/ })).toHaveCount(9);
  });
});

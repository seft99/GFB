import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  "/en",
  "/es",
  "/es/sobre-gfb",
  "/en/packaging-solutions",
  "/es/materias-primas/concentrados-de-frutas",
  "/en/contact",
  "/es/legal/privacidad"
];

for (const path of pages) {
  test(`${path} has no WCAG 2.2 AA violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const summary = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      targets: violation.nodes.slice(0, 3).map((node) => node.target.join(" "))
    }));
    expect(summary).toEqual([]);
  });
}

test("every page exposes a single h1 and a skip link to main content", async ({ page }) => {
  for (const path of pages) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 }), path).toHaveCount(1);
    await expect(page.locator('a.skip-link[href="#main-content"]'), path).toHaveCount(1);
    await expect(page.locator("main#main-content"), path).toHaveCount(1);
  }
});

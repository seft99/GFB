import { expect, test } from "@playwright/test";

test.describe("mobile navigation", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("opens, closes with Escape and closes after navigating", async ({ page }) => {
    await page.goto("/es");
    const toggle = page.getByRole("button", { name: "Abrir navegación" });
    await toggle.click();
    await expect(page.getByRole("button", { name: "Cerrar navegación" })).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await page
      .getByRole("navigation", { name: "Navegación móvil" })
      .getByRole("link", { name: /Sobre GFB/ })
      .click();
    await expect(page).toHaveURL(/\/es\/sobre-gfb$/);
    await expect(page.getByRole("button", { name: "Abrir navegación" })).toHaveAttribute("aria-expanded", "false");
  });

  test("pages never scroll horizontally", async ({ page }) => {
    for (const path of ["/es", "/es/materias-primas/concentrados-de-frutas", "/es/contacto"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("contact form", () => {
  test("prefills context from the category link", async ({ page }) => {
    await page.goto("/es/soluciones-de-embalaje/latas");
    await page.getByRole("main").getByRole("link", { name: "Iniciar una consulta" }).first().click();
    await expect(page).toHaveURL(/\/es\/contacto\?interest=packaging-solutions/);
    await expect(page.getByLabel("Área de interés")).toHaveValue("packaging-solutions");
    await expect(page.getByLabel("Producto, categoría o servicio")).toHaveValue("Latas y tapas de aluminio");
  });

  test("validates in the browser and focuses the first invalid field", async ({ page }) => {
    await page.goto("/es/contacto");
    await page.getByRole("button", { name: "Enviar consulta" }).click();
    await expect(page.getByRole("status")).toHaveText("Revise los campos marcados.");
    await expect(page.getByLabel("Nombre")).toBeFocused();
    await expect(page.getByLabel("Nombre")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator(".field-error")).toHaveCount(5);
  });

  test("submits through the Server Action and reports that delivery is pending", async ({ page }) => {
    await page.goto("/en/contact");
    await page.getByLabel("Name").fill("Ana Buyer");
    await page.getByLabel("Company").fill("Example Beverages");
    await page.getByLabel("Business email").fill("ana@example.com");
    await page.getByLabel("Area of interest").selectOption("raw-materials");
    await page.getByLabel("Tell us about your project").fill("We need lemon concentrate for a new soft drink.");
    await page.getByRole("button", { name: "Send inquiry" }).click();
    await expect(page.getByRole("status")).toContainText("info@gfb-solutions.com");
    // Values are kept because nothing was delivered.
    await expect(page.getByLabel("Name")).toHaveValue("Ana Buyer");
  });
});

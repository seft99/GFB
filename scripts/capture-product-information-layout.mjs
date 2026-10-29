import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const value = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
};

const baseURL = value("--base-url", "http://127.0.0.1:3000").replace(/\/$/, "");
const phase = value("--phase", "after");
const label = value("--label", "local");
const output = resolve(value("--output", "docs/product-information-layout-evidence"));
const widths = [1280, 1366, 1440, 1600, 1920];
const routes = [
  "/aluminum-cans/std-can-d66mm",
  "/ripcap/crown-cork-bottle-caps",
  "/ripcap/26-mm-ripcap",
  "/ripcap/26-mm-ring-crown-cap",
  "/ripcap/42-mm-ripcap",
  "/iqf-lemon-slices/iqf-lemon-slices",
  "/iqf-lemon-slices/iqf-lemon-one-fourths-cut",
  "/iqf-lemon-slices/iqf-lemon-one-eights-cut",
  "/iqf-orange-frozen/iqf-orange-slices--6-%2F-9-mm"
];

const slug = (route) =>
  route
    .replace(/^\//, "")
    .replaceAll("/", "__")
    .replaceAll("%", "_")
    .replace(/[^a-z0-9_-]+/gi, "-");

const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const browser = await chromium.launch({ headless: true, executablePath: edge });
const metrics = [];

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 1050 }, deviceScaleFactor: 1 });
  for (const route of routes) {
    await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    const section = page.locator(".pdc");
    await section.waitFor({ state: "visible" });
    await page.evaluate(() => document.fonts.ready);
    await section.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -16));

    const directory = resolve(output, phase, label, String(width));
    mkdirSync(directory, { recursive: true });
    await page.screenshot({
      path: resolve(directory, `${slug(route)}.jpg`),
      type: "jpeg",
      quality: 76
    });
    if (width === 1440) {
      const cropDirectory = resolve(output, phase, label, "sections");
      mkdirSync(cropDirectory, { recursive: true });
      await section.screenshot({
        path: resolve(cropDirectory, `${slug(route)}.jpg`),
        type: "jpeg",
        quality: 78
      });
    }

    metrics.push(
      await section.evaluate(
        (root, context) => {
          const rect = (element) => {
            const box = element.getBoundingClientRect();
            return {
              x: Math.round(box.x * 10) / 10,
              y: Math.round(box.y * 10) / 10,
              width: Math.round(box.width * 10) / 10,
              height: Math.round(box.height * 10) / 10
            };
          };
          const style = (element) => getComputedStyle(element);
          const elements = (selector) => [...root.querySelectorAll(selector)];
          const rows = elements(".pdc-facts__grid, .pdc-panels, .pdc-editorial").map((element) => ({
            selector: element.className,
            box: rect(element),
            columnGap: style(element).columnGap,
            rowGap: style(element).rowGap,
            children: [...element.children].map(rect)
          }));
          const tables = elements(".pdc-table").map((table) => ({
            className: table.className,
            box: rect(table),
            headers: [...table.querySelectorAll("thead th")].map((cell) => ({
              text: cell.textContent?.trim(),
              box: rect(cell),
              paddingInline: style(cell).paddingInline,
              paddingBlock: style(cell).paddingBlock,
              whiteSpace: style(cell).whiteSpace
            })),
            bodyRows: [...table.querySelectorAll("tbody tr")].map(rect)
          }));
          return {
            ...context,
            variant: root.getAttribute("data-variant"),
            section: rect(root),
            body: rect(root.querySelector(".pdc__body")),
            pageOverflow: document.documentElement.scrollWidth - innerWidth,
            rows,
            surfaces: elements(".pdc-surface").map(rect),
            facts: elements(".pdc-fact").map(rect),
            tableWraps: elements(".pdc-table-wrap").map((element) => ({
              box: rect(element),
              overflow: element.scrollWidth - element.clientWidth
            })),
            tables
          };
        },
        { route, width, locale: "en", url: page.url() }
      )
    );
  }
  await page.close();
}

await browser.close();
const metricsPath = resolve(output, phase, label, "metrics.json");
mkdirSync(resolve(output, phase, label), { recursive: true });
writeFileSync(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`);
console.log(`Captured ${metrics.length} route/viewport combinations in ${resolve(output, phase, label)}`);

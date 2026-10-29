import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { chromium } from "@playwright/test";

const value = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
};

const baseURL = value("--base-url", "http://127.0.0.1:3100").replace(/\/$/, "");
const output = resolve(value("--output", "docs/product-information-layout-evidence/after/global-geometry.json"));
const inventory = JSON.parse(readFileSync("docs/migration-data/product-detail-content.json", "utf8"));
const routes = inventory.filter((row) => row.locale === "en").map((row) => row.route);
const widths = [390, 1024, 1440];
const locales = ["en", "es"];
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const browser = await chromium.launch({ headless: true, executablePath: edge });
const results = [];

const queue = [];
for (const width of widths)
  for (const locale of locales) for (const route of routes) queue.push({ width, locale, route });

const inspect = async (worker) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  for (let index = worker; index < queue.length; index += 6) {
    const item = queue[index];
    await page.setViewportSize({ width: item.width, height: 900 });
    const join = item.route.includes("?") ? "&" : "?";
    const url = `${baseURL}${item.route}${item.locale === "es" ? `${join}lang=es` : ""}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    const section = page.locator(".pdc");
    await section.waitFor({ state: "visible" });
    results.push(
      await section.evaluate((root, context) => {
        const round = (number) => Math.round(number * 10) / 10;
        const box = (element) => {
          const rect = element.getBoundingClientRect();
          return { x: round(rect.x), y: round(rect.y), width: round(rect.width), height: round(rect.height) };
        };
        const elements = (selector) => [...root.querySelectorAll(selector)];
        const byVisualRow = (selector) => {
          const rows = new Map();
          for (const element of elements(selector)) {
            const rect = element.getBoundingClientRect();
            const key = String(Math.round(rect.top / 2) * 2);
            const row = rows.get(key) ?? [];
            row.push({ ...box(element), bottom: round(rect.bottom) });
            rows.set(key, row);
          }
          return [...rows.values()];
        };
        const unexpectedOverflow = elements("*")
          .filter(
            (element) =>
              !element.closest(".pdc-table-wrap") &&
              getComputedStyle(element).overflowX !== "auto" &&
              element.scrollWidth - element.clientWidth > 2
          )
          .map((element) => ({
            element: element.tagName.toLowerCase(),
            className: element.className,
            overflow: element.scrollWidth - element.clientWidth
          }));
        const factRows = byVisualRow(".pdc-fact");
        const factRowHeightDelta = factRows.map((row) =>
          round(Math.max(...row.map((entry) => entry.height)) - Math.min(...row.map((entry) => entry.height)))
        );
        const panelRows = byVisualRow(".pdc-panel-row > .pdc-spec, .pdc-panels > .pdc-spec");
        const panelRowTopDelta = panelRows.map((row) =>
          round(Math.max(...row.map((entry) => entry.y)) - Math.min(...row.map((entry) => entry.y)))
        );
        return {
          ...context,
          variant: root.getAttribute("data-variant"),
          pageOverflow: document.documentElement.scrollWidth - innerWidth,
          unexpectedOverflow,
          emptySurfaces: elements(".pdc-surface").filter((element) => !element.textContent?.trim()).length,
          factRows,
          factRowHeightDelta,
          panelRows,
          panelRowTopDelta,
          tableWraps: elements(".pdc-table-wrap").map((element) => ({
            ...box(element),
            internalOverflow: element.scrollWidth - element.clientWidth,
            keyboardScrollable: element.tabIndex === 0
          })),
          tables: elements("table.pdc-table").map((table) => ({
            className: table.className,
            ...box(table),
            columns: table.querySelectorAll("thead th").length,
            rows: table.querySelectorAll("tbody tr").length,
            headerPadding: [
              ...new Set(
                [...table.querySelectorAll("thead th")].map((cell) => {
                  const style = getComputedStyle(cell);
                  return `${style.paddingBlock} ${style.paddingInline}`;
                })
              )
            ]
          }))
        };
      }, item)
    );
    if ((index + 1) % 60 === 0) console.log(`Worker ${worker}: ${index + 1}/${queue.length}`);
  }
  await page.close();
};

await Promise.all(Array.from({ length: 6 }, (_, worker) => inspect(worker)));
await browser.close();
results.sort((a, b) => a.width - b.width || a.locale.localeCompare(b.locale) || a.route.localeCompare(b.route));

const failures = results.filter(
  (result) =>
    result.pageOverflow > 1 ||
    result.unexpectedOverflow.length ||
    result.emptySurfaces ||
    result.factRowHeightDelta.some((delta) => delta > 2) ||
    result.panelRowTopDelta.some((delta) => delta > 2) ||
    result.tableWraps.some((table) => !table.keyboardScrollable) ||
    result.tables.some((table) => table.headerPadding.length > 1)
);
const summary = {
  generatedAt: new Date().toISOString(),
  baseURL,
  routes: routes.length,
  locales,
  widths,
  combinations: results.length,
  variants: Object.fromEntries(
    [...new Set(results.map((result) => result.variant))].map((variant) => [
      variant,
      routes.filter((route) => results.find((result) => result.route === route)?.variant === variant).length
    ])
  ),
  failures: failures.length,
  failedCases: failures.map(({ route, locale, width }) => ({ route, locale, width }))
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify({ summary, results }, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exitCode = 1;

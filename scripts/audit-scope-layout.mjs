import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { divisions } from "../src/content/catalog.ts";

const baseUrl =
  process.argv.find((argument) => argument.startsWith("--base-url="))?.slice(11) ?? "http://127.0.0.1:3000";
const phase = process.argv.find((argument) => argument.startsWith("--phase="))?.slice(8) ?? "before";
const output = path.resolve("docs/scope-layout-evidence/" + phase);
const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const widths = (
  process.argv.find((argument) => argument.startsWith("--widths="))?.slice(9) ?? "1280,1366,1440,1600,1920"
)
  .split(",")
  .map(Number);

const routes = divisions.flatMap((division) =>
  division.categories.flatMap((category) =>
    ["en", "es"].map((locale) => ({
      id: division.id + "/" + category.id + "/" + locale,
      url: "/" + locale + "/" + division.slug[locale] + "/" + category.slug[locale]
    }))
  )
);

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: edge });
const metrics = [];

for (const width of widths) {
  const directory = path.join(output, String(width));
  await mkdir(directory, { recursive: true });
  const context = await browser.newContext({ viewport: { width, height: 1400 } });
  for (const route of routes) {
    const page = await context.newPage();
    await page.goto(baseUrl + route.url, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    const scope = page.locator(".detail-scope");
    const geometry = await scope.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const groups = [...element.querySelectorAll(".detail-scope__groups > div")].map((group) => {
        const box = group.getBoundingClientRect();
        const items = [...group.querySelectorAll("li")].map((item) => {
          const itemBox = item.getBoundingClientRect();
          const iconBox = item.querySelector("svg")?.getBoundingClientRect();
          return {
            x: itemBox.x,
            y: itemBox.y,
            width: itemBox.width,
            height: itemBox.height,
            iconTopOffset: iconBox ? Number((iconBox.y - itemBox.y).toFixed(2)) : null
          };
        });
        return { x: box.x, y: box.y, width: box.width, height: box.height, items };
      });
      return {
        width: rect.width,
        height: rect.height,
        overflow: document.documentElement.scrollWidth - innerWidth,
        groups
      };
    });
    await scope.screenshot({ path: path.join(directory, route.id.replaceAll("/", "__") + ".png") });
    metrics.push({ width, ...route, ...geometry });
    await page.close();
  }
  await context.close();
}

await browser.close();
await writeFile(path.join(output, "geometry.json"), JSON.stringify(metrics, null, 2) + "\n");

const overflows = metrics.filter((entry) => entry.overflow !== 0);
console.log(
  JSON.stringify(
    {
      phase,
      screenshots: metrics.length,
      routes: routes.length,
      overflows: overflows.length
    },
    null,
    2
  )
);
if (overflows.length) process.exitCode = 1;

const base = process.env.PREVIEW_ORIGIN || "http://127.0.0.1:3000";
const sitemap = await fetch(`${base}/sitemap.xml`);
if (!sitemap.ok) throw new Error(`Sitemap returned ${sitemap.status}`);
const xml = await sitemap.text();
const paths = [...xml.matchAll(/<loc>[^<]+(\/en(?:\/[^<]*)?|\/es(?:\/[^<]*)?)<\/loc>/g)].map((match) => match[1]);
const uniquePaths = [...new Set(paths)];
const responses = [];
for (const path of uniquePaths) {
  const response = await fetch(`${base}${path}`);
  responses.push({ path, status: response.status, html: await response.text() });
}

const failures = responses.filter((item) => item.status !== 200);
const internalLinks = new Set();
for (const response of responses) {
  for (const match of response.html.matchAll(/href="(\/(?:en|es)\/[^"#?]*)/g)) internalLinks.add(match[1].replace(/\/$/, ""));
}
const linkChecks = [];
for (const path of internalLinks) linkChecks.push({ path, status: (await fetch(`${base}${path}`)).status });
failures.push(...linkChecks.filter((item) => item.status >= 400).map((item) => ({ ...item, html: "" })));

console.log(JSON.stringify({ sitemapRoutes: uniquePaths.length, internalLinks: internalLinks.size, failures }, null, 2));
if (failures.length) process.exitCode = 1;

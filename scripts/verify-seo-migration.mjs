/**
 * SEO migration acceptance crawler — runs the full manifest, not a sample.
 *
 * Usage:
 *   MIGRATION_TEST_ORIGIN=http://localhost:3000 node scripts/verify-seo-migration.mjs
 *   MIGRATION_TEST_HOST=www.gfb-solutions.com  (optional; sent as x-forwarded-host because fetch
 *   cannot override Host — simulates the production host for the indexability checks)
 *
 * Canonicals and alternates are always validated against https://www.gfb-solutions.com.
 * Writes docs/migration-data/verification-results.json and exits non-zero on any failure.
 */
import { readFile, writeFile } from "node:fs/promises";

const testOrigin = (process.env.MIGRATION_TEST_ORIGIN || "http://localhost:3000").replace(/\/$/, "");
const hostHeader = process.env.MIGRATION_TEST_HOST || "";
const production = "https://www.gfb-solutions.com";
const expectIndexable = hostHeader === "www.gfb-solutions.com";
const manifest = JSON.parse(await readFile(new URL("../docs/migration-data/migration-manifest.json", import.meta.url)));
const content = JSON.parse(await readFile(new URL("../src/migration/legacy-content.json", import.meta.url)));

const failures = [];
const checks = { total: 0 };
const fail = (url, issue, detail) => {
  failures.push({ url, issue, ...(detail ? { detail } : {}) });
};
const count = (name) => (checks[name] = (checks[name] || 0) + 1);

const decode = (value = "") =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
const normalize = (url) => {
  if (!url) return url;
  const parsed = new URL(url);
  return `${parsed.origin}${parsed.pathname === "/" ? "/" : parsed.pathname}${parsed.search}`;
};
const toTest = (url) => {
  const parsed = new URL(url, production);
  return `${testOrigin}${parsed.pathname}${parsed.search}`;
};

const pages = new Map();
async function get(pathAndQuery, { userAgent = "GFBMigrationVerifier/2.0", cache = true } = {}) {
  const key = `${userAgent}|${pathAndQuery}`;
  if (cache && pages.has(key)) return pages.get(key);
  checks.total++;
  const response = await fetch(`${testOrigin}${pathAndQuery}`, {
    redirect: "manual",
    headers: { "user-agent": userAgent, ...(hostHeader ? { "x-forwarded-host": hostHeader } : {}) }
  });
  const html = response.status === 200 ? await response.text() : (await response.arrayBuffer(), "");
  const result = {
    status: response.status,
    location: response.headers.get("location"),
    headers: response.headers,
    html
  };
  if (cache) pages.set(key, result);
  return result;
}

function parse(html) {
  const head = (re) => decode(html.match(re)?.[1] ?? "");
  return {
    canonicals: [...html.matchAll(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/g)].map((m) => decode(m[1])),
    alternates: Object.fromEntries(
      [...html.matchAll(/<link[^>]+rel="alternate"[^>]+hrefLang="([^"]+)"[^>]+href="([^"]+)"/gi)].map((m) => [
        m[1],
        decode(m[2])
      ])
    ),
    lang: head(/<html[^>]+lang="([^"]+)"/),
    title: head(/<title>([^<]*)<\/title>/),
    description: head(/<meta name="description" content="([^"]*)"/),
    robots: head(/<meta name="robots" content="([^"]*)"/),
    h1: [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => decode(m[1].replace(/<[^>]+>/g, "")).trim()),
    links: [...html.matchAll(/<a[^>]+href="([^"#]+)"/g)].map((m) => decode(m[1])),
    images: [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => decode(m[1])),
    jsonld: [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]),
    text: decode(html.replace(/<(script|style)[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ")
  };
}

function expectIndexHeaders(url, result, parsed) {
  const tag = result.headers.get("x-robots-tag") || "";
  if (expectIndexable && /noindex/i.test(tag + parsed.robots))
    fail(url, "production page is noindex", tag || parsed.robots);
  if (!expectIndexable && !/noindex/i.test(tag)) fail(url, "non-production response lacks X-Robots-Tag noindex");
}

/** Retained canonical page: 200 in place, its own canonical, language, one H1, hreflang cluster. */
async function verifyRetained(row) {
  const source = new URL(row.sourceUrl);
  const target = `${source.pathname}${source.search}`;
  const result = await get(target);
  if (result.status !== 200) return fail(row.sourceUrl, `status ${result.status}`, result.location);
  const page = parse(result.html);
  const expected = normalize(row.finalPublicCanonicalUrl);
  count("retained");
  if (page.canonicals.length !== 1) fail(row.sourceUrl, `${page.canonicals.length} canonical tags`);
  if (normalize(page.canonicals[0]) !== expected)
    fail(row.sourceUrl, "canonical", `${page.canonicals[0]} ≠ ${expected}`);
  if (page.lang !== row.locale) fail(row.sourceUrl, `html lang ${page.lang}`);
  if (page.h1.length !== 1) fail(row.sourceUrl, `${page.h1.length} h1 elements`);
  if (row.newH1 && page.h1[0] !== row.newH1) fail(row.sourceUrl, "h1 text", `${page.h1[0]} ≠ ${row.newH1}`);
  if (!page.title || /^[0-9a-f]{8}-/.test(page.description) || page.description.length < 30)
    fail(row.sourceUrl, "title/description", `${page.title} | ${page.description}`);
  if (/GBF/.test(page.title + page.description)) fail(row.sourceUrl, "GBF typo in metadata");
  const partner = normalize(row.alternateLanguagePartner);
  const self = expected;
  const cluster = { "en-US": row.locale === "en" ? self : partner, "es-ES": row.locale === "es" ? self : partner };
  for (const [lang, href] of Object.entries(cluster))
    if (normalize(page.alternates[lang]) !== href) fail(row.sourceUrl, `hreflang ${lang}`, page.alternates[lang]);
  if (normalize(page.alternates["x-default"]) !== cluster["en-US"]) fail(row.sourceUrl, "hreflang x-default");
  for (const href of [...page.canonicals, ...Object.values(page.alternates)])
    if (!href.startsWith(`${production}/`) && href !== production)
      fail(row.sourceUrl, "non-production metadata URL", href);
  for (const block of page.jsonld) {
    try {
      JSON.parse(block);
    } catch {
      fail(row.sourceUrl, "invalid JSON-LD");
    }
  }
  expectIndexHeaders(row.sourceUrl, result, page);
  if (!result.html.includes('name="google-site-verification" content="7PiVqg96_UzmbwwrXLGTOT9K7aiSCudnN4SN4TUAVLM"'))
    fail(row.sourceUrl, "search engine verification tag missing");
  // Content identity: the page shows its own facts, not a generic template.
  const legacy = content[source.pathname]?.[row.locale];
  if (legacy) {
    const facts = legacy.sections
      .flatMap((section) => section.items)
      .flatMap((item) =>
        item.type === "specs"
          ? item.rows.flat()
          : item.type === "ul"
            ? item.items
            : item.type === "links"
              ? []
              : [item.text]
      )
      .filter((text) => text.length > 3)
      .slice(0, 6);
    // "92 mm for 250 ml" (can heights) is shown as a Volume | Height table row: "250 ml 92 mm".
    const shown = (fact) => {
      const text = fact.replace(/\s+/g, " ");
      const pair = text.match(/^(\S+ mm) (?:for|para) (\S+ ml)$/);
      return pair ? page.text.includes(`${pair[2]} ${pair[1]}`) : page.text.includes(text);
    };
    const missing = facts.filter((fact) => !shown(fact));
    if (missing.length) fail(row.sourceUrl, "published facts missing", missing.slice(0, 2));
    count("contentIdentity");
  }
  return page;
}

async function verifyRedirect(row) {
  const source = new URL(row.sourceUrl);
  const result = await get(`${source.pathname}${source.search}`);
  const expected = toTest(row.finalPublicCanonicalUrl);
  if (![301, 308].includes(result.status)) return fail(row.sourceUrl, `expected 301/308, got ${result.status}`);
  if (normalize(new URL(result.location, testOrigin).href) !== normalize(expected))
    fail(row.sourceUrl, "redirect target", `${result.location} ≠ ${expected}`);
  const final = await get(new URL(result.location, testOrigin).pathname + new URL(result.location, testOrigin).search);
  if (final.status !== 200) fail(row.sourceUrl, `redirect target status ${final.status}`);
  count("redirects");
}

async function verifyBroken(row) {
  const source = new URL(row.sourceUrl);
  const first = await get(`${source.pathname}${source.search}`);
  const next = first.location ? await get(new URL(first.location, testOrigin).pathname) : first;
  if (next.status !== 404) fail(row.sourceUrl, `broken historical link should end in 404, got ${next.status}`);
  count("brokenHistorical");
}

// ---------- 1. every manifest row ----------
const rendered = new Map();
const queue = [...manifest];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const row = queue.shift();
      if (row.pageKind === "broken-historical-link") await verifyBroken(row);
      else if (String(row.action).startsWith("redirect")) await verifyRedirect(row);
      else rendered.set(normalize(row.finalPublicCanonicalUrl), await verifyRetained(row));
    }
  })
);

// ---------- 2. aliases, edge cases, unknown URLs ----------
const edge = [
  ["/en/packaging-solutions/cans", 308, "/cans"],
  ["/es/soluciones-de-embalaje/latas", 308, "/cans?lang=es"],
  ["/en", 308, "/"],
  ["/es", 308, "/?lang=es"],
  ["/en/about", 308, "/about-us"],
  ["/es/sobre-gfb", 308, "/about-us?lang=es"],
  ["/en/raw-materials/fruit-concentrates?utm_source=test", 308, "/fruits-concentrates?utm_source=test"],
  ["/cans/", 308, "/cans"],
  ["/aluminium-can-ends/52mm-%28202%29-dia-aluminium-end", 301, "/aluminium-can-ends/52mm-(202)-dia-aluminium-end"],
  ["/frozen-lime?utm_medium=email&lang=es", 301, "/iqf-lime?lang=es&utm_medium=email"],
  ["/Cans", 404],
  ["/CITRICS/orange-concentrate", 404],
  ["/citrics/orange-concentrate-x", 404],
  ["/iqf-lime-slices/iqf-lime-1/4-cut", 404],
  ["/en/legacy/abc", 404],
  ["/en/does-not-exist", 404],
  ["/does-not-exist", 404],
  ["/es_es-dynamic-ripcap_p_1e775e44_d5df_4e8e_9d5c_6ebc173ad71b_0_5000-sitemap.xml", 301, "/es_es-sitemap.xml"]
];
for (const [path, status, location] of edge) {
  const result = await get(path, { cache: false });
  count("edgeCases");
  if (result.status !== status) fail(path, `expected ${status}, got ${result.status}`, result.location);
  else if (location) {
    const target = new URL(result.location, testOrigin);
    const actual = `${target.pathname}${target.search}`;
    const want = new URL(location, testOrigin);
    const sameQuery = [...want.searchParams].every(([k, v]) => target.searchParams.get(k) === v);
    if (target.pathname !== want.pathname || !sameQuery || target.origin !== new URL(testOrigin).origin)
      fail(path, "redirect target", `${actual} ≠ ${location}`);
  }
}
// Query order and tracking parameters never change the language or the canonical.
for (const [path, lang] of [
  ["/cans?utm_source=a&lang=es", "es"],
  ["/cans?lang=es&utm_source=a", "es"],
  ["/cans?lang=en", "en"],
  ["/?utm_campaign=x", "en"]
]) {
  const page = parse((await get(path, { cache: false })).html);
  count("queryVariants");
  if (page.lang !== lang) fail(path, `language ${page.lang}`);
  if (/utm_|lang=en/.test(page.canonicals[0] || "")) fail(path, "tracking parameter in canonical", page.canonicals[0]);
}
// Alternating language order (cache keys must separate languages).
for (const path of ["/cans", "/citrics/orange-concentrate", "/", "/iqf-lime-slices/iqf-lime-1%2F4-cut"]) {
  for (const lang of ["en", "es", "en", "es", "es", "en"]) {
    const url = lang === "es" ? `${path}${path.includes("?") ? "&" : "?"}lang=es` : path;
    const page = parse((await get(url, { cache: false })).html);
    count("alternatingLanguage");
    if (page.lang !== lang) fail(url, `alternating request served ${page.lang}`);
  }
}
// Crawler user agent receives the same metadata.
for (const path of ["/cans?lang=es", "/malbec"]) {
  const page = parse((await get(path, { userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1)", cache: false })).html);
  count("crawlerUserAgent");
  if (page.canonicals.length !== 1 || page.h1.length !== 1) fail(path, "crawler response metadata");
}

// ---------- 3. sitemaps ----------
const sitemap = await get("/sitemap.xml");
const locs = [...sitemap.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => normalize(decode(m[1])));
const expectedCanonicals = new Set(
  manifest
    .filter((row) => row.provenance === "official sitemap" && !String(row.action).startsWith("redirect"))
    .map((row) => normalize(row.finalPublicCanonicalUrl))
);
for (const url of expectedCanonicals) if (!locs.includes(url)) fail(url, "retained canonical missing from sitemap");
if (new Set(locs).size !== locs.length) fail("/sitemap.xml", "duplicate sitemap entries");
for (const loc of locs) {
  count("sitemapUrls");
  if (!rendered.has(loc)) {
    const result = await get(new URL(loc).pathname + new URL(loc).search);
    if (result.status !== 200) fail(loc, `sitemap URL status ${result.status}`);
    else {
      const page = parse(result.html);
      if (normalize(page.canonicals[0]) !== loc) fail(loc, "sitemap URL is not self-canonical", page.canonicals[0]);
      rendered.set(loc, page);
    }
  }
}
const esSitemap = await get("/es_es-sitemap.xml");
const esLocs = [...esSitemap.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]));
if (esLocs.length !== locs.length / 2 || esLocs.some((loc) => !/lang=es|\/es\//.test(loc)))
  fail("/es_es-sitemap.xml", "Spanish sitemap content", esLocs.length);

// ---------- 4. internal links, images, orphans ----------
const inbound = new Map();
const internal = new Set();
const images = new Set();
for (const [url, page] of rendered) {
  if (!page) continue;
  for (const href of page.links) {
    if (href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    const target = new URL(href, `${production}/`);
    if (target.origin !== production && !href.startsWith("/")) continue;
    const key = `${target.pathname}${target.search}`;
    internal.add(key);
    const canonicalKey = normalize(`${production}${key}`);
    if (!inbound.has(canonicalKey)) inbound.set(canonicalKey, new Set());
    if (canonicalKey !== url) inbound.get(canonicalKey).add(url);
  }
  for (const src of page.images) if (src.startsWith("/")) images.add(src);
}
for (const href of internal) {
  const result = await get(href);
  count("internalLinks");
  if (href.startsWith("/en/") || href.startsWith("/es/")) {
    if (result.status !== 200) fail(href, `internal link status ${result.status}`, result.location);
  } else if (result.status !== 200) fail(href, `internal link not final (${result.status})`, result.location);
}
for (const src of images) {
  const response = await fetch(`${testOrigin}${src}`, { method: "GET" });
  await response.arrayBuffer();
  count("images");
  if (response.status !== 200) fail(src, `image status ${response.status}`);
}
for (const url of expectedCanonicals) if (!(inbound.get(url)?.size > 0)) fail(url, "no internal inbound link (orphan)");

const failedUrls = new Set(failures.map((item) => item.url));
const summary = {
  origin: testOrigin,
  host: hostHeader || "(request host)",
  expectIndexable,
  manifestRows: manifest.length,
  checks,
  sitemapUrls: locs.length,
  failures: failures.length,
  failedUrls: failedUrls.size
};
await writeFile(
  new URL("../docs/migration-data/verification-results.json", import.meta.url),
  `${JSON.stringify({ summary, failures }, null, 1)}\n`
);
console.log(JSON.stringify({ summary, failures: failures.slice(0, 40) }, null, 2));
if (failures.length) process.exitCode = 1;

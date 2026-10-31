/**
 * SEO migration acceptance crawler — runs the full manifest, not a sample.
 *
 * Usage:
 *   MIGRATION_TEST_ORIGIN=http://localhost:3000 node scripts/verify-seo-migration.mjs
 *   MIGRATION_TEST_HOST=www.gfb-solutions.com  (optional; sent as x-forwarded-host because fetch
 *   cannot override Host — simulates the production host only on a local origin)
 *   MIGRATION_TEST_ORIGIN=https://www.gfb-solutions.com node scripts/verify-seo-migration.mjs
 *   (the actual production hostname is recognized as indexable without a header override)
 *
 * Canonicals and alternates are always validated against https://www.gfb-solutions.com.
 * Writes raw JSON evidence plus docs/seo/legacy-parity.csv and exits non-zero on any failure.
 */
import { readFile, writeFile } from "node:fs/promises";

const testOrigin = (process.env.MIGRATION_TEST_ORIGIN || "http://localhost:3000").replace(/\/$/, "");
const hostHeader = process.env.MIGRATION_TEST_HOST || "";
const configuredConcurrency = Number(process.env.MIGRATION_VERIFY_CONCURRENCY || 12);
const verificationConcurrency =
  Number.isSafeInteger(configuredConcurrency) && configuredConcurrency > 0 ? configuredConcurrency : 12;
const production = "https://www.gfb-solutions.com";
const productionHost = new URL(production).hostname;
const testOriginHost = new URL(testOrigin).hostname.toLowerCase();
const localTestOrigin = testOriginHost === "localhost" || testOriginHost === "127.0.0.1";
// A forwarded-host override is meaningful only when exercising a local server. Vercel removes
// it from inbound preview requests, so a remote preview must be judged by its actual hostname.
const expectIndexable = testOriginHost === productionHost || (localTestOrigin && hostHeader === productionHost);
const manifest = JSON.parse(await readFile(new URL("../docs/migration-data/migration-manifest.json", import.meta.url)));
const content = JSON.parse(await readFile(new URL("../src/migration/legacy-content.json", import.meta.url)));
const legacyCrawl = JSON.parse(
  await readFile(new URL("../docs/migration-data/legacy-crawl.json", import.meta.url))
);
const legacyByUrl = new Map(legacyCrawl.map((row) => [row.sourceUrl, row]));

const failures = [];
const requests = { total: 0, byCategory: {} };
const assertions = { total: 0, passed: 0, failed: 0, skipped: 0, byCategory: {} };
const coverage = {};
const evidence = [];
const fail = (url, issue, detail) => {
  failures.push({ url, issue, ...(detail ? { detail } : {}) });
};
const count = (name) => {
  coverage[name] = (coverage[name] || 0) + 1;
};
const assert = (category, condition, url, issue, detail) => {
  assertions.total++;
  assertions.byCategory[category] ??= { executed: 0, passed: 0, failed: 0, skipped: 0 };
  assertions.byCategory[category].executed++;
  if (condition) {
    assertions.passed++;
    assertions.byCategory[category].passed++;
    return true;
  }
  assertions.failed++;
  assertions.byCategory[category].failed++;
  fail(url, issue, detail);
  return false;
};
const skip = (category) => {
  assertions.skipped++;
  assertions.byCategory[category] ??= { executed: 0, passed: 0, failed: 0, skipped: 0 };
  assertions.byCategory[category].skipped++;
};

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
  requests.total++;
  requests.byCategory[userAgent.includes("Googlebot") ? "crawler" : "page"] =
    (requests.byCategory[userAgent.includes("Googlebot") ? "crawler" : "page"] || 0) + 1;
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

async function mapConcurrent(items, worker) {
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(verificationConcurrency, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        await worker(items[index]);
      }
    })
  );
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
    images: [...html.matchAll(/<img\b([^>]*)>/gi)].map((match) => {
      const attrs = match[1];
      const attr = (name) => decode(attrs.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1] ?? "");
      return { src: attr("src"), alt: attr("alt"), hasAlt: /\balt=/i.test(attrs), ariaHidden: attr("aria-hidden") };
    }),
    jsonld: [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]),
    text: decode(html.replace(/<(script|style)[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " "),
    contentText: decode(
      (html.match(/<section[^>]+class="[^"]*\bpdc\b[^"]*"[\s\S]*?(?=<nav[^>]+class="[^"]*\bfamily-related\b|<section[^>]+class="[^"]*\bcta\b|<footer)/i)?.[0] ?? "")
        .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
        .replace(/<[^>]+>/g, " ")
    ).replace(/\s+/g, " ")
  };
}

function expectIndexHeaders(url, result, parsed) {
  const tag = result.headers.get("x-robots-tag") || "";
  if (expectIndexable)
    assert("indexing", !/noindex/i.test(tag + parsed.robots), url, "production page is noindex", tag || parsed.robots);
  else assert("indexing", /noindex/i.test(tag), url, "non-production response lacks X-Robots-Tag noindex");
}

const normalizedText = (value = "") => String(value ?? "").replace(/\s+/g, " ").trim();
const normalizedTitle = (value = "") => normalizedText(value).replace(/\s*\|\s*GFB Solutions$/i, "");
const normalizedComparisonText = (value = "") =>
  normalizedText(value).normalize("NFKC").toLocaleLowerCase("en").replace(/[\p{P}\p{S}]+/gu, " ").replace(/\s+/g, " ").trim();
const compareMetadata = (legacy, candidate, { title = false } = {}) => {
  const left = title ? normalizedTitle(legacy) : normalizedText(legacy);
  const right = title ? normalizedTitle(candidate) : normalizedText(candidate);
  if (left === right) return "equal";
  return normalizedComparisonText(left) === normalizedComparisonText(right) ? "normalized-equal" : "changed";
};
const semanticMembers = (value) =>
  normalizedText(value)
    .split(/,\s*|\s+(?:and|y)\s+/i)
    .map((member) => member.replace(/[.!;:]$/, "").trim())
    .filter((member) => member.length > 3);
const semanticShown = (value, scopedText) => {
  const text = normalizedText(value);
  const pair = text.match(/^(\S+ mm) (?:for|para) (\S+ ml)$/);
  if (pair) return scopedText.includes(`${pair[2]} ${pair[1]}`);
  if (scopedText.includes(text)) return true;
  const members = semanticMembers(text);
  return members.length > 1 && members.every((member) => scopedText.includes(member));
};
const semanticTokens = (value) => {
  const stop = new Set([
    "from", "with", "without", "that", "this", "these", "those", "their", "there", "which", "available",
    "product", "products", "information", "specifications", "solutions", "para", "como", "esta", "este", "estos",
    "estas", "desde", "sobre", "producto", "productos", "informacion", "especificaciones", "disponible"
  ]);
  return [...new Set(normalizedText(value).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").split(" "))].filter(
    (token) => token.length > 3 && !stop.has(token)
  );
};
const semanticallyConsistent = (value, visibleText) => {
  const expected = semanticTokens(value);
  const visible = new Set(semanticTokens(visibleText));
  if (!expected.length) return false;
  return expected.filter((token) => visible.has(token)).length / expected.length >= 0.5;
};
const expectedContentBlocks = (legacy) =>
  legacy.sections.flatMap((section, sectionIndex) =>
    section.items.flatMap((item, itemIndex) => {
      if (item.type === "links") return [];
      const values = item.type === "specs" ? item.rows.flat() : item.type === "ul" ? item.items : [item.text];
      return values
        .filter((value) => normalizedText(value).length > 3)
        .map((value) => ({ section: sectionIndex, item: itemIndex, type: item.type, value }));
    })
  );

function validateStructuredData(url, page) {
  const nodes = [];
  for (const block of page.jsonld) {
    try {
      const parsed = JSON.parse(block);
      nodes.push(...(Array.isArray(parsed?.["@graph"]) ? parsed["@graph"] : [parsed]));
    } catch {
      assert("structuredData", false, url, "invalid JSON-LD");
    }
  }
  for (const node of nodes) {
    const type = node?.["@type"];
    if (type === "BreadcrumbList") {
      assert(
        "structuredData",
        Array.isArray(node.itemListElement) && node.itemListElement.length > 0,
        url,
        "BreadcrumbList missing itemListElement"
      );
      for (const [index, item] of (node.itemListElement ?? []).entries()) {
        assert(
          "structuredData",
          Boolean(item?.name && item?.position === index + 1),
          url,
          "BreadcrumbList item missing name or sequential position",
          item
        );
        assert(
          "structuredData",
          normalizedText(page.text).includes(normalizedText(item?.name)),
          url,
          "BreadcrumbList name is not represented in visible content",
          item?.name
        );
      }
    } else if (type === "Product") {
      assert("structuredData", Boolean(node.name && node.description && node.url), url, "Product required properties missing");
      assert("structuredData", page.h1.includes(node.name), url, "Product name differs from visible H1", node.name);
      assert(
        "structuredData",
        normalizedText(node.url) === normalizedText(page.canonicals[0]),
        url,
        "Product URL differs from canonical",
        `${node.url} ≠ ${page.canonicals[0]}`
      );
      assert(
        "structuredData",
        normalizedText(node.description) === normalizedText(page.description),
        url,
        "Product description differs from meta description",
        `${node.description} ≠ ${page.description}`
      );
      assert(
        "structuredData",
        semanticallyConsistent(node.description, page.text),
        url,
        "Product description is not semantically consistent with visible Product Information content",
        node.description
      );
    } else if (type === "Organization" || type === "WebSite" || type === "CollectionPage")
      assert("structuredData", Boolean(node.name && node.url), url, `${type} required properties missing`);
    else if (type) skip("structuredDataUnsupportedType");
  }
  assert("structuredData", nodes.length > 0, url, "structured data missing");
  return nodes.map((node) => node?.["@type"]).filter(Boolean);
}

function validateImageAlts(url, page) {
  const seen = new Map();
  for (const image of page.images) {
    assert("imageAlt", image.hasAlt, url, "image missing alt attribute", image.src);
    // Explicit alt="" is the HTML accessibility contract for a decorative image. It is tracked
    // independently instead of being confused with an absent alt attribute.
    if (image.hasAlt && image.alt === "") skip("imageAltDecorative");
    if (image.alt && /^(image|photo|picture|imagen|foto)$/i.test(image.alt.trim()))
      assert("imageAlt", false, url, "contextually inappropriate generic image alt", `${image.src}: ${image.alt}`);
    if (image.alt && normalizedText(image.alt).toLowerCase() === image.src.split("/").pop()?.replace(/\.[^.]+$/, "").toLowerCase())
      assert("imageAlt", false, url, "contextually inappropriate filename image alt", `${image.src}: ${image.alt}`);
    if (image.alt) {
      const key = image.alt.trim().toLowerCase();
      const prior = seen.get(key);
      if (prior && prior !== image.src)
        assert("imageAlt", false, url, "duplicate alt used for different images", `${prior} | ${image.src}: ${image.alt}`);
      else seen.set(key, image.src);
    }
  }
}

/** Retained canonical page: 200 in place, its own canonical, language, one H1, hreflang cluster. */
async function verifyRetained(row) {
  const source = new URL(row.sourceUrl);
  const target = `${source.pathname}${source.search}`;
  const result = await get(target);
  if (!assert("responseStatus", result.status === 200, row.sourceUrl, `status ${result.status}`, result.location)) return;
  const page = parse(result.html);
  const legacyHttp = legacyByUrl.get(row.sourceUrl);
  const expected = normalize(row.finalPublicCanonicalUrl);
  count("retained");
  assert("canonical", page.canonicals.length === 1, row.sourceUrl, `${page.canonicals.length} canonical tags`);
  assert("canonical", normalize(page.canonicals[0]) === expected, row.sourceUrl, "canonical", `${page.canonicals[0]} ≠ ${expected}`);
  assert("localization", page.lang === row.locale, row.sourceUrl, `html lang ${page.lang}`);
  assert("h1", page.h1.length === 1, row.sourceUrl, `${page.h1.length} h1 elements`);
  if (row.newH1)
    assert("h1", page.h1[0] === row.newH1, row.sourceUrl, "h1 text", `${page.h1[0]} ≠ ${row.newH1}`);
  assert(
    "metadataQuality",
    Boolean(page.title) && !/^[0-9a-f]{8}-/.test(page.description) && page.description.length >= 30,
    row.sourceUrl,
    "title/description",
    `${page.title} | ${page.description}`
  );
  assert("metadataQuality", !/GBF/.test(page.title + page.description), row.sourceUrl, "GBF typo in metadata");
  const partner = normalize(row.alternateLanguagePartner);
  const self = expected;
  const cluster = { "en-US": row.locale === "en" ? self : partner, "es-ES": row.locale === "es" ? self : partner };
  for (const [lang, href] of Object.entries(cluster))
    assert("hreflang", normalize(page.alternates[lang]) === href, row.sourceUrl, `hreflang ${lang}`, page.alternates[lang]);
  assert(
    "hreflang",
    normalize(page.alternates["x-default"]) === cluster["en-US"],
    row.sourceUrl,
    "hreflang x-default"
  );
  for (const href of [...page.canonicals, ...Object.values(page.alternates)])
    assert(
      "metadataOrigin",
      href.startsWith(`${production}/`) || href === production,
      row.sourceUrl,
      "non-production metadata URL",
      href
    );
  const schemaTypes = validateStructuredData(row.sourceUrl, page);
  validateImageAlts(row.sourceUrl, page);
  expectIndexHeaders(row.sourceUrl, result, page);
  assert(
    "verificationTag",
    result.html.includes('name="google-site-verification" content="7PiVqg96_UzmbwwrXLGTOT9K7aiSCudnN4SN4TUAVLM"'),
    row.sourceUrl,
    "search engine verification tag missing"
  );
  // Full source-derived render contract, scoped to Product Information rather than page-wide text.
  const legacy = content[source.pathname]?.[row.locale];
  let contentParity = {
    scope: "unavailable-for-redesigned-route",
    checkedBlocks: 0,
    missingBlocks: [],
    withheldBlocks: [],
    untranslatedBlocks: row.untranslatedBlocks ?? 0
  };
  if (legacy) {
    const blocks = expectedContentBlocks(legacy);
    const missing = blocks.filter((block) => !semanticShown(block.value, page.contentText));
    for (const block of blocks)
      assert(
        "contentBlocks",
        !missing.includes(block),
        row.sourceUrl,
        "published content block missing from Product Information",
        block
      );
    contentParity = {
      scope: "product-information",
      checkedBlocks: blocks.length,
      missingBlocks: missing,
      withheldBlocks: legacy.excluded,
      untranslatedBlocks: legacy.untranslatedItems ?? row.untranslatedBlocks ?? 0
    };
    count("contentIdentityPages");
  } else skip("contentBlocksUnavailable");
  const xRobotsTag = result.headers.get("x-robots-tag") || "";
  evidence.push({
    sourceUrl: row.sourceUrl,
    locale: row.locale,
    action: row.action,
    status: result.status,
    legacy: {
      status: legacyHttp?.sourceStatus ?? null,
      redirectChain: legacyHttp?.redirectChain ?? [],
      title: legacyHttp?.title ?? "",
      description: legacyHttp?.description ?? "",
      h1: legacyHttp?.h1 ?? "",
      canonical: legacyHttp?.observedCanonical ?? "",
      robots: legacyHttp?.robots ?? null,
      hreflang: legacyHttp?.hreflang ?? null
    },
    candidate: {
      title: page.title,
      description: page.description,
      h1: page.h1[0] ?? "",
      canonical: page.canonicals[0] ?? "",
      robots: page.robots,
      xRobotsTag,
      hreflang: page.alternates,
      schemaTypes,
      sitemapEligible: null
    },
    contentParity,
    comparison: {
      title: compareMetadata(legacyHttp?.title, page.title, { title: true }),
      description: compareMetadata(legacyHttp?.description, page.description),
      h1: compareMetadata(legacyHttp?.h1, page.h1[0]),
      canonical: normalize(legacyHttp?.observedCanonical) === normalize(page.canonicals[0]) ? "equal" : "changed",
      robots: legacyHttp?.robots == null ? "not-captured-in-legacy-crawl" : normalizedText(legacyHttp.robots) === normalizedText(page.robots) ? "equal" : "changed",
      hreflang: legacyHttp?.hreflang == null ? "not-captured-in-legacy-crawl" : JSON.stringify(legacyHttp.hreflang) === JSON.stringify(page.alternates) ? "equal" : "changed",
      targetContract: {
        title: row.newTitle ? normalizedTitle(row.newTitle) === normalizedTitle(page.title) : null,
        description: row.newDescription ? normalizedText(row.newDescription) === normalizedText(page.description) : null,
        h1: row.newH1 ? normalizedText(row.newH1) === normalizedText(page.h1[0]) : null
      }
    }
  });
  if (row.newTitle)
    assert(
      "metadataTargetContract",
      normalizedTitle(row.newTitle) === normalizedTitle(page.title),
      row.sourceUrl,
      "candidate title differs from target contract",
      `${page.title} ≠ ${row.newTitle}`
    );
  if (row.newDescription)
    assert(
      "metadataTargetContract",
      normalizedText(row.newDescription) === normalizedText(page.description),
      row.sourceUrl,
      "candidate description differs from target contract",
      `${page.description} ≠ ${row.newDescription}`
    );
  if (row.newH1)
    assert(
      "metadataTargetContract",
      normalizedText(row.newH1) === normalizedText(page.h1[0]),
      row.sourceUrl,
      "candidate H1 differs from target contract",
      `${page.h1[0]} ≠ ${row.newH1}`
    );
  return page;
}

async function verifyRedirect(row) {
  const source = new URL(row.sourceUrl);
  const legacyHttp = legacyByUrl.get(row.sourceUrl);
  const result = await get(`${source.pathname}${source.search}`);
  const expected = toTest(row.finalPublicCanonicalUrl);
  if (!assert("redirects", [301, 308].includes(result.status), row.sourceUrl, `expected 301/308, got ${result.status}`)) return;
  assert(
    "redirects",
    normalize(new URL(result.location, testOrigin).href) === normalize(expected),
    row.sourceUrl,
    "redirect target",
    `${result.location} ≠ ${expected}`
  );
  const final = await get(new URL(result.location, testOrigin).pathname + new URL(result.location, testOrigin).search);
  assert("redirects", final.status === 200, row.sourceUrl, `redirect target status ${final.status}`);
  count("redirects");
  evidence.push({
    sourceUrl: row.sourceUrl,
    locale: row.locale,
    action: row.action,
    status: result.status,
    redirectDestination: result.location,
    legacy: { status: legacyHttp?.sourceStatus ?? null, redirectChain: legacyHttp?.redirectChain ?? [] },
    candidate: { canonical: row.finalPublicCanonicalUrl },
    comparison: { redirect: normalize(new URL(result.location, testOrigin).href) === normalize(expected) ? "equal" : "changed" }
  });
}

async function verifyBroken(row) {
  const source = new URL(row.sourceUrl);
  const legacyHttp = legacyByUrl.get(row.sourceUrl);
  const first = await get(`${source.pathname}${source.search}`);
  const next = first.location ? await get(new URL(first.location, testOrigin).pathname) : first;
  assert(
    "historical404",
    next.status === 404,
    row.sourceUrl,
    `broken historical link should end in 404, got ${next.status}`
  );
  count("brokenHistorical");
  evidence.push({
    sourceUrl: row.sourceUrl,
    locale: row.locale,
    action: row.action,
    status: next.status,
    redirectDestination: first.location,
    legacy: { status: legacyHttp?.sourceStatus ?? null, redirectChain: legacyHttp?.redirectChain ?? [] },
    candidate: { canonical: "" },
    comparison: { historical404: next.status === 404 ? "equal" : "changed" }
  });
}

// ---------- 1. every manifest row ----------
const rendered = new Map();
const queue = [...manifest];
await Promise.all(
  Array.from({ length: Math.min(verificationConcurrency, queue.length) }, async () => {
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
  const statusOk = assert("edgeCases", result.status === status, path, `expected ${status}, got ${result.status}`, result.location);
  if (statusOk && location) {
    const target = new URL(result.location, testOrigin);
    const actual = `${target.pathname}${target.search}`;
    const want = new URL(location, testOrigin);
    const sameQuery = [...want.searchParams].every(([k, v]) => target.searchParams.get(k) === v);
    assert(
      "edgeCases",
      target.pathname === want.pathname && sameQuery && target.origin === new URL(testOrigin).origin,
      path,
      "redirect target",
      `${actual} ≠ ${location}`
    );
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
  assert("queryVariants", page.lang === lang, path, `language ${page.lang}`);
  assert(
    "queryVariants",
    !/utm_|lang=en/.test(page.canonicals[0] || ""),
    path,
    "tracking parameter in canonical",
    page.canonicals[0]
  );
}
// Alternating language order (cache keys must separate languages).
for (const path of ["/cans", "/citrics/orange-concentrate", "/", "/iqf-lime-slices/iqf-lime-1%2F4-cut"]) {
  for (const lang of ["en", "es", "en", "es", "es", "en"]) {
    const url = lang === "es" ? `${path}${path.includes("?") ? "&" : "?"}lang=es` : path;
    const page = parse((await get(url, { cache: false })).html);
    count("alternatingLanguage");
    assert("localizationCache", page.lang === lang, url, `alternating request served ${page.lang}`);
  }
}
// Crawler user agent receives the same metadata.
for (const path of ["/cans?lang=es", "/malbec"]) {
  const page = parse((await get(path, { userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1)", cache: false })).html);
  count("crawlerUserAgent");
  assert(
    "crawlerParity",
    page.canonicals.length === 1 && page.h1.length === 1,
    path,
    "crawler response metadata"
  );
}

// ---------- 3. sitemaps ----------
const sitemap = await get("/sitemap.xml");
const locs = [...sitemap.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => normalize(decode(m[1])));
const expectedCanonicals = new Set(
  manifest
    .filter((row) => row.provenance === "official sitemap" && !String(row.action).startsWith("redirect"))
    .map((row) => normalize(row.finalPublicCanonicalUrl))
);
for (const url of expectedCanonicals)
  assert("sitemap", locs.includes(url), url, "retained canonical missing from sitemap");
assert("sitemap", new Set(locs).size === locs.length, "/sitemap.xml", "duplicate sitemap entries");
for (const loc of locs) {
  count("sitemapUrls");
  if (!rendered.has(loc)) {
    const result = await get(new URL(loc).pathname + new URL(loc).search);
    if (assert("sitemap", result.status === 200, loc, `sitemap URL status ${result.status}`)) {
      const page = parse(result.html);
      assert("sitemap", normalize(page.canonicals[0]) === loc, loc, "sitemap URL is not self-canonical", page.canonicals[0]);
      rendered.set(loc, page);
    }
  }
}
const esSitemap = await get("/es_es-sitemap.xml");
const esLocs = [...esSitemap.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]));
assert(
  "sitemap",
  esLocs.length === locs.length / 2 && esLocs.every((loc) => /lang=es|\/es\//.test(loc)),
  "/es_es-sitemap.xml",
  "Spanish sitemap content",
  esLocs.length
);
for (const item of evidence)
  if (item.candidate) item.candidate.sitemapEligible = Boolean(item.candidate.canonical && locs.includes(normalize(item.candidate.canonical)));

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
  for (const image of page.images) if (image.src.startsWith("/")) images.add(image.src);
}
await mapConcurrent([...internal], async (href) => {
  const result = await get(href);
  count("internalLinks");
  if (href.startsWith("/en/") || href.startsWith("/es/")) {
    assert("internalLinkStatus", result.status === 200, href, `internal link status ${result.status}`, result.location);
  } else assert("internalLinkStatus", result.status === 200, href, `internal link not final (${result.status})`, result.location);
});
await mapConcurrent([...images], async (src) => {
  const response = await fetch(`${testOrigin}${src}`, { method: "GET" });
  await response.arrayBuffer();
  requests.total++;
  requests.byCategory.image = (requests.byCategory.image || 0) + 1;
  count("images");
  assert("imageAvailability", response.status === 200, src, `image status ${response.status}`);
});
for (const url of expectedCanonicals)
  assert("orphan", inbound.get(url)?.size > 0, url, "no internal inbound link (orphan)");

const failedUrls = new Set(failures.map((item) => item.url));
const summary = {
  timestamp: new Date().toISOString(),
  origin: testOrigin,
  host: hostHeader || "(request host)",
  expectIndexable,
  manifestRows: manifest.length,
  requests,
  assertions,
  coverage,
  sitemapUrls: locs.length,
  failures: failures.length,
  failedUrls: failedUrls.size
};
await writeFile(
  new URL("../docs/migration-data/verification-results.json", import.meta.url),
  `${JSON.stringify({ summary, failures, evidence }, null, 1)}\n`
);
const csv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const parityHeader = [
  "legacy_url",
  "locale",
  "manifest_action",
  "legacy_status",
  "legacy_redirect_chain",
  "candidate_status",
  "redirect_destination",
  "legacy_title",
  "candidate_title",
  "title_comparison",
  "legacy_description",
  "candidate_description",
  "description_comparison",
  "legacy_h1",
  "candidate_h1",
  "h1_comparison",
  "legacy_canonical",
  "candidate_canonical",
  "canonical_comparison",
  "legacy_robots",
  "candidate_robots",
  "candidate_x_robots_tag",
  "robots_comparison",
  "legacy_hreflang",
  "candidate_hreflang",
  "hreflang_comparison",
  "target_title_contract",
  "target_description_contract",
  "target_h1_contract",
  "sitemap_eligible",
  "schema_types",
  "content_scope",
  "content_blocks_checked",
  "content_blocks_missing",
  "withheld_blocks",
  "withheld_reasons",
  "untranslated_blocks",
  "failures"
];
const parityRows = evidence.map((item) => {
  const rowFailures = failures.filter((failure) => failure.url === item.sourceUrl);
  return [
    item.sourceUrl,
    item.locale,
    item.action,
    item.legacy?.status,
    JSON.stringify(item.legacy?.redirectChain ?? []),
    item.status,
    item.redirectDestination,
    item.legacy?.title,
    item.candidate?.title,
    item.comparison?.title,
    item.legacy?.description,
    item.candidate?.description,
    item.comparison?.description,
    item.legacy?.h1,
    item.candidate?.h1,
    item.comparison?.h1,
    item.legacy?.canonical,
    item.candidate?.canonical,
    item.comparison?.canonical,
    item.legacy?.robots,
    item.candidate?.robots,
    item.candidate?.xRobotsTag,
    item.comparison?.robots,
    JSON.stringify(item.legacy?.hreflang ?? null),
    JSON.stringify(item.candidate?.hreflang ?? {}),
    item.comparison?.hreflang,
    item.comparison?.targetContract?.title,
    item.comparison?.targetContract?.description,
    item.comparison?.targetContract?.h1,
    item.candidate?.sitemapEligible,
    (item.candidate?.schemaTypes ?? []).join("|"),
    item.contentParity?.scope,
    item.contentParity?.checkedBlocks,
    item.contentParity?.missingBlocks?.length,
    item.contentParity?.withheldBlocks?.length,
    [...new Set((item.contentParity?.withheldBlocks ?? []).map((block) => block.reason))].join("|"),
    item.contentParity?.untranslatedBlocks,
    rowFailures.map((failure) => failure.issue).join("; ")
  ]
    .map(csv)
    .join(",");
});
await writeFile(
  new URL("../docs/seo/legacy-parity.csv", import.meta.url),
  `${parityHeader.join(",")}\n${parityRows.join("\n")}\n`
);
console.log(JSON.stringify({ summary, failures: failures.slice(0, 40) }, null, 2));
if (failures.length) process.exitCode = 1;

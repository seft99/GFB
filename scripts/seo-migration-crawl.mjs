/**
 * Reproducible public-source crawler for the GFB SEO migration contract.
 *
 * Usage:
 *   node scripts/seo-migration-crawl.mjs [output-directory]
 *
 * It reads both official sitemap indexes, snapshots every localized URL (metadata, redirect
 * chain, ordered visible content blocks, images, files and internal links) and then records
 * the internal URLs linked from those pages that the sitemaps do not list. It writes
 * machine-readable JSON/CSV. Network access is required; no private data is used.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const productionOrigin = "https://www.gfb-solutions.com";
const observedAt = new Date().toISOString();
const outputDirectory = resolve(process.argv[2] || "docs/migration-data");
const indexes = [
  { locale: "en", url: `${productionOrigin}/sitemap.xml` },
  { locale: "es", url: `${productionOrigin}/es_es-sitemap.xml` }
];

const decode = (value = "") =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&#x27;", "'")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));

/** Plain text of an HTML fragment; `<br>` and block ends become line breaks. */
const text = (value = "") =>
  decode(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/[ \t ​]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();

const first = (html, expression) => text(html.match(expression)?.[1] || "");

async function request(url, redirect = "manual", attempt = 0) {
  const response = await fetch(url, {
    redirect,
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent": "Mozilla/5.0 (compatible; GFBMigrationVerifier/1.0)"
    }
  });
  if ((response.status === 429 || response.status >= 500) && attempt < 5) {
    await response.arrayBuffer();
    const retryAfter = Number(response.headers.get("retry-after"));
    await new Promise((resolveDelay) =>
      setTimeout(resolveDelay, Number.isFinite(retryAfter) ? retryAfter * 1000 : 750 * 2 ** attempt)
    );
    return request(url, redirect, attempt + 1);
  }
  return { response, text: await response.text() };
}

/** Follows redirects one hop at a time so the full chain is recorded. */
async function fetchWithChain(url) {
  const chain = [];
  let current = url;
  for (let hop = 0; hop < 10; hop++) {
    const result = await request(current);
    const location = result.response.headers.get("location");
    if (result.response.status >= 300 && result.response.status < 400 && location) {
      chain.push({ url: current, status: result.response.status });
      current = new URL(location, current).href;
      continue;
    }
    return { ...result, finalUrl: current, chain };
  }
  throw new Error(`redirect loop from ${url}`);
}

async function mapConcurrent(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await worker(items[index], index);
      }
    })
  );
  return results;
}

const xmlLocations = (xml) => [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decode(match[1].trim()));

/** Ordered visible text blocks of the page body (`<main>`), without header/footer. */
function contentBlocks(html) {
  const start = html.search(/<main[\s>]/i);
  const end = html.lastIndexOf("</main>");
  if (start < 0 || end < 0) return [];
  const main = html.slice(start, end).replace(/<(script|style|svg|noscript)[\s\S]*?<\/\1>/gi, "");
  const blocks = [];
  for (const match of main.matchAll(/<(h[1-6]|p|li)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)) {
    const value = text(match[2]);
    if (value) blocks.push({ tag: match[1].toLowerCase(), text: value });
  }
  return blocks;
}

function mainImages(html) {
  const start = html.search(/<main[\s>]/i);
  const main = start < 0 ? "" : html.slice(start, html.lastIndexOf("</main>"));
  return [...main.matchAll(/<img\b[^>]*>/gi)]
    .map((match) => ({
      src: decode(match[0].match(/\ssrc=["']([^"']*)/i)?.[1] || ""),
      alt: decode(match[0].match(/\salt=["']([^"']*)/i)?.[1] || "")
    }))
    .filter((image) => image.src && !image.src.startsWith("data:"));
}

const isInternal = (href) => href.startsWith("/") || href.startsWith(productionOrigin);

function pageLinks(html) {
  const hrefs = [...html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["']/gi)].map((match) => decode(match[1]));
  return {
    internal: [...new Set(hrefs.filter(isInternal).map((href) => new URL(href, productionOrigin).href))],
    files: [...new Set(hrefs.filter((href) => /\.pdf(\?|$)|\/ugd\//i.test(href)))]
  };
}

function snapshot(html) {
  return {
    observedCanonical: first(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i) || null,
    title: first(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || null,
    description: first(html, /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i) || null,
    h1: first(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || null,
    ogImage: first(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i) || null
  };
}

const sitemapEntries = [];
const sitemapFiles = [];
for (const index of indexes) {
  const { response, text: xml } = await request(index.url, "follow");
  if (!response.ok) throw new Error(`${index.url}: ${response.status}`);
  sitemapFiles.push({ url: index.url, type: "index", locale: index.locale });
  for (const child of xmlLocations(xml)) {
    sitemapFiles.push({ url: child, type: "child", locale: index.locale });
    const childResponse = await request(child, "follow");
    if (!childResponse.response.ok) throw new Error(`${child}: ${childResponse.response.status}`);
    for (const block of childResponse.text.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
      sitemapEntries.push({
        locale: index.locale,
        sourceSitemap: child,
        sourceUrl: xmlLocations(block[1])[0],
        sourceLastmod: first(block[1], /<lastmod>([\s\S]*?)<\/lastmod>/i) || null
      });
    }
  }
}

const rows = await mapConcurrent(sitemapEntries, 5, async (entry) => {
  try {
    const { response, text: html, chain, finalUrl } = await fetchWithChain(entry.sourceUrl);
    const links = pageLinks(html);
    return {
      ...entry,
      observedAt,
      provenance: "official sitemap",
      sourceStatus: response.status,
      redirectChain: chain,
      finalUrl,
      ...snapshot(html),
      contentBlocks: contentBlocks(html),
      images: mainImages(html),
      files: links.files,
      internalOutboundLinks: links.internal
    };
  } catch (error) {
    return { ...entry, observedAt, provenance: "official sitemap", crawlError: error.message };
  }
});

// Internal URLs linked from the catalogue but absent from both sitemaps (historical links).
const listed = new Set(sitemapEntries.map((entry) => entry.sourceUrl.replace(/\/$/, "")));
const linked = [...new Set(rows.flatMap((row) => row.internalOutboundLinks || []))].filter((href) => {
  const url = new URL(href);
  url.searchParams.delete("lang");
  return !listed.has(url.href.replace(/\/$/, "")) && !/\.(png|jpe?g|webp|gif|svg|pdf)$/i.test(url.pathname);
});
const extra = await mapConcurrent(linked, 5, async (href) => {
  const { response, chain, finalUrl, text: html } = await fetchWithChain(href);
  return {
    locale: new URL(href).searchParams.get("lang") === "es" ? "es" : "en",
    sourceUrl: href,
    observedAt,
    provenance: "internal link on an official sitemap page",
    linkedFrom: rows.filter((row) => row.internalOutboundLinks?.includes(href)).map((row) => row.sourceUrl),
    sourceStatus: response.status,
    redirectChain: chain,
    finalUrl,
    ...(response.ok ? snapshot(html) : {})
  };
});

await mkdir(outputDirectory, { recursive: true });
await writeFile(resolve(outputDirectory, "legacy-crawl.json"), `${JSON.stringify(rows, null, 1)}\n`);
await writeFile(resolve(outputDirectory, "legacy-extra-urls.json"), `${JSON.stringify(extra, null, 1)}\n`);
await writeFile(resolve(outputDirectory, "legacy-sitemaps.json"), `${JSON.stringify(sitemapFiles, null, 1)}\n`);

const counts = Object.groupBy(rows, (row) => row.locale);
console.log(
  JSON.stringify(
    {
      observedAt,
      rows: rows.length,
      en: counts.en?.length || 0,
      es: counts.es?.length || 0,
      source200: rows.filter((row) => row.sourceStatus === 200).length,
      crawlErrors: rows.filter((row) => row.crawlError).length,
      sitemapFiles: sitemapFiles.length,
      extraLinkedUrls: extra.length,
      outputDirectory
    },
    null,
    2
  )
);

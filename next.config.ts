import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

/**
 * Child sitemaps of the legacy Wix site (docs/migration-data/legacy-sitemaps.json). They are
 * not reproduced: each one redirects to the sitemap of its language, so a known endpoint never
 * returns unrelated HTML. The two index URLs are served by the app.
 */
const legacySitemaps: { url: string; type: "index" | "child"; locale: "en" | "es" }[] = JSON.parse(
  readFileSync(join(process.cwd(), "docs/migration-data/legacy-sitemaps.json"), "utf8")
);

const isDev = process.env.NODE_ENV === "development";

/**
 * Pages are statically generated, so per-request CSP nonces are not available.
 * Inline scripts emitted by Next.js still require 'unsafe-inline'; 'unsafe-eval' is only
 * needed by the development runtime (React stack reconstruction) and is excluded from production.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "img-src 'self' data: blob:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"])
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }])
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    deviceSizes: [320, 375, 430, 768, 1024, 1280, 1440, 1920]
  },
  async headers() {
    // The page-level X-Robots-Tag for preview/unknown hosts comes from proxy.ts (host + environment).
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return legacySitemaps
      .filter((sitemap) => sitemap.type === "child")
      .map((sitemap) => ({
        source: new URL(sitemap.url).pathname,
        destination: sitemap.locale === "es" ? "/es_es-sitemap.xml" : "/sitemap.xml",
        statusCode: 301 as const
      }));
  }
};

export default nextConfig;

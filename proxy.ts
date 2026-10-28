import { NextResponse, type NextRequest } from "next/server";
import { isLocale, type Locale } from "@/src/i18n/config";
import { paths, resolveStaticSegment } from "@/src/i18n/routes";
import { familyOf, legacyKey, legacyKind, legacyRedirects } from "@/src/migration/families";
import { aliasTargets, publicUrl, redesignedRoutes } from "@/src/migration/public-paths";

const productionHost = "www.gfb-solutions.com";

/**
 * Indexable only on the canonical production host of a production deployment. Every other
 * host (Vercel previews and production aliases, localhost, unknown hosts) gets a noindex
 * header; robots.txt stays crawlable so crawlers can read it.
 */
function indexable(request: NextRequest) {
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "")
    .split(",")[0]
    .split(":")[0]
    .trim()
    .toLowerCase();
  const production = process.env.VERCEL_ENV
    ? process.env.VERCEL_ENV === "production"
    : process.env.NODE_ENV === "production";
  return host === productionHost && production;
}

function finish(response: NextResponse, request: NextRequest) {
  if (!indexable(request)) response.headers.set("X-Robots-Tag", "noindex, follow");
  return response;
}

/** Same-origin redirect (preview testers stay on the preview), keeping lead/tracking parameters. */
function redirectTo(request: NextRequest, target: string, status: 301 | 308) {
  const destination = new URL(target, request.url);
  for (const [key, value] of request.nextUrl.searchParams)
    if (key !== "lang" && !destination.searchParams.has(key)) destination.searchParams.append(key, value);
  return finish(NextResponse.redirect(destination, status), request);
}

function rewriteTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return finish(NextResponse.rewrite(url), request);
}

/**
 * Public URL model (src/migration): legacy Wix paths are the canonical public URLs, the clean
 * path in English and the same path with `?lang=es` in Spanish.
 * 1. Localized aliases of redesigned pages (`/en/...`, `/es/...`) → one 308 to the legacy URL.
 * 2. Sitemap entries Wix already redirected → one 301 to the same page, same language.
 * 3. Legacy paths → rewrite to the internal route (redesigned page or legacy detail template).
 * 4. Pages without a legacy URL keep their localized path (contact, consulting sectors, legal).
 * Unknown paths fall through to a real 404. No cookie or Accept-Language redirects.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale: Locale = request.nextUrl.searchParams.get("lang") === "es" ? "es" : "en";

  // Clients that percent-encode the parentheses of can-end slugs reach the canonical spelling
  // in one hop (an encoded slash, %2F, is part of IQF slugs and is never decoded).
  if (/%28|%29/i.test(pathname)) {
    const decoded = pathname.replace(/%28/gi, "(").replace(/%29/gi, ")");
    if (legacyKind(decoded)) return redirectTo(request, publicUrl(decoded, locale), 301);
  }

  const alias = aliasTargets.get(pathname.replace(/\/$/, "") || "/");
  if (alias) return redirectTo(request, publicUrl(alias.path, alias.locale), 308);

  const redirect = legacyRedirects[pathname];
  if (redirect) return redirectTo(request, publicUrl(redirect, locale), 301);

  const redesigned = redesignedRoutes[pathname];
  if (redesigned) return rewriteTo(request, redesigned.route[locale]);

  if (familyOf(pathname)) return rewriteTo(request, `/${locale}/legacy/${legacyKey(pathname)}`);

  const [first, segment, ...rest] = pathname.split("/").filter(Boolean);
  if (!isLocale(first)) return finish(NextResponse.next(), request);

  // The internal legacy route is never a public URL.
  if (segment === "legacy") return finish(new NextResponse(null, { status: 404 }), request);

  const resolution = resolveStaticSegment(first, segment);
  if (resolution.type === "redirect")
    return redirectTo(request, [paths.page(first, resolution.page), ...rest].join("/"), 308);
  if (resolution.type === "rewrite") return rewriteTo(request, ["", first, resolution.page, ...rest].join("/"));
  return finish(NextResponse.next(), request);
}

export const config = {
  // Skip API routes, Next internals, Vercel internals and any file with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"]
};

import { NextResponse, type NextRequest } from "next/server";
import { isLocale, localeCookie } from "@/src/i18n/config";
import { negotiateLocale } from "@/src/i18n/negotiate";
import { paths, resolveStaticSegment } from "@/src/i18n/routes";

/**
 * Locale routing:
 * - Paths without a locale prefix redirect to the negotiated locale.
 * - Localized static slugs (`/es/sobre-gfb`) rewrite to their route folder (`/es/about`).
 * - Folder names or other-locale slugs (`/es/about`, `/en/sobre-gfb`) redirect to the canonical slug.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const [locale, segment, ...rest] = pathname.split("/").filter(Boolean);

  if (!isLocale(locale)) {
    const negotiated = negotiateLocale(
      request.headers.get("accept-language"),
      request.cookies.get(localeCookie)?.value
    );
    const url = request.nextUrl.clone();
    url.pathname = `/${negotiated}${pathname === "/" ? "" : pathname}`;
    return withVary(NextResponse.redirect(url));
  }

  const resolution = resolveStaticSegment(locale, segment);
  let response: NextResponse;
  if (resolution.type === "redirect") {
    const url = request.nextUrl.clone();
    url.pathname = [paths.page(locale, resolution.page), ...rest].join("/");
    url.search = search;
    response = NextResponse.redirect(url, 308);
  } else if (resolution.type === "rewrite") {
    const url = request.nextUrl.clone();
    url.pathname = ["", locale, resolution.page, ...rest].join("/");
    response = NextResponse.rewrite(url);
  } else {
    response = NextResponse.next();
  }

  if (request.cookies.get(localeCookie)?.value !== locale) {
    response.cookies.set(localeCookie, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return response;
}

function withVary(response: NextResponse) {
  response.headers.set("Vary", "Accept-Language, Cookie");
  return response;
}

export const config = {
  // Skip API routes, Next internals, Vercel internals and any file with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"]
};

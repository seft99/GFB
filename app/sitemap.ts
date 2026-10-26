import type { MetadataRoute } from "next";
import { divisions } from "@/src/content/site-content";
import { locales } from "@/src/content/types";
import { siteOrigin } from "@/src/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/about", "/contact", "/legal/privacy", "/legal/cookies"];
  const divisionPaths = divisions.flatMap((division) => [`/${division.slug}`, ...division.categories.map((category) => `/${division.slug}/${category.slug}`)]);
  return locales.flatMap((locale) => [...staticPaths, ...divisionPaths].map((path) => ({ url: `${siteOrigin}/${locale}${path}`, lastModified: new Date(), changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : path.split("/").length <= 2 ? 0.8 : 0.7 })));
}

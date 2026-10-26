import type { Metadata } from "next";
import { NotFoundView } from "@/components/sections/not-found-content";
import { defaultLocale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { paths } from "@/src/i18n/routes";
import "./globals.css";

// URLs outside any locale. The pass-through root layout renders no document, so this page does.
const { notFound } = getDictionary(defaultLocale);

export const metadata: Metadata = { title: notFound.metaTitle };

export default function RootNotFound() {
  return (
    <html lang={defaultLocale}>
      <body>
        <NotFoundView
          copy={notFound}
          homeHref={paths.home(defaultLocale)}
          contactHref={paths.page(defaultLocale, "contact")}
        />
      </body>
    </html>
  );
}

import { ButtonLink } from "@/components/ui/button-link";
import type { Dictionary } from "@/src/i18n/dictionaries";

type NotFoundViewProps = { copy: Dictionary["notFound"]; homeHref: string; contactHref: string };

/** Presentational 404, shared by the locale-aware and the global not-found pages. */
export function NotFoundView({ copy, homeHref, contactHref }: NotFoundViewProps) {
  return (
    <main id="main-content" className="not-found section-dark">
      <div>
        <span>404</span>
        <h1>{copy.title}</h1>
        <p>{copy.text}</p>
        <div className="button-row">
          <ButtonLink href={homeHref} variant="lime">
            {copy.home}
          </ButtonLink>
          <ButtonLink href={contactHref} variant="ghost" arrow={false}>
            {copy.contact}
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}

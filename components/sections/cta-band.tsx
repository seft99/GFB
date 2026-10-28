import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cx } from "@/src/lib/cx";
import "../../app/styles/cta-band.css";

type CtaBandProps = {
  eyebrow: string;
  title: string;
  href: string;
  label: string;
  /** `feature` is the full-height blue band; `compact` is the dark strip closing catalog pages. */
  variant?: "feature" | "compact";
  /** Compact only: `blue` turns the strip into the About-style blue band from 1100px. */
  tone?: "dark" | "blue";
  /**
   * Compact only: page-specific prompt shown instead of `title` from 1100px, where it replaces
   * the separate "project context" note. Below 1100px `title` stays and the note keeps its place.
   */
  context?: { title: string; text: string };
};

export function CtaBand({ eyebrow, title, href, label, variant = "feature", tone = "dark", context }: CtaBandProps) {
  const compact = variant === "compact";
  return (
    <section
      className={cx(
        "section",
        compact ? "compact-cta section-dark" : "cta-section",
        compact && tone === "blue" && "compact-cta--blue"
      )}
    >
      <div className={cx("shell", compact ? "compact-cta__inner" : "cta-panel")}>
        <div>
          <Eyebrow onDark={compact}>{eyebrow}</Eyebrow>
          {compact && context ? (
            <>
              <h2 className="compact-cta__title--mobile">{title}</h2>
              <h2 className="compact-cta__title--desktop">{context.title}</h2>
              <p className="compact-cta__text">{context.text}</p>
            </>
          ) : (
            <h2>{title}</h2>
          )}
        </div>
        <ButtonLink
          href={href}
          variant={compact ? "lime" : "dark"}
          className={compact ? "compact-cta__button" : undefined}
        >
          {label}
        </ButtonLink>
      </div>
    </section>
  );
}

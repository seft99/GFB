import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cx } from "@/src/lib/cx";

type CtaBandProps = {
  eyebrow: string;
  title: string;
  href: string;
  label: string;
  /** `feature` is the full-height blue band; `compact` is the dark strip closing catalog pages. */
  variant?: "feature" | "compact";
};

export function CtaBand({ eyebrow, title, href, label, variant = "feature" }: CtaBandProps) {
  const compact = variant === "compact";
  return (
    <section className={cx("section", compact ? "compact-cta section-dark" : "cta-section")}>
      <div className={cx("shell", compact ? "compact-cta__inner" : "cta-panel")}>
        <div>
          <Eyebrow onDark={compact}>{eyebrow}</Eyebrow>
          <h2>{title}</h2>
        </div>
        <ButtonLink href={href} variant={compact ? "lime" : "dark"}>
          {label}
        </ButtonLink>
      </div>
    </section>
  );
}

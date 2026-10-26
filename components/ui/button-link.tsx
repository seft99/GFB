import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "@/src/lib/cx";
import { Icon } from "./icon";

type Variant = "lime" | "ghost" | "light" | "dark";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant: Variant;
  /** Trailing arrow; on by default for call-to-action links. */
  arrow?: boolean;
};

export function ButtonLink({ variant, arrow = true, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={cx("button", `button--${variant}`, className)} {...props}>
      {children}
      {arrow && <Icon name="arrow" />}
    </Link>
  );
}

type TextLinkProps = ComponentProps<typeof Link> & { tone?: "default" | "light" };

export function TextLink({ tone = "default", className, children, ...props }: TextLinkProps) {
  return (
    <Link className={cx("text-link", tone === "light" && "text-link--light", className)} {...props}>
      {children}
      <Icon name="arrow" />
    </Link>
  );
}

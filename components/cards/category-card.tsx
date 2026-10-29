import Image from "next/image";
import Link from "next/link";
import { TextLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import type { OverviewIcon } from "@/src/content/types";
import { ordinal } from "@/src/lib/format";

type CategoryCardProps = {
  href: string;
  title: string;
  summary: string;
  image: string;
  placeholder?: OverviewIcon;
  index: number;
  linkLabel: string;
};

export function CategoryCard({ href, title, summary, image, placeholder, index, linkLabel }: CategoryCardProps) {
  return (
    <article className="category-card">
      {/* The image link duplicates the text link, so it is hidden from assistive tech and the tab order. */}
      <Link
        href={href}
        className={`category-card__image${placeholder ? " category-card__image--placeholder" : ""}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        {placeholder ? (
          <Icon name={placeholder} strokeWidth={1.1} />
        ) : (
          <Image src={image} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" />
        )}
        <span>{ordinal(index)}</span>
      </Link>
      <div>
        <h3>{title}</h3>
        <p>{summary}</p>
        <TextLink href={href}>
          {linkLabel}
          <span className="visually-hidden">: {title}</span>
        </TextLink>
      </div>
    </article>
  );
}

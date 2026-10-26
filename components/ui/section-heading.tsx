import type { ReactNode } from "react";
import { Eyebrow } from "./eyebrow";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  /** Supporting copy aligned to the right on wide screens. */
  text?: string;
  onDark?: boolean;
};

export function SectionHeading({ eyebrow, title, text, onDark }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div>
        <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow>
        <h2>{title}</h2>
      </div>
      {text && <p>{text}</p>}
    </div>
  );
}

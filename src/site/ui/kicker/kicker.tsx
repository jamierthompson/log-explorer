import type { HTMLAttributes } from "react";

import styles from "./kicker.module.css";

export type KickerTone = "default" | "accent";

/** Small mono caps label in the tracking-kicker family — the overline that
 * sits above (or beside) a heading. `tone` switches the muted default for the
 * brand accent; `as` picks the element so the same look can be a heading, an
 * inline label, or a plain block as the context needs. Distinct from Eyebrow,
 * which uses the wider label tracking above display-scale type. */
export function Kicker({
  as: Tag = "p",
  tone = "default",
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLElement> & {
  as?: "p" | "span" | "em" | "h2";
  tone?: KickerTone;
}) {
  return (
    <Tag
      className={[styles.kicker, className].filter(Boolean).join(" ")}
      data-tone={tone === "accent" ? "accent" : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}

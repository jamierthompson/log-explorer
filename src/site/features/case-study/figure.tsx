import type { ReactNode } from "react";

import styles from "./figure.module.css";

/*
 * Captioned figure for long-form prose. The figcaption is the
 * figure's accessible name, so no aria-label is needed; when a real
 * visual lands, it brings its own alt/aria text.
 *
 * The placeholder dashed border drops off automatically the moment
 * children are passed in — drop in an <img>/<video>/<svg> and the
 * surface becomes a real visual with no other change.
 */
export function Figure({
  caption,
  children,
}: {
  caption: string;
  children?: ReactNode;
}) {
  const hasVisual = Boolean(children);
  return (
    <figure className={styles.figure}>
      <div
        className={
          hasVisual
            ? styles.figureVisual
            : `${styles.figureVisual} ${styles.placeholder}`
        }
      >
        {children}
      </div>
      <FigureCaption>{caption}</FigureCaption>
    </figure>
  );
}

/*
 * Standalone caption for places that need the figcaption styling
 * outside the Figure component.
 */
export function FigureCaption({ children }: { children: ReactNode }) {
  return <figcaption className={styles.caption}>{children}</figcaption>;
}

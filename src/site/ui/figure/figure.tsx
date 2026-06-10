import type { ReactNode } from "react";

import styles from "./figure.module.css";

/* Caption styled to read subordinate to the surrounding prose. */
export function FigureCaption({ children }: { children: ReactNode }) {
  return <figcaption className={styles.caption}>{children}</figcaption>;
}

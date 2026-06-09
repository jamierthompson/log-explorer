import type { ReactNode } from "react";

import { ActHeader } from "../act-header/act-header";
import styles from "./act-layout.module.css";

/**
 * The shared shell every act renders into: narration up top, then a
 * two-column body pairing the act's stage with a side guide. The stage
 * comes first in source order — it's the primary content, so it reads and
 * tabs first — and the guide follows it (to the right on desktop, below on
 * mobile). Acts supply the header copy, the stage, and the aside.
 */
export function ActLayout({
  step,
  kicker,
  title,
  lead,
  aside,
  children,
}: {
  step: string;
  kicker?: string;
  title: ReactNode;
  lead?: ReactNode;
  aside: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <ActHeader step={step} kicker={kicker} title={title} lead={lead} />
      <div className={styles.layout}>
        <div className={styles.main}>{children}</div>
        <div className={styles.aside}>{aside}</div>
      </div>
    </>
  );
}

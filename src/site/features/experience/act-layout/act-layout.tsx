import type { ReactNode } from "react";

import { ActHeader } from "../act-header/act-header";
import styles from "./act-layout.module.css";

/**
 * The shared shell every act renders into: narration up top, then a
 * two-column body pairing a side guide with the act's stage. Acts supply
 * the header copy, the aside, and the stage; the columns and their
 * responsive behavior live here so both acts stay in step.
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
        <div className={styles.aside}>{aside}</div>
        <div className={styles.main}>{children}</div>
      </div>
    </>
  );
}

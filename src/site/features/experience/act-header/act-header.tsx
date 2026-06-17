import type { ReactNode } from "react";

import { Kicker } from "@/site/ui/kicker/kicker";

import styles from "./act-header.module.css";

/** Narration above an act: a numbered kicker ("01 — The old way"), a
 * title, and a lead. The number and label read as one overline rather than
 * a separate badge. */
export function ActHeader({
  step,
  kicker,
  title,
  lead,
}: {
  step: string;
  kicker?: string;
  title: ReactNode;
  lead?: ReactNode;
}) {
  return (
    <header className={styles.header}>
      <Kicker>{kicker ? `${step} — ${kicker}` : step}</Kicker>
      <h2 className={styles.title}>{title}</h2>
      {lead && <p className={styles.lead}>{lead}</p>}
    </header>
  );
}

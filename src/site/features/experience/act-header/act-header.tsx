import type { ReactNode } from "react";

import { Badge } from "@/site/ui/badge/badge";

import styles from "./act-header.module.css";

/** Narration above an act: a step badge, a kicker, a title, and a lead. */
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
      <div className={styles.mark}>
        <Badge>{step}</Badge>
        {kicker && <span className={styles.kicker}>{kicker}</span>}
      </div>
      <h2 className={styles.title}>{title}</h2>
      {lead && <p className={styles.lead}>{lead}</p>}
    </header>
  );
}

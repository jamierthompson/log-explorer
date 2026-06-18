import { Lock } from "lucide-react";

import styles from "./address-bar.module.css";

/**
 * A fake browser toolbar: the chrome band abutting the tab strip above it,
 * holding an inset address field that shows where the view lives. Purely
 * decorative — it isn't a real link — so it's hidden from assistive tech.
 * A long URL is cut by the shared edge fade rather than an ellipsis.
 */
export function AddressBar({ url }: { url: string }) {
  return (
    <div className={styles.toolbar} aria-hidden="true">
      <div className={styles.field}>
        <Lock className={styles.icon} size={12} />
        <span className={styles.url}>{url}</span>
      </div>
    </div>
  );
}

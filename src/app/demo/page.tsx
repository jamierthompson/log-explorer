import { LogExplorer } from "@/components/features/log-explorer/log-explorer";
import { mockLogs } from "@/mocks/logs";

import styles from "./page.module.css";

export default function DemoPage() {
  return (
    <main id="main-content" tabIndex={-1} className={styles.main}>
      <LogExplorer lines={mockLogs} />
    </main>
  );
}

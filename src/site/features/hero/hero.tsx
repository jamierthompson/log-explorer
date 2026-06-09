import { Button } from "@/site/ui/button/button";
import { Eyebrow } from "@/site/ui/eyebrow/eyebrow";

import styles from "./hero.module.css";

export function Hero({
  onOpenDemo,
  onStory,
}: {
  onOpenDemo: () => void;
  onStory: () => void;
}) {
  return (
    <div className={styles.hero}>
      <Eyebrow variant="accent" className={styles.heroEyebrow}>
        A log explorer prototype · 2026
      </Eyebrow>
      <h1 className={styles.heroTitle}>
        Chasing an ID <em>without losing your place</em>.
      </h1>
      <p className={styles.lead}>
        Filter a live tail to a failing request, click a line for context — and
        it opens in a new tab, away from the view you just set up. This
        prototype opens context in place, so the investigation never scatters.
      </p>
      <div className={styles.heroActions}>
        <Button variant="primary" size="lg" onClick={onOpenDemo}>
          Open the logs
        </Button>
      </div>
      <p className={styles.heroFoot}>
        A two-minute interactive demo.{" "}
        <span className={styles.nowrap}>
          Or{" "}
          <Button variant="link" onClick={onStory}>
            read the build story
          </Button>
          .
        </span>
      </p>
    </div>
  );
}

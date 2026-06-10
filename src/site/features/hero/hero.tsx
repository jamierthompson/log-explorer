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
        13:31 UTC. Checkout starts returning 503s on api-gateway while the logs
        tail live. You filter to the failing request, click a span for context —
        and it opens in a new tab, a thin slice of the tail your filter didn’t
        follow. A few clicks in, you’ve got a fan of tabs and the incident
        scattered across them.
      </p>
      <div className={styles.coverMeta}>
        <span>
          <em>Service</em> api-gateway
        </span>
        <span>
          <em>Symptom</em> checkout 503s
        </span>
        <span>
          <em>Instances</em> kc4qn · m7w3p · t2x8r
        </span>
      </div>
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

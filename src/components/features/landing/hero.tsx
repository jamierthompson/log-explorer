import { Button } from "@/components/ui/button/button";
import { Eyebrow } from "@/components/ui/eyebrow/eyebrow";

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
      <Eyebrow>Personal project · 2026</Eyebrow>
      <h1 className={styles.heroTitle}>
        A log explorer prototype for investigating an incident{" "}
        <em>without losing your place</em>.
      </h1>
      <p className={styles.lead}>
        A working prototype, and the story of building it. I went looking for a
        paper cut worth fixing: a small, real, unglamorous problem. I found a
        developer describing this one — losing your place in a live-log
        investigation every time you stop to look closer. The subject stays
        narrow on purpose, because the work that matters is small: the keyboard
        surface, the acknowledgement that a press landed, the few pixels of
        motion that make an action feel real.
      </p>
      <div className={styles.heroActions}>
        <Button variant="primary" onClick={onOpenDemo}>
          Open the logs
        </Button>
      </div>
      <p className={styles.heroFoot}>
        <Button variant="link" onClick={onStory}>
          Read the build story →
        </Button>
      </p>
    </div>
  );
}

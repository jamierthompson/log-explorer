import { Button } from "@/site/ui/button/button";
import { Link } from "@/site/ui/link/link";

import styles from "./top-nav.module.css";
import type { View } from "./use-hash-route";

const REPO_URL = "https://github.com/jamierthompson/log-explorer";

/**
 * Persistent top nav. The brand returns to the hero; a Story link leads
 * into the build story from elsewhere (the story carries its own table
 * of contents). The repo link is always present.
 */
export function TopNav({
  view,
  onHome,
  onStory,
}: {
  view: View;
  onHome: () => void;
  onStory: () => void;
}) {
  return (
    <header className={styles.topnav}>
      <Button variant="ghost" className={styles.brand} onClick={onHome}>
        <span className={styles.brandMark} aria-hidden="true" />
        Log Explorer
      </Button>

      <nav className={styles.links} aria-label="Primary">
        {view !== "story" && (
          <Button variant="ghost" onClick={onStory}>
            Story
          </Button>
        )}
        <Link href={REPO_URL} external>
          Code ↗
        </Link>
      </nav>
    </header>
  );
}

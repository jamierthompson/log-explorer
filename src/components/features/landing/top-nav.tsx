import { Button } from "@/components/ui/button/button";
import { Link } from "@/components/ui/link/link";

import { STORY_SECTIONS } from "./story-sections";
import styles from "./top-nav.module.css";
import type { View } from "./use-hash-route";

const REPO_URL = "https://github.com/jamierthompson/log-explorer";

/**
 * Persistent top nav. The brand returns to the hero; the right cluster
 * shows the story's table of contents while reading and a link into the
 * story otherwise. The repo link is always present.
 */
export function TopNav({
  view,
  onHome,
  onStory,
  onJumpToSection,
}: {
  view: View;
  onHome: () => void;
  onStory: () => void;
  onJumpToSection: (id: string) => void;
}) {
  return (
    <header className={styles.topnav}>
      <Button variant="ghost" className={styles.brand} onClick={onHome}>
        <span className={styles.brandMark} aria-hidden="true" />
        Log Explorer
      </Button>

      <nav className={styles.links} aria-label="Primary">
        {view === "story" ? (
          <span className={styles.toc}>
            {STORY_SECTIONS.map((section) => (
              <Button
                key={section.id}
                variant="link"
                className={styles.tocLink}
                onClick={() => onJumpToSection(section.id)}
              >
                {section.label}
              </Button>
            ))}
          </span>
        ) : (
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

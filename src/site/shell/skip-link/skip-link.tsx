import styles from "./skip-link.module.css";

/**
 * Keyboard-accessibility escape hatch: hidden off-screen until focused,
 * it jumps past the persistent chrome to the main-content landmark.
 */
export function SkipLink() {
  return (
    <a href="#main-content" className={styles.skipLink}>
      Skip to main content
    </a>
  );
}

import { smoothScrollAppViewportToTop } from "@/site/ui/scroll-area/app-scroll";

import styles from "./footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.copyright}>© 2026 Jamie Thompson</p>
      <button
        type="button"
        className={styles.toTop}
        onClick={smoothScrollAppViewportToTop}
      >
        <span aria-hidden="true">↑</span> Back to the top
      </button>
    </footer>
  );
}

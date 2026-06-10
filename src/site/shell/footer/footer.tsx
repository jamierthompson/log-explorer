import { smoothScrollAppViewportToTop } from "@/site/ui/scroll-area/app-scroll";

import styles from "./footer.module.css";

export function Footer() {
  const backToTop = () => {
    smoothScrollAppViewportToTop();
    // Move focus along with the scroll so the next Tab continues from
    // the top instead of from the footer; preventScroll keeps the
    // smooth glide intact.
    document.getElementById("main-content")?.focus({ preventScroll: true });
  };

  return (
    <footer className={styles.footer}>
      <p className={styles.copyright}>© 2026 Jamie Thompson</p>
      <button type="button" className={styles.toTop} onClick={backToTop}>
        <span aria-hidden="true">↑</span> Back to the top
      </button>
    </footer>
  );
}

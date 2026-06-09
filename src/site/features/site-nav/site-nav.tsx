import type { View } from "@/site/features/landing/use-hash-route";
import { NavLink } from "@/site/ui/nav-link/nav-link";

import styles from "./site-nav.module.css";

const REPO_URL = "https://github.com/jamierthompson/log-explorer";

/** The site's persistent header: the brand returns to the intro; the
 * links navigate the single-page views, with Code opening the repo. */
export function SiteNav({
  view,
  onNavigate,
}: {
  view: View;
  onNavigate: (view: View) => void;
}) {
  return (
    <header className={styles.nav}>
      <div className={styles.navInner}>
        <button
          type="button"
          className={styles.brand}
          onClick={() => onNavigate("hero")}
        >
          <LogoMark />
          <span className={styles.brandText}>Log Explorer</span>
        </button>

        <nav className={styles.links} aria-label="Primary">
          <NavLink active={view === "demo"} onClick={() => onNavigate("demo")}>
            Demo
          </NavLink>
          <NavLink
            active={view === "story"}
            onClick={() => onNavigate("story")}
          >
            Story
          </NavLink>
          <NavLink href={REPO_URL} external>
            Code
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

/** The bracket-and-chevron mark, matching the favicon, stroked in the
 * brand accent. */
function LogoMark() {
  return (
    <svg className={styles.mark} viewBox="5 5 22 22" aria-hidden="true">
      <path
        d="M10 8 H7 V24 H10"
        strokeWidth="2"
        opacity="0.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 8 H25 V24 H22"
        strokeWidth="2"
        opacity="0.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 11.5 L18 16 L14 20.5"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

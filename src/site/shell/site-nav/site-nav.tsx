"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavLink } from "@/site/ui/nav-link/nav-link";

import styles from "./site-nav.module.css";

const REPO_URL = "https://github.com/jamierthompson/log-explorer";

/** The site's persistent header: the brand returns to the intro; the links
 * navigate the sections, with Code opening the repo. */
export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className={styles.nav}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.brand}>
          <LogoMark />
          <span className={styles.brandText}>Log Explorer</span>
        </Link>

        <nav className={styles.links} aria-label="Primary">
          <NavLink href="/demo" active={pathname.startsWith("/demo")}>
            Demo
          </NavLink>
          <NavLink href="/story" active={pathname.startsWith("/story")}>
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

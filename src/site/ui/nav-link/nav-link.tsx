import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./nav-link.module.css";

type CommonProps = { children: ReactNode; active?: boolean };

export type NavLinkProps =
  | (CommonProps & { href: string; external: true })
  | (CommonProps & { href: string; external?: false });

/**
 * A nav item. Internal targets route client-side; external ones open in a
 * new tab with an indicator icon. Both share one style so every item reads
 * the same.
 */
export function NavLink(props: NavLinkProps) {
  if (props.external) {
    return (
      <a
        className={styles.link}
        href={props.href}
        target="_blank"
        rel="noreferrer"
      >
        {props.children}
        <ArrowUpRight className={styles.icon} aria-hidden="true" />
      </a>
    );
  }

  return (
    <Link
      className={styles.link}
      data-active={props.active || undefined}
      aria-current={props.active ? "page" : undefined}
      href={props.href}
    >
      {props.children}
    </Link>
  );
}

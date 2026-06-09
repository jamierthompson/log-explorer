import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import styles from "./nav-link.module.css";

type CommonProps = { children: ReactNode; active?: boolean };

export type NavLinkProps =
  | (CommonProps & { onClick: () => void })
  | (CommonProps & { href: string; external?: boolean });

/**
 * A nav item that renders as a button (in-app navigation) or an anchor
 * (external — opens in a new tab with an indicator icon), sharing one
 * style so every item reads the same.
 */
export function NavLink(props: NavLinkProps) {
  if ("href" in props) {
    return (
      <a
        className={styles.link}
        data-active={props.active || undefined}
        href={props.href}
        target={props.external ? "_blank" : undefined}
        rel={props.external ? "noreferrer" : undefined}
      >
        {props.children}
        {props.external && (
          <ArrowUpRight className={styles.icon} aria-hidden="true" />
        )}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={styles.link}
      data-active={props.active || undefined}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

"use client";

import * as RadixScrollArea from "@radix-ui/react-scroll-area";
import type { ReactNode } from "react";

import styles from "./scroll-area.module.css";

/**
 * Scroll container with a brand-accent thumb that matches the explorer's
 * own scrollbar, so page-level and nested scrolling read consistently.
 * `isPageScroll` tags the viewport as the single app-level scroller so
 * fixed chrome (scroll-to-top) can drive it; nested uses leave it off.
 */
export function ScrollArea({
  className,
  children,
  isPageScroll = false,
}: {
  className?: string;
  children: ReactNode;
  isPageScroll?: boolean;
}) {
  return (
    <RadixScrollArea.Root
      className={[styles.root, className].filter(Boolean).join(" ")}
      type="scroll"
    >
      <RadixScrollArea.Viewport
        className={styles.viewport}
        data-app-scroll-viewport={isPageScroll ? "" : undefined}
      >
        {children}
      </RadixScrollArea.Viewport>
      <RadixScrollArea.Scrollbar
        orientation="vertical"
        className={styles.scrollbar}
      >
        <RadixScrollArea.Thumb className={styles.thumb} />
      </RadixScrollArea.Scrollbar>
      <RadixScrollArea.Corner />
    </RadixScrollArea.Root>
  );
}

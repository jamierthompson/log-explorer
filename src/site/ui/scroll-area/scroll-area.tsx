"use client";

import * as RadixScrollArea from "@radix-ui/react-scroll-area";
import { useEffect, useRef, type ReactNode } from "react";

import styles from "./scroll-area.module.css";

/**
 * Scroll container with a brand-accent thumb that matches the explorer's
 * own scrollbar, so page-level and nested scrolling read consistently.
 * The bar overlays the content on either axis, taking no layout space.
 * `isPageScroll` tags the viewport as the single app-level scroller so
 * controls elsewhere on the page can drive it; nested uses leave it off.
 */
export function ScrollArea({
  className,
  children,
  isPageScroll = false,
  orientation = "vertical",
}: {
  className?: string;
  children: ReactNode;
  isPageScroll?: boolean;
  orientation?: "vertical" | "horizontal";
}) {
  const viewportRef = useRef<HTMLDivElement>(null);

  /*
   * A mouse wheel only emits vertical deltas, which a sideways scroller
   * ignores — so translate the dominant vertical motion into horizontal
   * scroll while the pointer is over it, the way browser tab strips do.
   * Registered manually because preventDefault (to keep the page from
   * scrolling underneath) requires a non-passive listener.
   */
  useEffect(() => {
    if (orientation !== "horizontal") return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (viewport.scrollWidth <= viewport.clientWidth) return;
      viewport.scrollLeft += event.deltaY;
      event.preventDefault();
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [orientation]);

  return (
    <RadixScrollArea.Root
      className={[styles.root, className].filter(Boolean).join(" ")}
      type="scroll"
      data-orientation={orientation}
    >
      <RadixScrollArea.Viewport
        ref={viewportRef}
        className={styles.viewport}
        data-app-scroll-viewport={isPageScroll ? "" : undefined}
      >
        {children}
      </RadixScrollArea.Viewport>
      <RadixScrollArea.Scrollbar
        orientation={orientation}
        className={styles.scrollbar}
      >
        <RadixScrollArea.Thumb className={styles.thumb} />
      </RadixScrollArea.Scrollbar>
      <RadixScrollArea.Corner />
    </RadixScrollArea.Root>
  );
}

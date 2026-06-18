"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { X } from "lucide-react";
import { useCallback, useMemo, useRef, type ReactNode } from "react";

import { formatLogTime, type LogLine } from "@/demo";

import { ScrollArea } from "@/site/ui/scroll-area/scroll-area";

import { useDemoState } from "../demo-state";
import { AddressBar } from "./address-bar";
import { ContextPane } from "./context-pane";
import styles from "./investigation-stage.module.css";

const LIVE = "live";

type ContextTab = { readonly id: string; readonly line: LogLine };

/** The site mark, reused as the favicon every tab wears — one site, one
 * icon across the strip, the way a real browser shows it. */
function TabFavicon() {
  return (
    <svg
      className={styles.favicon}
      viewBox="5 5 22 22"
      width="14"
      height="14"
      aria-hidden="true"
      focusable="false"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 8 H7 V24 H10" strokeWidth="2" opacity="0.7" />
        <path d="M22 8 H25 V24 H22" strokeWidth="2" opacity="0.7" />
        <path d="M14 11.5 L18 16 L14 20.5" strokeWidth="2.4" />
      </g>
    </svg>
  );
}

/**
 * The browser-style tab strip both acts render into. The Live tail tab is
 * permanent and uncloseable — it holds the filtered stream that survives the
 * cut, so the strip and the layout stay put from act to act. Act one
 * delegates each context look into its own slice tab beside it (the
 * scatter); act two opens context in place, so no slice tabs ever join the
 * Live tail. Owns the tab chrome only; the explorer for the live panel is
 * handed in as children.
 */
export function InvestigationStage({
  lines,
  service,
  children,
}: {
  lines: readonly LogLine[];
  /** Names the slice address bars after the stream's service. */
  service: string;
  /** The explorer rendered in the live-tail panel — act-specific. */
  children: ReactNode;
}) {
  const { state, closeTab, activateTab } = useDemoState();
  const { tabs: storedTabs } = state;
  const liveTabRef = useRef<HTMLButtonElement>(null);

  const tabs = useMemo<readonly ContextTab[]>(
    () =>
      storedTabs.ids
        .map((id) => {
          const line = lines.find((l) => l.id === id);
          return line ? { id, line } : null;
        })
        .filter((t): t is ContextTab => t !== null),
    [storedTabs.ids, lines],
  );
  const active = storedTabs.active ?? LIVE;

  // "N of M": the active tab's place in the strip over the total. Live tail
  // is position 1; slices follow in order. A stale/missing active falls back
  // to the live tail rather than a phantom position.
  const total = tabs.length + 1;
  const sliceIndex = tabs.findIndex((t) => t.id === active);
  const activePosition =
    active === LIVE || sliceIndex === -1 ? 1 : sliceIndex + 2;

  const setActive = useCallback(
    (next: string) => activateTab(next === LIVE ? null : next),
    [activateTab],
  );

  return (
    <Tabs.Root
      className={styles.stage}
      value={active}
      onValueChange={setActive}
    >
      <div className={styles.tabBar}>
        <ScrollArea orientation="horizontal" className={styles.tabScroll}>
          <Tabs.List className={styles.tabstrip} aria-label="Open views">
            <Tabs.Trigger
              ref={liveTabRef}
              value={LIVE}
              className={`${styles.tab} ${styles.tabLive}`}
            >
              <TabFavicon />
              <span className={styles.tabLabel}>Live tail</span>
              {/* Reserve the close control's footprint so the live tab
                  matches a slice's width even though it can't be closed. */}
              <span className={styles.tabClosePlaceholder} aria-hidden="true" />
            </Tabs.Trigger>

            {tabs.map((tab) => (
              <span key={tab.id} className={styles.tab}>
                <Tabs.Trigger
                  value={tab.id}
                  className={styles.tabTrigger}
                  aria-label={`Context slice ${formatLogTime(tab.line.timestamp)}`}
                  onKeyDown={(event) => {
                    if (event.key !== "Delete") return;
                    closeTab(tab.id);
                    // The focused trigger is about to unmount; land on
                    // the tab that takes over rather than the body.
                    liveTabRef.current?.focus();
                  }}
                >
                  <TabFavicon />
                  {/* The line's message stands in for the page title a
                      real tab would show; the time stays in the label for
                      assistive tech. */}
                  <span className={styles.tabLabel}>{tab.line.message}</span>
                </Tabs.Trigger>
                {/*
                 * A button inside a tablist breaks the tab content
                 * model and adds stray tab stops, so the close control
                 * is pointer-only — hidden from assistive tech and out
                 * of the tab order. Keyboard users close a slice with
                 * Delete on its trigger instead.
                 */}
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  className={styles.tabClose}
                  onClick={() => closeTab(tab.id)}
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </span>
            ))}
          </Tabs.List>
        </ScrollArea>
        {/* The active tab's place in the strip over the total — counting the
         * whole strip (live tail + slices) so it matches what's on screen.
         * Decorative for assistive tech; the tablist already announces it. */}
        <span className={styles.tabCount} aria-hidden="true">
          {activePosition} of {total}
        </span>
      </div>

      {/* The tabs primitive makes each panel a tab stop by default,
       * which is for panels with no focusable content; these contain
       * the explorer or a focusable scroller, so the panel itself
       * stays out of the tab order. */}
      <Tabs.Content
        value={LIVE}
        className={styles.panel}
        tabIndex={-1}
        forceMount
      >
        {/* The live view is a page too: browser chrome (the address bar)
            sits above the app's own chrome (the filters and list). */}
        <AddressBar url={`logs.example.com/${service}`} />
        <div className={styles.liveBody}>{children}</div>
      </Tabs.Content>

      {tabs.map((tab) => (
        <Tabs.Content
          key={tab.id}
          value={tab.id}
          className={styles.panel}
          tabIndex={-1}
        >
          <ContextPane lines={lines} anchorId={tab.id} service={service} />
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

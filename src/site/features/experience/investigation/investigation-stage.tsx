"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { X } from "lucide-react";
import { useCallback, useMemo, useRef, type ReactNode } from "react";

import { formatLogTime, type LogLine } from "@/demo";

import { ScrollArea } from "@/site/ui/scroll-area/scroll-area";

import { useDemoState } from "../demo-state";
import { ContextPane } from "./context-pane";
import styles from "./investigation-stage.module.css";

const LIVE = "live";

type ContextTab = { readonly id: string; readonly line: LogLine };

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
  children,
}: {
  lines: readonly LogLine[];
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

  const setActive = useCallback(
    (next: string) => activateTab(next === LIVE ? null : next),
    [activateTab],
  );

  return (
    <Tabs.Root className={styles.stage} value={active} onValueChange={setActive}>
      <div className={styles.tabBar}>
        <ScrollArea orientation="horizontal" className={styles.tabScroll}>
          <Tabs.List className={styles.tabstrip} aria-label="Open views">
            <Tabs.Trigger
              ref={liveTabRef}
              value={LIVE}
              className={`${styles.tab} ${styles.tabLive}`}
            >
              Live tail
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
                  {formatLogTime(tab.line.timestamp)}
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

        {tabs.length > 0 && (
          <span className={styles.tabCount}>
            {tabs.length} tab{tabs.length === 1 ? "" : "s"} open
          </span>
        )}
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
        {children}
      </Tabs.Content>

      {tabs.map((tab) => (
        <Tabs.Content
          key={tab.id}
          value={tab.id}
          className={styles.panel}
          tabIndex={-1}
        >
          <ContextPane lines={lines} anchorId={tab.id} />
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

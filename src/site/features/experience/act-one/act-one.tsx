"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { ArrowRight, X } from "lucide-react";
import { useCallback, useMemo, useRef } from "react";

import {
  filterFromScenarioIds,
  formatLogTime,
  LogExplorer,
  type LogExplorerSnapshot,
  LogRow,
  type LogLine,
} from "@/demo";

import { ScrollArea } from "@/site/ui/scroll-area/scroll-area";

import { ActLayout } from "../act-layout/act-layout";
import { useDemoAnnounce } from "../demo-shell";
import { useDemoState } from "../demo-state";
import { GuideBox, type GuideItem } from "../guide-box/guide-box";
import styles from "./act-one.module.css";

/* Lines of unfiltered context a tab shows on each side of its anchor —
 * a deliberately small window, so each tab reads as a thin slice torn out
 * of the live tail rather than a second log view. */
const PANE_RANGE = 5;

const LIVE = "live";

type ContextTab = { readonly id: string; readonly line: LogLine };

/* The pane's note names what the tab is — a slice of the live tail with no
 * filter — and escalates with the count so the scatter is felt, pointing
 * back to the live tail that still holds the visitor's place. */
function paneNote(tabCount: number): string {
  if (tabCount >= 3) {
    return `${tabCount} slices of the live tail, each stranded in its own tab — you’re rebuilding the timeline by flipping between them.`;
  }
  if (tabCount === 2) {
    return "Another slice of the live tail — two tabs now. Flip back to the live tail for your filtered place.";
  }
  return "A slice of the live tail around this line, opened in its own tab — and your filter didn’t come with it.";
}

/**
 * Act 1 — the old way. A complete act: narration, a side guide, and a
 * stage that runs the explorer with context delegated out (onViewContext),
 * so opening a line's context spawns a browser-style tab here instead of
 * expanding in place. The live tail's panel is force-mounted, so it stays
 * filtered behind the tabs and returning to it keeps the visitor's place.
 *
 * Its filter, open tabs, and progress are held in the demo store above the
 * route, so leaving for Act 2 (or the story) and returning restores them.
 * A reset clears that state and remounts the act, so the explorer comes
 * back with a cleared filter — which it can't otherwise expose.
 */
export function ActOne({
  lines,
  onAdvance,
  onReset,
}: {
  lines: readonly LogLine[];
  onAdvance: () => void;
  onReset: () => void;
}) {
  const {
    state,
    setAct1Scenarios,
    openAct1Tab,
    closeAct1Tab,
    activateAct1Tab,
    markAct1Filtered,
  } = useDemoState();
  const announce = useDemoAnnounce();

  const { scenarioIds, tabs: storedTabs, everFiltered } = state.act1;
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
    (next: string) => activateAct1Tab(next === LIVE ? null : next),
    [activateAct1Tab],
  );

  const handleState = useCallback(
    (snapshot: LogExplorerSnapshot) => {
      if (snapshot.hasFilter) markAct1Filtered();
      setAct1Scenarios(snapshot.activeScenarioIds);
    },
    [markAct1Filtered, setAct1Scenarios],
  );

  const openContext = useCallback(
    (lineId: string) => {
      if (!lines.some((l) => l.id === lineId)) return;
      openAct1Tab(lineId);
    },
    [lines, openAct1Tab],
  );

  const tabCount = tabs.length;
  const items: readonly GuideItem[] = [
    {
      id: "filter",
      title: "Filter the live tail",
      description:
        "Pick a chip to narrow the stream — errors, a request, an instance.",
      done: everFiltered,
    },
    {
      id: "open",
      title: "Open a line for context",
      description:
        "Click a matching line — the slice lands in a new tab, and your filtered tail stays put, one tab back.",
      done: tabCount >= 1,
    },
    {
      id: "pile",
      title: "Reassemble by hand",
      description:
        "Two tabs, two slices — you’re holding the timeline together in your head.",
      done: tabCount >= 2,
    },
  ];

  return (
    <ActLayout
      step="Act 1"
      kicker="The old way"
      title="A tab for every click"
      lead="Filter the live tail to the failing request, then open a line for context. Every look opens another tab — and the investigation starts to scatter."
      aside={
        <GuideBox
          title="What’s happening"
          items={items}
          onAnnounce={announce}
          onReset={onReset}
          action={{
            label: (
              <>
                There’s a better way
                <ArrowRight size={16} aria-hidden="true" />
              </>
            ),
            onClick: onAdvance,
          }}
          foot={
            tabCount >= 3
              ? `${tabCount} tabs open. You’re rebuilding the timeline by flipping between them.`
              : "Every look at context buys one thin slice and opens one more tab."
          }
        />
      }
    >
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
                      closeAct1Tab(tab.id);
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
                    onClick={() => closeAct1Tab(tab.id)}
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
          <LogExplorer
            lines={lines}
            service="api-gateway"
            showLegend={false}
            initialFilter={filterFromScenarioIds(scenarioIds)}
            onViewContext={openContext}
            onStateChange={handleState}
          />
        </Tabs.Content>

        {tabs.map((tab) => (
          <Tabs.Content
            key={tab.id}
            value={tab.id}
            className={styles.panel}
            tabIndex={-1}
          >
            <ContextPane
              lines={lines}
              anchorId={tab.id}
              tabCount={tabs.length}
            />
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </ActLayout>
  );
}

function ContextPane({
  lines,
  anchorId,
  tabCount,
}: {
  lines: readonly LogLine[];
  anchorId: string;
  tabCount: number;
}) {
  const index = lines.findIndex((l) => l.id === anchorId);
  const slice =
    index === -1
      ? []
      : lines.slice(Math.max(0, index - PANE_RANGE), index + PANE_RANGE + 1);

  return (
    <div className={styles.pane}>
      <p className={styles.paneNote}>{paneNote(tabCount)}</p>
      {/* A text-only scroller: nothing inside takes focus, so the
       * viewport itself must, or keyboard users can't scroll it. */}
      <ScrollArea focusLabel="Log slice">
        <ul className={styles.paneList}>
          {slice.map((line) => (
            <li
              key={line.id}
              className={styles.paneRow}
              data-anchor={line.id === anchorId || undefined}
              aria-current={line.id === anchorId || undefined}
            >
              <LogRow line={line} />
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}

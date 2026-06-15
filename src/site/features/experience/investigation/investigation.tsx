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
import styles from "./investigation.module.css";

/* Lines of unfiltered context a tab shows on each side of its anchor — a
 * deliberately small window, so each tab reads as a thin slice torn out of
 * the live tail rather than a second log view. */
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
 * The demo's single investigation, staged in two phases against one shared
 * store. In the old way the explorer delegates context out (onViewContext),
 * so opening a line spawns a browser-style tab and the work scatters; the
 * cut folds those slices into stacked in-place contexts and switches the
 * same explorer to expanding context where the line lives. The checklist,
 * filter, and place persist across the cut and reset as one.
 */
export function Investigation({
  lines,
  onCallRootCause,
  onReset,
}: {
  lines: readonly LogLine[];
  /** Opens the root-cause call — the in-place phase's closing action. */
  onCallRootCause: () => void;
  /** Resets the whole investigation in place — the guide's control. */
  onReset: () => void;
}) {
  const {
    state,
    setScenarios,
    openTab,
    closeTab,
    activateTab,
    markFiltered,
    setContexts,
    observe,
    cut,
  } = useDemoState();
  const announce = useDemoAnnounce();

  const {
    phase,
    scenarioIds,
    tabs: storedTabs,
    openContexts,
    progress,
  } = state;
  const inPlace = phase === "in-place";
  const liveTabRef = useRef<HTMLButtonElement>(null);

  /* Cumulative in-place context opens this run, for the blast-radius step.
   * Local refs that restart at zero on remount (a reset or return visit);
   * safe only because the step is sticky in the store — a fresh counter can
   * re-observe the step but never un-observe it. */
  const contextsOpened = useRef(0);
  const prevOpenCount = useRef(0);

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

  const handleState = useCallback(
    (snapshot: LogExplorerSnapshot) => {
      if (snapshot.hasFilter) markFiltered();
      setScenarios(snapshot.activeScenarioIds);

      // Context only opens in place; in the old way it's delegated to tabs,
      // so these readings are meaningful only after the cut.
      if (inPlace) {
        if (snapshot.openContextCount > prevOpenCount.current) {
          contextsOpened.current +=
            snapshot.openContextCount - prevOpenCount.current;
        }
        prevOpenCount.current = snapshot.openContextCount;
        setContexts(snapshot.openContexts);
      }

      const a = snapshot.activeScenarioIds;
      observe({
        triaged: a.includes("errors"),
        traced: a.includes("trace"),
        context: inPlace && snapshot.openContextCount >= 1,
        radius:
          a.includes("instance") || (inPlace && contextsOpened.current >= 2),
      });
    },
    [inPlace, markFiltered, setScenarios, setContexts, observe],
  );

  const openContext = useCallback(
    (lineId: string) => {
      if (!lines.some((l) => l.id === lineId)) return;
      openTab(lineId);
    },
    [lines, openTab],
  );

  const tabCount = tabs.length;
  const items: readonly GuideItem[] = [
    {
      id: "triage",
      title: "Triage the symptom",
      description: "Filter to errors to see what’s actually failing.",
      done: progress.triaged,
    },
    {
      id: "trace",
      title: "Trace the failed checkout",
      description:
        "Follow req=r4d8a2 span by span. It dies waiting on the db pool — but not why.",
      done: progress.traced,
    },
    {
      id: "context",
      title: "Open context where the line lives",
      description:
        "The cause carries no request id — only the lines around the failure show it.",
      done: progress.context,
    },
    {
      id: "radius",
      title: "Check the blast radius",
      description:
        "One instance, or all three? Open another context — or narrow to @kc4qn — and see.",
      done: progress.radius,
    },
  ];

  return (
    <ActLayout
      step="Investigation"
      kicker={inPlace ? "In place" : "The old way"}
      title={
        inPlace ? "Open context where the line lives" : "A tab for every click"
      }
      lead={
        inPlace
          ? "The same investigation, kept in one view. The trace shows where checkout broke — opening context in place shows why."
          : "Filter to the failed checkout, then open a line for context. Every look opens another tab — and the investigation starts to scatter."
      }
      aside={
        <GuideBox
          title={inPlace ? "The method" : "The old way"}
          items={items}
          onAnnounce={announce}
          onReset={onReset}
          action={
            inPlace
              ? { label: "Call the root cause", onClick: onCallRootCause }
              : {
                  label: (
                    <>
                      Piece it together
                      <ArrowRight size={16} aria-hidden="true" />
                    </>
                  ),
                  onClick: cut,
                }
          }
          foot={
            inPlace ? (
              <>
                Checkout times out at <strong>13:31:58</strong>. What put it
                there?
              </>
            ) : tabCount >= 3 ? (
              `${tabCount} tabs open. You’re rebuilding the timeline by flipping between them.`
            ) : (
              "Every look at context buys one thin slice and opens one more tab."
            )
          }
        />
      }
    >
      {inPlace ? (
        <LogExplorer
          lines={lines}
          service="api-gateway"
          initialFilter={filterFromScenarioIds(scenarioIds)}
          initialContexts={openContexts}
          onStateChange={handleState}
        />
      ) : (
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
      )}
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

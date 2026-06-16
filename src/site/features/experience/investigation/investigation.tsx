"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { ArrowRight, X } from "lucide-react";
import { useCallback, useMemo, useRef } from "react";

import {
  DEFAULT_CONTEXT_RANGE,
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

const LIVE = "live";

type ContextTab = { readonly id: string; readonly line: LogLine };

/**
 * The demo's single investigation, staged in two phases against one shared
 * store. In phase one the explorer delegates context out (onViewContext),
 * so opening a line spawns a browser-style tab and the work scatters; the
 * cut clears those tabs and returns to the filtered live tail, switching the
 * same explorer to phase two. The checklist and filter persist and reset as one.
 */
export function Investigation({
  lines,
  onCallRootCause,
  onReset,
}: {
  lines: readonly LogLine[];
  /** Opens the root-cause call — phase two's closing action. */
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
    everFiltered,
    tabs: storedTabs,
    openContexts,
    progress,
  } = state;
  const isPhaseTwo = phase === "phase-two";
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

  const handleState = useCallback(
    (snapshot: LogExplorerSnapshot) => {
      if (snapshot.hasFilter) markFiltered();
      setScenarios(snapshot.activeScenarioIds);

      // Context only opens in place; in phase one it's delegated to tabs.
      // Persist it so it survives navigation and re-seeds the explorer back.
      if (isPhaseTwo) setContexts(snapshot.openContexts);

      const a = snapshot.activeScenarioIds;
      observe({
        traced: a.includes("trace"),
        examined: isPhaseTwo && snapshot.openContexts.length > 0,
        stacked: isPhaseTwo && snapshot.openContexts.length >= 2,
        surfaced: isPhaseTwo && snapshot.hasExpandedContext,
      });
    },
    [isPhaseTwo, markFiltered, setScenarios, setContexts, observe],
  );

  const openContext = useCallback(
    (lineId: string) => {
      if (!lines.some((l) => l.id === lineId)) return;
      openTab(lineId);
    },
    [lines, openTab],
  );

  // Phase-scoped goals, each with always-visible subtext naming its move.
  // The copy echoes the story's "The problem" and "The idea" so the demo
  // and the write-up speak with one voice.
  const phaseOneItems: readonly GuideItem[] = [
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
      done: progress.opened,
    },
    {
      id: "pile",
      title: "Reassemble by hand",
      description:
        "Two tabs, two slices — you’re piecing the timeline back together by switching between them.",
      done: progress.piled,
    },
  ];
  const phaseTwoItems: readonly GuideItem[] = [
    {
      id: "inplace",
      title: "Open context in place",
      description:
        "Click a line and its context opens right here, the non-matching lines dimmed.",
      done: progress.examined,
    },
    {
      id: "stack",
      title: "Open a second context",
      description:
        "Click another line and a second context opens in the same view.",
      done: progress.stacked,
    },
    {
      id: "upstream",
      title: "Expand an open context",
      description: "Reach further for the calls before and the calls after.",
      done: progress.surfaced,
    },
  ];
  const items = isPhaseTwo ? phaseTwoItems : phaseOneItems;

  return (
    <ActLayout
      step="Investigation"
      title={
        isPhaseTwo
          ? "Open context where the line lives"
          : "Chasing an ID scatters the investigation across tabs"
      }
      lead={
        isPhaseTwo
          ? "The rows around the line expand inline, dimmed so the matching lines stay bright. The filter doesn’t reset. The position doesn’t reset."
          : "Filter to the failing request and the picture narrows. But click a line for context and a new tab opens — no filter, no live tail, just a slice."
      }
      aside={
        <GuideBox
          title="Your investigation"
          items={items}
          onAnnounce={announce}
          onReset={onReset}
          action={
            isPhaseTwo
              ? { label: "Call the root cause", onClick: onCallRootCause }
              : {
                  label: (
                    <>
                      There’s a better way
                      <ArrowRight size={16} aria-hidden="true" />
                    </>
                  ),
                  onClick: cut,
                }
          }
        />
      }
    >
      {isPhaseTwo ? (
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
              <ContextPane lines={lines} anchorId={tab.id} />
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
}: {
  lines: readonly LogLine[];
  anchorId: string;
}) {
  const index = lines.findIndex((l) => l.id === anchorId);
  const slice =
    index === -1
      ? []
      : lines.slice(
          Math.max(0, index - DEFAULT_CONTEXT_RANGE),
          index + DEFAULT_CONTEXT_RANGE + 1,
        );

  return (
    <div className={styles.pane}>
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

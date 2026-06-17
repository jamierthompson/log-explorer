"use client";

import { ArrowRight } from "lucide-react";
import { useCallback } from "react";

import {
  filterFromScenarioIds,
  LogExplorer,
  type LogExplorerSnapshot,
  type LogLine,
} from "@/demo";

import { ActLayout } from "../act-layout/act-layout";
import { useDemoAnnounce } from "../demo-shell";
import { useDemoState } from "../demo-state";
import { GuideBox, type GuideItem } from "../guide-box/guide-box";
import { ACT_CONTENT } from "./act-content";
import { ScatterView } from "./scatter-view";

/**
 * The demo's single investigation, staged in two acts against one shared
 * store. In act one the explorer delegates context out, so opening a line
 * spawns a browser-style tab and the work scatters; the cut clears those
 * tabs and switches the same explorer to act two — expanding context where
 * the line lives. The checklist and filter persist across the cut and reset
 * as one.
 */
export function Investigation({
  lines,
  onCallRootCause,
  onReset,
}: {
  lines: readonly LogLine[];
  /** Opens the root-cause call — act two's closing action. */
  onCallRootCause: () => void;
  /** Resets the whole investigation in place — the guide's control. */
  onReset: () => void;
}) {
  const { state, setScenarios, markFiltered, setContexts, observe, cut } =
    useDemoState();
  const announce = useDemoAnnounce();

  const { act, scenarioIds, everFiltered, openContexts, progress } = state;
  const isActTwo = act === "act-two";

  // The shared snapshot reporter for both acts: it latches the filter and
  // the explorer-driven checklist steps. Context only opens in place, so it's
  // persisted (and the steps observed) in act two alone.
  const handleState = useCallback(
    (snapshot: LogExplorerSnapshot) => {
      if (snapshot.hasFilter) markFiltered();
      setScenarios(snapshot.activeScenarioIds);
      if (isActTwo) setContexts(snapshot.openContexts);

      observe({
        traced: snapshot.activeScenarioIds.includes("trace"),
        examined: isActTwo && snapshot.openContexts.length > 0,
        stacked: isActTwo && snapshot.openContexts.length >= 2,
        surfaced: isActTwo && snapshot.hasExpandedContext,
      });
    },
    [isActTwo, markFiltered, setScenarios, setContexts, observe],
  );

  const content = ACT_CONTENT[act];

  // The steps are content; their done-ness is the live reading, keyed by id.
  // Act one's milestones latch from tab opens, act two's from explorer
  // snapshots — both sticky in the store.
  const doneById: Record<string, boolean> = isActTwo
    ? {
        inplace: progress.examined,
        stack: progress.stacked,
        upstream: progress.surfaced,
      }
    : { filter: everFiltered, open: progress.opened, pile: progress.piled };

  const items: readonly GuideItem[] = content.steps.map((step) => ({
    ...step,
    done: doneById[step.id] ?? false,
  }));

  return (
    <ActLayout
      step={content.badge}
      kicker={content.kicker}
      title={content.title}
      lead={content.lead}
      aside={
        <GuideBox
          title="The method"
          items={items}
          onAnnounce={announce}
          onReset={onReset}
          action={
            isActTwo
              ? { label: content.actionLabel, onClick: onCallRootCause }
              : {
                  label: (
                    <>
                      {content.actionLabel}
                      <ArrowRight size={16} aria-hidden="true" />
                    </>
                  ),
                  onClick: cut,
                }
          }
        />
      }
    >
      {isActTwo ? (
        <LogExplorer
          lines={lines}
          service="api-gateway"
          initialFilter={filterFromScenarioIds(scenarioIds)}
          initialContexts={openContexts}
          onStateChange={handleState}
        />
      ) : (
        <ScatterView lines={lines} onState={handleState} />
      )}
    </ActLayout>
  );
}

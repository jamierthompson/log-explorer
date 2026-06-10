"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { ArrowRight, X } from "lucide-react";
import { useCallback, useState } from "react";

import {
  formatLogTime,
  LogExplorer,
  type LogExplorerSnapshot,
  LogRow,
  type LogLine,
} from "@/demo";

import { ScrollArea } from "@/site/ui/scroll-area/scroll-area";

import { ActLayout } from "../act-layout/act-layout";
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
 */
export function ActOne({
  lines,
  onAdvance,
  onAnnounce,
}: {
  lines: readonly LogLine[];
  onAdvance: () => void;
  onAnnounce?: (message: string) => void;
}) {
  const [tabs, setTabs] = useState<readonly ContextTab[]>([]);
  const [active, setActive] = useState<string>(LIVE);
  // Sticky: once the visitor has filtered, the step stays checked even if
  // they later clear it — the guide tracks progress, not current state.
  const [everFiltered, setEverFiltered] = useState(false);

  const handleState = useCallback((snapshot: LogExplorerSnapshot) => {
    if (snapshot.hasFilter) setEverFiltered(true);
  }, []);

  const openContext = useCallback(
    (lineId: string) => {
      setTabs((current) => {
        if (current.some((t) => t.id === lineId)) return current;
        const line = lines.find((l) => l.id === lineId);
        return line ? [...current, { id: lineId, line }] : current;
      });
      setActive(lineId);
    },
    [lines],
  );

  const closeTab = useCallback((lineId: string) => {
    setTabs((current) => current.filter((t) => t.id !== lineId));
    setActive((current) => (current === lineId ? LIVE : current));
  }, []);

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
          onAnnounce={onAnnounce}
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
                value={LIVE}
                className={`${styles.tab} ${styles.tabLive}`}
              >
                Live tail
              </Tabs.Trigger>

              {tabs.map((tab) => (
                <span key={tab.id} className={styles.tab}>
                  <Tabs.Trigger value={tab.id} className={styles.tabTrigger}>
                    {formatLogTime(tab.line.timestamp)}
                  </Tabs.Trigger>
                  <button
                    type="button"
                    className={styles.tabClose}
                    aria-label={`Close the ${formatLogTime(tab.line.timestamp)} slice`}
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

        <Tabs.Content value={LIVE} className={styles.panel} forceMount>
          <LogExplorer
            lines={lines}
            service="api-gateway"
            showLegend={false}
            onViewContext={openContext}
            onStateChange={handleState}
          />
        </Tabs.Content>

        {tabs.map((tab) => (
          <Tabs.Content key={tab.id} value={tab.id} className={styles.panel}>
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
      <ScrollArea>
        <ul className={styles.paneList}>
          {slice.map((line) => (
            <li
              key={line.id}
              className={styles.paneRow}
              data-anchor={line.id === anchorId || undefined}
            >
              <LogRow line={line} />
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}

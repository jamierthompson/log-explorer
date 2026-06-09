"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { ArrowRight, ChevronRight, X } from "lucide-react";
import { useCallback, useState } from "react";

import {
  formatLogTime,
  LogExplorer,
  type LogExplorerSnapshot,
  LogRow,
  type LogLine,
} from "@/demo";
import { Button } from "@/site/ui/button/button";

import { ActLayout } from "../act-layout/act-layout";
import { GuideBox, type GuideItem } from "../guide-box/guide-box";
import styles from "./act-one.module.css";

function guideNote(tabCount: number): string {
  if (tabCount >= 3) {
    return `${tabCount} tabs open — you're rebuilding the timeline by flipping between them.`;
  }
  if (tabCount >= 1) {
    return "Every view buys one slice and costs you your place — that's the fan of tabs.";
  }
  return "Filter to the failing request, then open a line and watch where the context lands.";
}

/* Lines of unfiltered context a tab shows on each side of its anchor —
 * enough to read around the line, small enough to feel like a scrap torn
 * out of the stream. */
const PANE_RANGE = 14;

const LIVE = "live";

type ContextTab = { readonly id: string; readonly line: LogLine };

const tabLabel = (line: LogLine) =>
  `${formatLogTime(line.timestamp)} · @${line.instance}`;

/* The pane's note escalates with the open-tab count, so the scatter is
 * felt rather than just stated, and points back to the live tail. */
function paneNote(tabCount: number): string {
  if (tabCount >= 3) {
    return `${tabCount} tabs open — the investigation’s scattered across them. Live tail still holds your filter.`;
  }
  if (tabCount === 2) {
    return "Two tabs now — flip back to Live tail to pick up where you were.";
  }
  return "New tab — your filter didn’t come with you.";
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
}: {
  lines: readonly LogLine[];
  onAdvance: () => void;
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
      title: "Filter to the failing request",
      description: "Pick a chip to narrow the live tail to one request.",
      done: everFiltered,
    },
    {
      id: "open",
      title: "Open a line for context",
      description: "Click a matching line to see what surrounded it.",
      done: tabCount >= 1,
    },
    {
      id: "lost",
      title: "Land in a new tab",
      description:
        "The context opens elsewhere — and your filter didn't follow.",
      done: tabCount >= 1,
    },
    {
      id: "pile",
      title: "Watch the tabs pile up",
      description:
        "Every view is one more tab to juggle and lose your place in.",
      done: tabCount >= 2,
    },
  ];
  const allDone = items.every((item) => item.done);

  return (
    <ActLayout
      step="Act 1"
      kicker="The old way"
      title="One failing request, scattered across tabs"
      lead="Filter the live tail to the failing request, then open a line for context — it opens in a new tab that left your filter behind."
      aside={
        <>
          <GuideBox
            title="What's happening"
            items={items}
            action={{
              label: (
                <>
                  There&rsquo;s a better way
                  <ArrowRight size={16} aria-hidden="true" />
                </>
              ),
              onClick: onAdvance,
              // Arm it only once every step is checked — the full scatter felt.
              disabled: !allDone,
            }}
            note={guideNote(tabCount)}
          />
          {!allDone && (
            <Button variant="link" className={styles.skip} onClick={onAdvance}>
              Skip ahead
              <ChevronRight size={14} aria-hidden="true" />
            </Button>
          )}
        </>
      }
    >
      <Tabs.Root
        className={styles.stage}
        value={active}
        onValueChange={setActive}
      >
        <Tabs.List className={styles.tabstrip} aria-label="Open views">
          <Tabs.Trigger value={LIVE} className={styles.tab}>
            Live tail
          </Tabs.Trigger>

          {tabs.map((tab) => (
            <span key={tab.id} className={styles.tabWrap}>
              <Tabs.Trigger value={tab.id} className={styles.tab}>
                {tabLabel(tab.line)}
              </Tabs.Trigger>
              <button
                type="button"
                className={styles.tabClose}
                aria-label={`Close ${tabLabel(tab.line)}`}
                onClick={() => closeTab(tab.id)}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </span>
          ))}

          {tabs.length > 0 && (
            <span className={styles.tabCount}>
              {tabs.length} tab{tabs.length === 1 ? "" : "s"} open
            </span>
          )}
        </Tabs.List>

        <Tabs.Content value={LIVE} className={styles.panel} forceMount>
          <LogExplorer
            lines={lines}
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
    </div>
  );
}

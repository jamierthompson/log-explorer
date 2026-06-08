"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useCallback, useState } from "react";

import { LogExplorer, LogRow, type LogLine } from "@/demo";
import { Button } from "@/site/ui/button/button";

import styles from "./act-one.module.css";

/* Lines of unfiltered context a tab shows on each side of its anchor —
 * enough to read around the line, small enough to feel like a scrap torn
 * out of the stream. */
const PANE_RANGE = 14;

const LIVE = "live";

type ContextTab = { readonly id: string; readonly line: LogLine };

/**
 * Act 1 — the old way. The explorer runs with context delegated out
 * (onViewContext), so opening a line's context spawns a browser-style tab
 * here instead of expanding in place. The live tail's panel is force-
 * mounted, so it stays filtered behind the tabs and returning to it keeps
 * the visitor's place.
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

  return (
    <Tabs.Root className={styles.act} value={active} onValueChange={setActive}>
      <Tabs.List className={styles.tabstrip} aria-label="Open views">
        <Tabs.Trigger value={LIVE} className={styles.tab}>
          Live tail
        </Tabs.Trigger>

        {tabs.map((tab) => (
          <span key={tab.id} className={styles.tabWrap}>
            <Tabs.Trigger value={tab.id} className={styles.tab}>
              {tab.line.message}
            </Tabs.Trigger>
            <button
              type="button"
              className={styles.tabClose}
              aria-label={`Close “${tab.line.message}”`}
              onClick={() => closeTab(tab.id)}
            >
              ✕
            </button>
          </span>
        ))}

        <div className={styles.tabstripEnd}>
          {tabs.length > 0 && (
            <span className={styles.tabCount}>
              {tabs.length} tab{tabs.length === 1 ? "" : "s"} open
            </span>
          )}
          <Button variant="primary" onClick={onAdvance}>
            Continue →
          </Button>
        </div>
      </Tabs.List>

      <Tabs.Content value={LIVE} className={styles.panel} forceMount>
        <LogExplorer
          lines={lines}
          showLegend={false}
          onViewContext={openContext}
        />
      </Tabs.Content>

      {tabs.map((tab) => (
        <Tabs.Content key={tab.id} value={tab.id} className={styles.panel}>
          <ContextPane lines={lines} anchorId={tab.id} />
        </Tabs.Content>
      ))}
    </Tabs.Root>
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
      : lines.slice(Math.max(0, index - PANE_RANGE), index + PANE_RANGE + 1);

  return (
    <div className={styles.pane}>
      <p className={styles.paneNote}>
        New tab — your filter didn’t come with you.
      </p>
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

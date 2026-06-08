"use client";

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
 * here instead of expanding in place. The live tail stays mounted and
 * filtered behind the tabs, so returning to it keeps the visitor's place.
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
    <div className={styles.act}>
      <div className={styles.tabstrip}>
        <button
          type="button"
          className={styles.tab}
          aria-pressed={active === LIVE}
          data-active={active === LIVE || undefined}
          onClick={() => setActive(LIVE)}
        >
          Live tail
        </button>

        {tabs.map((tab) => (
          <span
            key={tab.id}
            className={styles.tab}
            data-active={active === tab.id || undefined}
          >
            <button
              type="button"
              className={styles.tabLabel}
              aria-pressed={active === tab.id}
              onClick={() => setActive(tab.id)}
            >
              {tab.line.message}
            </button>
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
      </div>

      <div className={styles.content}>
        <div
          className={styles.explorer}
          data-hidden={active !== LIVE || undefined}
        >
          <LogExplorer
            lines={lines}
            showLegend={false}
            onViewContext={openContext}
          />
        </div>
        {active !== LIVE && <ContextPane lines={lines} anchorId={active} />}
      </div>
    </div>
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

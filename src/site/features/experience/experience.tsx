"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { type LogLine } from "@/demo";

import { scrollAppViewportToTop } from "@/site/ui/scroll-area/app-scroll";

import { ActOne } from "./act-one/act-one";
import { ActTwo } from "./act-two/act-two";
import styles from "./experience.module.css";
import { useActs } from "./use-acts";

/**
 * The guided demo experience. Sequences the two acts and lets the browser
 * back button step between them; each act owns its own narration, guide,
 * and stage. Act 1 is the old way (context scattered into tabs); Act 2 is
 * the method (context in place, ending in the root-cause call).
 *
 * Both acts stay mounted and the inactive one is hidden, so navigating
 * between them preserves each act's progress — filters, open views, guide
 * state, and the explorer's own internal state all survive the round trip.
 * Replay is the one deliberate reset: bumping the run key remounts both
 * acts fresh, and reset returns to Act 1.
 */
export function Experience({
  lines,
  onReadStory,
}: {
  lines: readonly LogLine[];
  onReadStory?: () => void;
}) {
  const { act, advance, reset } = useActs();
  const [runId, setRunId] = useState(0);
  const act1Ref = useRef<HTMLDivElement>(null);
  const act2Ref = useRef<HTMLDivElement>(null);

  /*
   * Each act enters from its top. On narrow viewports the advance and
   * replay controls sit below the stage, so without this the next act
   * would open scrolled to wherever the button was. Before paint, so
   * the old position never flashes.
   */
  useLayoutEffect(() => {
    scrollAppViewportToTop();
  }, [act]);

  /*
   * An act transition hides the container holding the focused control,
   * and replay remounts both acts — either way focus would drop to the
   * body. Land it on the entering act's container instead. A passive
   * effect, because the dialog primitive restores focus in its own
   * passive cleanup when replay unmounts it; cleanups run first, so
   * this focus wins. Skipping the first run keeps the initial page
   * load from grabbing focus.
   */
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const entering = act === "act1" ? act1Ref.current : act2Ref.current;
    entering?.focus({ preventScroll: true });
  }, [act, runId]);

  /*
   * The experience's one polite live region. Guide steps and the
   * root-cause verdict funnel their announcements here; last write wins,
   * which is enough for a checklist that completes one step at a time.
   */
  const [announcement, setAnnouncement] = useState("");
  const announce = useCallback((message: string) => {
    setAnnouncement(message);
  }, []);

  const replay = useCallback(() => {
    setRunId((n) => n + 1);
    reset();
    // A fresh run starts silent; a stale "Root cause found" would lie.
    setAnnouncement("");
  }, [reset]);

  return (
    <div className={styles.experience}>
      <div role="status" className={styles.srOnly}>
        {announcement}
      </div>
      <div
        ref={act1Ref}
        tabIndex={-1}
        className={styles.act}
        hidden={act !== "act1"}
      >
        <ActOne
          key={runId}
          lines={lines}
          onAdvance={advance}
          onAnnounce={announce}
        />
      </div>
      <div
        ref={act2Ref}
        tabIndex={-1}
        className={styles.act}
        hidden={act !== "act2"}
      >
        <ActTwo
          key={runId}
          lines={lines}
          onReplay={replay}
          onReadStory={onReadStory}
          onAnnounce={announce}
        />
      </div>
    </div>
  );
}

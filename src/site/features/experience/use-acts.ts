"use client";

import { useCallback, useEffect, useState } from "react";

export type Act = "act1" | "act2";

function actFromState(state: unknown): Act {
  return (state as { act?: string } | null)?.act === "act2" ? "act2" : "act1";
}

/**
 * Sequences the guided experience. Advancing to Act 2 pushes a history
 * entry, so the browser back button returns to Act 1 (and forward restores
 * Act 2) within a session. A fresh page load always starts on Act 1: the
 * act is held in local state seeded to Act 1, and any stale act marker the
 * browser preserved across the reload is cleared, so a reload can't drop
 * the visitor mid-experience.
 */
export function useActs(): {
  act: Act;
  advance: () => void;
  reset: () => void;
} {
  const [act, setAct] = useState<Act>("act1");

  /*
   * Invariant for every history write in this hook: start from the
   * entry's existing state (spread, never a fresh object) and only add
   * or remove the act marker. Other parties — the framework router and
   * the hash router — keep their own keys in history.state, and a write
   * that drops them breaks their navigation bookkeeping.
   */
  const clearMarker = useCallback(() => {
    if (actFromState(window.history.state) !== "act1") {
      const state = { ...(window.history.state as object | null) };
      delete (state as { act?: string }).act;
      window.history.replaceState(state, "", window.location.href);
    }
  }, []);

  useEffect(() => {
    // Clear a marker carried over from a reload so this load — and any
    // later forward navigation — can't resurrect a prior Act 2.
    clearMarker();
  }, [clearMarker]);

  useEffect(() => {
    // Within a session, honor browser back/forward between the acts.
    const onPop = () => setAct(actFromState(window.history.state));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const advance = useCallback(() => {
    const state = { ...(window.history.state ?? {}), act: "act2" };
    window.history.pushState(state, "", window.location.href);
    setAct("act2");
  }, []);

  // Return to Act 1 deliberately (replay), dropping the act marker so
  // forward navigation can't jump back into Act 2.
  const reset = useCallback(() => {
    clearMarker();
    setAct("act1");
  }, [clearMarker]);

  return { act, advance, reset };
}

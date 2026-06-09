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
export function useActs(): { act: Act; advance: () => void } {
  const [act, setAct] = useState<Act>("act1");

  useEffect(() => {
    // Clear a marker carried over from a reload so this load — and any
    // later forward navigation — can't resurrect a prior Act 2.
    if (actFromState(window.history.state) !== "act1") {
      const state = { ...(window.history.state as object | null) };
      delete (state as { act?: string }).act;
      window.history.replaceState(state, "", window.location.href);
    }
  }, []);

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

  return { act, advance };
}

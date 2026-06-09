"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Act = "act1" | "act2";

/*
 * pushState fires neither popstate nor hashchange, so advancing announces
 * itself with this event to keep the store in sync — mirroring how the
 * view router signals its own pushState navigations.
 */
const ACT_EVENT = "experience:actchange";

function actFromState(state: unknown): Act {
  return (state as { act?: string } | null)?.act === "act2" ? "act2" : "act1";
}

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener(ACT_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener(ACT_EVENT, onStoreChange);
  };
}

/**
 * Sequences the guided experience. The act lives in history state, so
 * advancing to Act 2 pushes an entry the browser back button can return
 * from — landing back on Act 1 without leaving the demo view. The act is
 * derived via useSyncExternalStore so back/forward stay authoritative.
 */
export function useActs(): { act: Act; advance: () => void } {
  const act = useSyncExternalStore<Act>(
    subscribe,
    () => actFromState(window.history.state),
    () => "act1",
  );

  const advance = useCallback(() => {
    const state = { ...(window.history.state ?? {}), act: "act2" };
    window.history.pushState(state, "", window.location.href);
    window.dispatchEvent(new Event(ACT_EVENT));
  }, []);

  return { act, advance };
}

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useActs } from "@/site/features/experience/use-acts";

afterEach(() => {
  // Reset history between tests so entries don't leak across cases.
  window.history.replaceState(null, "", window.location.pathname);
});

describe("useActs", () => {
  it("starts on Act 1", () => {
    const { result } = renderHook(() => useActs());
    expect(result.current.act).toBe("act1");
  });

  it("advances to Act 2", () => {
    const { result } = renderHook(() => useActs());
    act(() => result.current.advance());
    expect(result.current.act).toBe("act2");
  });

  it("adds a history entry to advance, so there is something to go back to", () => {
    const { result } = renderHook(() => useActs());
    const before = window.history.length;
    act(() => result.current.advance());
    expect(window.history.length).toBe(before + 1);
  });

  it("returns to Act 1 when the browser pops back to the prior entry", () => {
    const { result } = renderHook(() => useActs());
    act(() => result.current.advance());
    expect(result.current.act).toBe("act2");

    // jsdom doesn't restore state on history.back(), so model the pop the
    // browser would perform: the prior entry carried no act marker.
    act(() => {
      window.history.replaceState(null, "", window.location.href);
      window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
    });
    expect(result.current.act).toBe("act1");
  });

  it("resets to Act 1 and clears the marker on replay", () => {
    const { result } = renderHook(() => useActs());
    act(() => result.current.advance());
    expect(result.current.act).toBe("act2");

    act(() => result.current.reset());
    expect(result.current.act).toBe("act1");
    expect(
      (window.history.state as { act?: string } | null)?.act,
    ).toBeUndefined();
  });

  it("starts on Act 1 on a reload that carried an Act 2 marker, and clears it", () => {
    // A reload preserves history state, so model landing with act: act2.
    window.history.replaceState({ act: "act2" }, "", window.location.href);

    const { result } = renderHook(() => useActs());

    expect(result.current.act).toBe("act1");
    // The stale marker is wiped so forward nav can't resurrect Act 2.
    expect(
      (window.history.state as { act?: string } | null)?.act,
    ).toBeUndefined();
  });
});

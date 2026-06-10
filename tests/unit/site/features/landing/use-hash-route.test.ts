import { renderHook, act } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  useHashRoute,
  viewFromHash,
} from "@/site/features/landing/use-hash-route";

describe("useHashRoute", () => {
  afterEach(() => {
    window.history.replaceState(null, "", window.location.pathname);
    document
      .querySelectorAll("[data-app-scroll-viewport]")
      .forEach((el) => el.remove());
  });

  it("resets the app scroll viewport when navigating to a view", () => {
    const viewport = document.createElement("div");
    viewport.setAttribute("data-app-scroll-viewport", "");
    document.body.appendChild(viewport);
    viewport.scrollTop = 480;

    const { result } = renderHook(() => useHashRoute());
    act(() => result.current.navigate("story"));

    expect(result.current.view).toBe("story");
    expect(viewport.scrollTop).toBe(0);
  });
});

describe("viewFromHash", () => {
  it("maps #demo to the demo view", () => {
    expect(viewFromHash("#demo")).toBe("demo");
  });

  it("maps #story to the story view", () => {
    expect(viewFromHash("#story")).toBe("story");
  });

  it("defaults a bare hash to the hero", () => {
    expect(viewFromHash("")).toBe("hero");
  });

  it("falls back to the hero for an unknown hash", () => {
    expect(viewFromHash("#whatever")).toBe("hero");
  });
});

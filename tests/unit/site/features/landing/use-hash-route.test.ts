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

  it("titles the document for the hero on load", () => {
    renderHook(() => useHashRoute());
    expect(document.title).toBe(
      "Log Explorer — an incident, investigated in place",
    );
  });

  it("titles the document for the demo view", () => {
    const { result } = renderHook(() => useHashRoute());
    act(() => result.current.navigate("demo"));
    expect(document.title).toBe("Demo — Log Explorer");
  });

  it("titles the document for the story view", () => {
    const { result } = renderHook(() => useHashRoute());
    act(() => result.current.navigate("story"));
    expect(document.title).toBe("Story — Log Explorer");
  });

  it("restores the base title when returning to the hero", () => {
    window.history.replaceState(null, "", "#story");
    const { result } = renderHook(() => useHashRoute());
    act(() => result.current.navigate("hero"));
    expect(document.title).toBe(
      "Log Explorer — an incident, investigated in place",
    );
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

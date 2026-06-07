import { describe, expect, it } from "vitest";

import { routeFromHash } from "@/components/features/landing/use-hash-route";

describe("routeFromHash", () => {
  it("maps #demo to the demo overlay route", () => {
    expect(routeFromHash("#demo")).toBe("demo");
  });

  it("maps #story to the story view", () => {
    expect(routeFromHash("#story")).toBe("story");
  });

  it("defaults a bare hash to the hero", () => {
    expect(routeFromHash("")).toBe("hero");
  });

  it("falls back to the hero for an unknown hash", () => {
    expect(routeFromHash("#whatever")).toBe("hero");
  });
});

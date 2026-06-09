import { describe, expect, it } from "vitest";

import { viewFromHash } from "@/site/features/landing/use-hash-route";

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

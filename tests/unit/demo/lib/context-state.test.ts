import { describe, expect, it } from "vitest";

import {
  CONTEXT_RANGE_STEP,
  DEFAULT_CONTEXT_RANGE,
  isAtFileBoundary,
} from "@/demo/lib/context-state";

describe("context-state", () => {
  it("constants are 20 each", () => {
    expect(DEFAULT_CONTEXT_RANGE).toBe(20);
    expect(CONTEXT_RANGE_STEP).toBe(20);
  });
});

describe("isAtFileBoundary", () => {
  // For a 100-line file with the anchor at index 10, the longer side
  // is 89 lines (indices 11..99).
  it("is false when range is less than the longer side", () => {
    expect(isAtFileBoundary(10, 50, 100)).toBe(false);
  });

  it("is true when range meets the longer side", () => {
    expect(isAtFileBoundary(10, 89, 100)).toBe(true);
  });

  it("is true when range exceeds the longer side", () => {
    expect(isAtFileBoundary(10, 200, 100)).toBe(true);
  });

  it("is true for an out-of-range anchor index", () => {
    expect(isAtFileBoundary(-1, 5, 100)).toBe(true);
    expect(isAtFileBoundary(100, 5, 100)).toBe(true);
  });

  it("treats a middle anchor symmetrically", () => {
    // Anchor at index 50 in a 100-line file: max(50, 49) = 50.
    expect(isAtFileBoundary(50, 49, 100)).toBe(false);
    expect(isAtFileBoundary(50, 50, 100)).toBe(true);
  });
});

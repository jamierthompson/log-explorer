import { describe, expect, it } from "vitest";

import {
  nextStepHint,
  type HintState,
} from "@/site/features/experience/investigation/next-step-hint";

const base: HintState = {
  inPlace: false,
  triaged: false,
  tabCount: 0,
  contextCount: 0,
  expandedUpstream: false,
};

describe("nextStepHint", () => {
  it.each([
    ["before any filter, nudges triage", base, "filter"],
    [
      "filtered with nothing open, nudges opening the first slice",
      { ...base, triaged: true },
      "scatter-open",
    ],
    [
      "one slice open, nudges opening another to feel the scatter",
      { ...base, triaged: true, tabCount: 1 },
      "scatter-more",
    ],
    [
      "two or more slices, nudges taking the cut",
      { ...base, triaged: true, tabCount: 2 },
      "cut",
    ],
    [
      "in place with nothing open, nudges examining context",
      { ...base, inPlace: true },
      "examine",
    ],
    [
      "context open but not grown, nudges looking upstream",
      { ...base, inPlace: true, contextCount: 1 },
      "upstream",
    ],
    [
      "a grown window reached upstream, nudges calling the cause",
      { ...base, inPlace: true, contextCount: 1, expandedUpstream: true },
      "call",
    ],
  ] satisfies [string, HintState, string][])(
    "%s",
    (_label, state, expected) => {
      expect(nextStepHint(state).key).toBe(expected);
    },
  );
});

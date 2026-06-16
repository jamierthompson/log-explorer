import { type ReactNode } from "react";

/**
 * A flattened view of the investigation state — just the facts the hint
 * reads, so the nudge stays a pure function of where the visitor is.
 */
export type HintState = {
  readonly inPlace: boolean;
  readonly triaged: boolean;
  readonly tabCount: number;
  readonly contextCount: number;
  /** A context window grown past its default span — the signal the visitor
   * has reached past the trace, upstream toward the cause. */
  readonly expandedUpstream: boolean;
};

type Hint = { readonly key: string; readonly node: ReactNode };

/**
 * Maps the live investigation state to the single next move worth nudging,
 * always naming a concrete action rather than restating the goal. In the
 * old way it walks open-a-line → feel-the-scatter → take-the-cut; in place
 * it walks open-context → look-upstream → call-it. The key is stable so
 * tests can assert which move is nudged without pinning the prose.
 */
export function nextStepHint(s: HintState): Hint {
  if (!s.inPlace) {
    if (s.tabCount >= 2) {
      return {
        key: "cut",
        node: `${s.tabCount} tabs, ${s.tabCount} half-timelines. Piece it together to bring them into one view.`,
      };
    }
    if (s.tabCount === 1) {
      return {
        key: "scatter-more",
        node: "Your filter didn’t follow into the tab. Back on the live tail, open another line — it keeps scattering.",
      };
    }
    if (s.triaged) {
      return {
        key: "scatter-open",
        node: "Open a line for context — and watch the filter not come with it.",
      };
    }
    return {
      key: "filter",
      node: "Filter to errors first — see what’s actually failing.",
    };
  }
  if (s.contextCount === 0) {
    return {
      key: "examine",
      node: "The trace showed where checkout broke. Open context on it to see why.",
    };
  }
  if (!s.expandedUpstream) {
    return {
      key: "upstream",
      node: "The cause sits further up than this window. Expand the context to look upstream.",
    };
  }
  return {
    key: "call",
    node: (
      <>
        Found what changed at <strong>13:24:11</strong>? Call the root cause.
      </>
    ),
  };
}

/**
 * The guide's footer hint: the keyed next-step nudge, reactive to where the
 * investigation actually is. The key rides on the rendered element so the
 * host's checklist narration and tests can read it.
 */
export function NextStepHint(props: HintState) {
  const hint = nextStepHint(props);
  return <span data-guide-hint={hint.key}>{hint.node}</span>;
}

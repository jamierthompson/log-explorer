import { type Phase } from "../demo-state";

/** One checklist step's copy. The view resolves `done` from live
 * investigation state, keyed by `id` — so this stays pure content. */
export type GuideStepContent = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
};

/** The static copy for one phase of the staged investigation: the heading,
 * lead, forward-action label, and checklist steps. Behavior — the action's
 * onClick and each step's done-ness — is wired by the view. */
export type PhaseContent = {
  readonly title: string;
  readonly lead: string;
  readonly actionLabel: string;
  readonly steps: readonly GuideStepContent[];
};

export const PHASE_CONTENT: Record<Phase, PhaseContent> = {
  "phase-one": {
    title: "Chasing an ID scatters the investigation across tabs",
    lead: "Filter to the failing request and the picture narrows. But click a line for context and a new tab opens — no filter, no live tail, just a slice.",
    actionLabel: "There’s a better way",
    steps: [
      {
        id: "filter",
        title: "Filter the live tail",
        description:
          "Pick a chip to narrow the stream — errors, a request, an instance.",
      },
      {
        id: "open",
        title: "Open a line for context",
        description:
          "Click a matching line — the slice lands in a new tab, and your filtered tail stays put, one tab back.",
      },
      {
        id: "pile",
        title: "Reassemble by hand",
        description:
          "Two tabs, two slices — you’re piecing the timeline back together by switching between them.",
      },
    ],
  },
  "phase-two": {
    title: "Open context where the line lives",
    lead: "The rows around the line expand inline, dimmed so the matching lines stay bright. The filter doesn’t reset. The position doesn’t reset.",
    actionLabel: "Call the root cause",
    steps: [
      {
        id: "inplace",
        title: "Open context in place",
        description:
          "Click a line and its context opens right here, the non-matching lines dimmed.",
      },
      {
        id: "stack",
        title: "Open a second context",
        description:
          "Click another line and a second context opens in the same view.",
      },
      {
        id: "upstream",
        title: "Expand an open context",
        description: "Reach further for the calls before and the calls after.",
      },
    ],
  },
};

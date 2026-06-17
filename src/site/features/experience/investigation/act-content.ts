import { type Act } from "../demo-state";

/** One checklist step's copy. The view resolves `done` from live
 * investigation state, keyed by `id` — so this stays pure content. */
export type GuideStepContent = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
};

/** The static copy for one act of the staged investigation: the badge,
 * the overline kicker, the heading, lead, forward-action label, and
 * checklist steps. Behavior — the action's onClick and each step's
 * done-ness — is wired by the view. */
export type ActContent = {
  readonly badge: string;
  readonly kicker: string;
  readonly title: string;
  readonly lead: string;
  readonly actionLabel: string;
  readonly steps: readonly GuideStepContent[];
};

export const ACT_CONTENT: Record<Act, ActContent> = {
  "act-one": {
    badge: "Act 1",
    kicker: "The old way",
    title: "A tab for every click",
    lead: "Filter the live tail to the failing request, then open a line for context. Every look opens another tab — and the investigation starts to scatter.",
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
          "Two tabs, two slices — you’re holding the timeline together in your head.",
      },
    ],
  },
  "act-two": {
    badge: "Act 2",
    kicker: "In place",
    title: "Open context where the line lives",
    lead: "The same investigation, kept in one view. The trace can show you where checkout broke — opening context in place shows you why.",
    actionLabel: "Call the root cause",
    steps: [
      {
        id: "triage",
        title: "Triage the symptom",
        description: "Filter to errors to see what’s actually failing.",
      },
      {
        id: "trace",
        title: "Trace the failing request",
        description:
          "Follow req=r4d8a2 span by span. It dies waiting on the db pool.",
      },
      {
        id: "inplace",
        title: "Open context in place",
        description:
          "The cause carries no request id — only the lines around the failure can show it. Not there yet? Shift+E widens the window.",
      },
      {
        id: "blast",
        title: "Check the blast radius",
        description:
          "One instance, or all three? Open another context — or narrow to @kc4qn — and see.",
      },
    ],
  },
};

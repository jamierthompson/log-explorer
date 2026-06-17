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
    badge: "01",
    kicker: "The old way",
    title: "A tab for every click",
    lead: "Filter the live tail to the failing request, then open a line for context. Every look opens another tab — and the investigation starts to scatter.",
    actionLabel: "There’s a better way",
    steps: [
      {
        id: "filter",
        title: "Filter the live tail",
        description:
          "Pick a chip to narrow the stream: errors, a request, an instance.",
      },
      {
        id: "open",
        title: "Open a line for context",
        description:
          "Click a matching line. The slice lands in a new tab, and your filtered tail stays put, one tab back.",
      },
      {
        id: "pile",
        title: "Piece it together",
        description:
          "Back on the live tail, open a second line. Two tabs, two slices, and you’re holding the timeline together in your head.",
      },
    ],
  },
  "act-two": {
    badge: "02",
    kicker: "In place",
    title: "Open context where the line lives",
    lead: "The same investigation, kept in one view. The trace can show you where checkout broke — opening context in place shows you why.",
    actionLabel: "Call the root cause",
    steps: [
      {
        id: "triage",
        title: "Triage the symptom",
        description: "Filter to errors. They’re all on one instance, @kc4qn.",
      },
      {
        id: "trace",
        title: "Trace the failing request",
        description: "Follow req=r4d8a2. It dies waiting on the db pool.",
      },
      {
        id: "inplace",
        title: "Open context in place",
        description:
          "Click the failure. The pool’s saturated all around it, but the trigger sits upstream with no request id of its own.",
      },
      {
        id: "stack",
        title: "Open a second context",
        description:
          "Narrow to @kc4qn and open a second context on the reload that shrank the pool.",
      },
    ],
  },
};

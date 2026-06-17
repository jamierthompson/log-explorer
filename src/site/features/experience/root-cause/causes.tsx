import type { ReactNode } from "react";

export type Cause = {
  readonly id: string;
  readonly name: string;
  readonly detail: string;
  /** Verdict prose, one entry per paragraph; at least one. */
  readonly outcome: readonly [ReactNode, ...ReactNode[]];
};

/** The single cause that closes the case; every other choice is a near
 * miss with its own nudge. Kept as one id so "exactly one right answer"
 * lives in a single place rather than a flag scattered across the data. */
export const CORRECT_CAUSE_ID = "pool";

export const CAUSES: readonly Cause[] = [
  {
    id: "db-down",
    name: "The database is down",
    detail: "Postgres fell over and every instance is failing.",
    outcome: [
      "A fair guess, but two of the three instances served 200s the whole time, and a downed database couldn’t have spared them.",
    ],
  },
  {
    id: "payload",
    name: "A malformed checkout payload",
    detail: "Bad client input crashed the request.",
    outcome: [
      "Close, but the request timed out waiting on a DB connection before any validation ran. Malformed input wouldn’t look like that.",
    ],
  },
  {
    id: CORRECT_CAUSE_ID,
    name: "A config reload shrank @kc4qn’s DB pool",
    detail: "db.pool.max dropped 20 → 5, starving connections.",
    outcome: [
      "That’s it. At 13:24:11 a hot-reload dropped db.pool.max from 20 to 5 on @kc4qn alone. The pool saturated over the next few minutes, and every request that touched it timed out waiting for a connection. It carried no request id and sat minutes upstream, so the trace could never surface it.",
      <>
        Opening a second context where the reload lived, right beside the
        failure, brought cause and symptom into one view, no tab away.{" "}
        <em>
          The cause was never in the trace; it sat upstream, where only context
          could reach it.
        </em>
      </>,
    ],
  },
];

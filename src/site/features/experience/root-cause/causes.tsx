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
      "Two of the three instances kept serving 200s the whole time. A downed database wouldn’t spare them.",
    ],
  },
  {
    id: "payload",
    name: "A malformed checkout payload",
    detail: "Bad client input crashed the request.",
    outcome: [
      "The request timed out waiting on a DB connection, before any validation ran. Bad input wouldn’t look like that.",
    ],
  },
  {
    id: CORRECT_CAUSE_ID,
    name: "A config reload shrank @kc4qn’s DB pool",
    detail: "db.pool.max dropped 20 → 5, starving connections.",
    outcome: [
      "At 13:24:11 a hot-reload set db.pool.max from 20 to 5 on @kc4qn alone. Over the next several minutes the pool saturated, and every request that touched it — r4d8a2 and the add-to-cart on k9b3c7 — timed out waiting for a connection. The reload carried no request id, and it sat minutes upstream of the failures, so the trace could never show it.",
      <>
        Opening context in place, with your filter intact, put it a scroll away
        from the failure instead of a tab away.{" "}
        <em>
          The cause was never in the trace; it was in the lines around it.
        </em>
      </>,
    ],
  },
];

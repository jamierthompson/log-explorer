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
      "Worth another look — @m7w3p and @t2x8r kept serving 200s through the whole incident, and checkout itself succeeded on @m7w3p at 13:31:55. A database that was truly down wouldn’t spare two of three instances.",
    ],
  },
  {
    id: "payload",
    name: "A malformed checkout payload",
    detail: "Bad client input crashed the request.",
    outcome: [
      "Follow the trace once more: the request was accepted, then sat waiting on a database connection until it timed out — it never even reached validation. And the same instance failed an unrelated add-to-cart the same way; bad input doesn’t spread between requests.",
    ],
  },
  {
    id: CORRECT_CAUSE_ID,
    name: "A config reload shrank @kc4qn’s DB pool",
    detail: "db.pool.max dropped 20 → 5, starving connections.",
    outcome: [
      "At 13:30:11 a hot-reload set db.pool.max from 20 to 5 on @kc4qn alone. Within a minute the pool was saturated, and every request that touched the pool — r4d8a2 included — timed out waiting for a connection. The reload carried no request id, so the trace could never show it.",
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

export type Cause = {
  readonly id: string;
  readonly name: string;
  readonly detail: string;
  /** The verdict's opening clause. */
  readonly lead: string;
  /** The muted remainder of the verdict. */
  readonly rest: string;
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
    lead: "Two instances served 200s throughout.",
    rest: "A downed database couldn’t have spared them.",
  },
  {
    id: "payload",
    name: "A malformed checkout payload",
    detail: "Bad client input crashed the request.",
    lead: "It timed out waiting on a DB connection.",
    rest: "That’s before any validation ran, so malformed input isn’t the culprit.",
  },
  {
    id: CORRECT_CAUSE_ID,
    name: "A config reload shrank @kc4qn’s DB pool",
    detail: "db.pool.max dropped 20 → 5, starving connections.",
    lead: "A config reload shrank the pool.",
    rest: "No request id, minutes upstream of the failure — the trace couldn’t reach it, but a second context could.",
  },
];

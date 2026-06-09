import type { Level, LogLine } from "@/demo/types/log";

const ANCHOR = new Date("2026-05-11T13:00:00Z").getTime();
const t = (min: number, sec: number): number =>
  ANCHOR + min * 60_000 + sec * 1_000;

const INSTANCES = ["kc4qn", "m7w3p", "t2x8r"] as const;
type InstanceId = (typeof INSTANCES)[number];

type RequestId = "r4d8a2" | "k9b3c7" | "p2x6n1";

type PartialLogLine = Omit<LogLine, "id">;

const make = (
  level: Level,
  min: number,
  sec: number,
  instance: InstanceId,
  message: string,
  requestId?: RequestId,
): PartialLogLine => ({
  timestamp: t(min, sec),
  instance,
  level,
  message,
  ...(requestId ? { requestId } : {}),
});

const info: (
  min: number,
  sec: number,
  instance: InstanceId,
  message: string,
  requestId?: RequestId,
) => PartialLogLine = (min, sec, inst, msg, req) =>
  make("INFO", min, sec, inst, msg, req);
const warn: typeof info = (min, sec, inst, msg, req) =>
  make("WARN", min, sec, inst, msg, req);
const err: typeof info = (min, sec, inst, msg, req) =>
  make("ERROR", min, sec, inst, msg, req);
const dbg: typeof info = (min, sec, inst, msg, req) =>
  make("DEBUG", min, sec, inst, msg, req);

/*
 * The incident every surface of the demo cites: a config hot-reload
 * shrinks one instance's DB pool, the pool saturates, and a checkout
 * request times out against it until the reverse reload recovers
 * traffic. The cause line deliberately carries no request id — a trace
 * filter can never surface it, which is the prototype's whole argument
 * for opening context in place.
 *
 * Invariants the rest of the demo leans on:
 * - ERROR is reserved for the incident, so the errors-only filter
 *   reads as pure signal.
 * - req=r4d8a2 exists only inside the incident, so its trace is a
 *   clean, short story that ends at the timeout — without the cause.
 * - The two healthy instances keep serving 200s throughout, which the
 *   root-cause verdicts rely on to rule out a global outage.
 */
const STORY: readonly PartialLogLine[] = [
  // Boot
  info(0, 2, "kc4qn", "Server listening on port 3000"),
  info(0, 5, "m7w3p", "Server listening on port 3000"),
  info(0, 8, "t2x8r", "Server listening on port 3000"),

  // Calm baseline: two browsing sessions hop across the fleet
  info(2, 14, "kc4qn", "GET /api/health → 200 in 3ms", "p2x6n1"),
  info(5, 41, "m7w3p", "GET /api/products → 200 in 22ms", "k9b3c7"),
  info(8, 30, "t2x8r", "GET /api/cart → 200 in 12ms", "p2x6n1"),
  info(11, 9, "kc4qn", "POST /api/cart/items → 201 in 18ms", "k9b3c7"),
  dbg(14, 52, "m7w3p", "Cache warm complete: catalog (8041 keys)"),
  info(18, 3, "t2x8r", "GET /api/cart → 200 in 9ms", "p2x6n1"),
  info(21, 36, "kc4qn", "GET /api/products/42 → 200 in 15ms", "k9b3c7"),
  warn(24, 10, "m7w3p", "Upstream latency p99 218ms (inventory-svc)"),
  info(26, 48, "t2x8r", "GET /api/cart → 200 in 11ms", "p2x6n1"),
  info(28, 22, "kc4qn", "GET /api/products → 200 in 16ms", "k9b3c7"),
  dbg(29, 50, "m7w3p", "Healthcheck ok — 3/3 instances ready"),

  // The cause: a hot-reload starves one instance's pool. No request id.
  warn(30, 11, "kc4qn", "Config hot-reload applied: db.pool.max 20 → 5"),

  info(30, 40, "t2x8r", "GET /api/cart → 200 in 10ms", "p2x6n1"),
  dbg(31, 2, "kc4qn", "db pool: 5/5 in use, 3 waiting", "k9b3c7"),
  warn(31, 18, "kc4qn", "db pool wait 1900ms", "k9b3c7"),

  // The failing checkout, span by span
  info(31, 40, "kc4qn", "POST /api/checkout received", "r4d8a2"),
  dbg(31, 41, "kc4qn", "Acquiring db connection (pool 5/5 in use)", "r4d8a2"),
  warn(31, 46, "kc4qn", "db pool wait 4200ms — 0 idle connections", "r4d8a2"),
  info(31, 55, "m7w3p", "POST /api/checkout → 200 in 120ms", "p2x6n1"),
  err(
    31,
    58,
    "kc4qn",
    "checkout failed: db pool timeout after 5000ms",
    "r4d8a2",
  ),
  info(32, 3, "kc4qn", "POST /api/checkout → 503 in 5002ms", "r4d8a2"),
  err(
    32,
    9,
    "kc4qn",
    "add-to-cart failed: db pool timeout after 5000ms",
    "k9b3c7",
  ),
  info(32, 14, "t2x8r", "GET /api/cart → 200 in 12ms", "p2x6n1"),
  dbg(32, 20, "kc4qn", "Retry scheduled for checkout (attempt 2)", "r4d8a2"),
  warn(32, 31, "kc4qn", "db pool wait 4800ms — 0 idle connections", "r4d8a2"),
  err(
    32,
    38,
    "kc4qn",
    "checkout retry failed: db pool timeout after 5000ms",
    "r4d8a2",
  ),
  info(32, 44, "m7w3p", "GET /api/products → 200 in 19ms", "k9b3c7"),
  err(32, 50, "kc4qn", "health: db pool saturated 5/5 — 11 requests queued"),
  info(
    32,
    58,
    "kc4qn",
    "checkout abandoned by client (gateway timeout)",
    "r4d8a2",
  ),

  // Recovery: the reverse reload restores the pool, traffic follows
  warn(33, 6, "kc4qn", "Config hot-reload applied: db.pool.max 5 → 20"),
  info(33, 12, "kc4qn", "POST /api/cart/items → 201 in 17ms", "k9b3c7"),
  info(33, 19, "kc4qn", "POST /api/checkout → 200 in 96ms", "p2x6n1"),
  dbg(33, 25, "m7w3p", "Healthcheck ok — 3/3 instances ready"),
];

const WINDOW_SEC = 35 * 60;

// Bounds of the shrunken-pool window, matching the hot-reload pair in
// the spine above.
const INCIDENT_START_S = 30 * 60 + 11;
const INCIDENT_END_S = 33 * 60 + 6;
const duringIncident = (s: number): boolean =>
  s >= INCIDENT_START_S && s <= INCIDENT_END_S;

const pick = <T>(arr: readonly T[], i: number): T =>
  arr[((i % arr.length) + arr.length) % arr.length];
const min = (s: number): number => Math.floor(s / 60);
const ss = (s: number): number => s % 60;

/*
 * Loop-local rotator: each generator advances its own counter so the
 * three instances appear in even proportion within that pattern,
 * regardless of timing-step quirks. `phase` staggers the starting
 * instance across patterns so each one isn't biased to the same first
 * instance.
 */
function rotator(phase: number) {
  let i = 0;
  return (): InstanceId => pick(INSTANCES, phase + i++);
}

const HEALTHY = ["m7w3p", "t2x8r"] as const;

// DB-touching traffic stays off the saturated instance while its pool
// is shrunken; the healthy-instance 200s the root-cause verdicts cite
// have to hold in the noise too.
const steerOffSaturated = (inst: InstanceId, s: number): InstanceId =>
  inst === "kc4qn" && duringIncident(s) ? pick(HEALTHY, s) : inst;

const GET_ENDPOINTS = [
  "/api/products",
  "/api/cart",
  "/api/sessions",
  "/api/health",
  "/api/products/7",
  "/api/products/18",
] as const;

const QUERY_TARGETS = [
  "SELECT products WHERE category = $1",
  "SELECT carts WHERE session = $1",
  "UPDATE sessions WHERE token = $1",
  "SELECT inventory WHERE sku = $1",
] as const;

const CACHE_KEYS = ["products", "cart", "sessions", "catalog"] as const;

const JOB_NAMES = [
  "session-cleanup",
  "metrics-flush",
  "cache-warm",
  "catalog-sync",
] as const;

const UPSTREAMS = ["inventory-svc", "search-svc"] as const;

/*
 * Procedural ambient traffic — enough texture that filtering visibly
 * collapses a busy feed and a context window contains real surrounding
 * traffic. Deliberately boring: no ERROR families (errors belong to
 * the incident alone), no request ids (the trace belongs to the spine
 * alone), and nothing touches /api/checkout.
 */
function generateNoise(): PartialLogLine[] {
  const noise: PartialLogLine[] = [];

  // ── INFO patterns ──────────────────────────────────────────────

  // Heartbeats — these keep running everywhere, even on the saturated
  // instance: a starved DB pool doesn't stop the process.
  let r = rotator(0);
  for (let s = 18; s < WINDOW_SEC; s += 95 + (s % 11)) {
    noise.push(info(min(s), ss(s), r(), "Heartbeat sent"));
  }

  // Healthchecks
  r = rotator(1);
  for (let s = 24; s < WINDOW_SEC; s += 104 + (s % 9)) {
    noise.push(info(min(s), ss(s), r(), "Healthcheck OK"));
  }

  // Storefront reads
  r = rotator(2);
  for (let s = 36; s < WINDOW_SEC; s += 58 + (s % 13)) {
    const path = pick(GET_ENDPOINTS, s);
    const ms = 8 + (s % 60);
    noise.push(
      info(
        min(s),
        ss(s),
        steerOffSaturated(r(), s),
        `GET ${path} → 200 in ${ms}ms`,
      ),
    );
  }

  // Cart writes
  r = rotator(0);
  for (let s = 130; s < WINDOW_SEC; s += 215 + (s % 17)) {
    const ms = 14 + (s % 30);
    noise.push(
      info(
        min(s),
        ss(s),
        steerOffSaturated(r(), s),
        `POST /api/cart/items → 201 in ${ms}ms`,
      ),
    );
  }

  // DB queries
  r = rotator(1);
  for (let s = 56; s < WINDOW_SEC; s += 150 + (s % 15)) {
    const q = pick(QUERY_TARGETS, s);
    const ms = 4 + (s % 24);
    noise.push(
      info(
        min(s),
        ss(s),
        steerOffSaturated(r(), s),
        `DB query: ${q} (${ms}ms)`,
      ),
    );
  }

  // Cache invalidations
  r = rotator(2);
  for (let s = 89; s < WINDOW_SEC; s += 240 + (s % 19)) {
    const key = pick(CACHE_KEYS, s);
    noise.push(
      info(
        min(s),
        ss(s),
        steerOffSaturated(r(), s),
        `Cache invalidated: ${key}`,
      ),
    );
  }

  // Metrics flushes
  r = rotator(0);
  for (let s = 47; s < WINDOW_SEC; s += 210 + (s % 17)) {
    const n = 18 + (s % 24);
    noise.push(info(min(s), ss(s), r(), `Metrics flushed (count=${n})`));
  }

  // Background jobs
  r = rotator(1);
  for (let s = 71; s < WINDOW_SEC; s += 250 + (s % 19)) {
    const job = pick(JOB_NAMES, s);
    const ms = 30 + (s % 60);
    noise.push(
      info(
        min(s),
        ss(s),
        steerOffSaturated(r(), s),
        `Background job '${job}' completed in ${ms}ms`,
      ),
    );
  }

  // ── DEBUG patterns ─────────────────────────────────────────────

  // GC pauses
  r = rotator(2);
  for (let s = 67; s < WINDOW_SEC; s += 165 + (s % 23)) {
    const ms = 10 + (s % 12);
    noise.push(dbg(min(s), ss(s), r(), `GC paused ${ms}ms`));
  }

  // ── WARN patterns ──────────────────────────────────────────────
  // Rare and routine on purpose, and silent during the incident — the
  // only warnings near the failure should be the ones that explain it.

  // Slow upstream
  r = rotator(0);
  for (let s = 420; s < WINDOW_SEC; s += 620 + (s % 27)) {
    if (duringIncident(s)) continue;
    const upstream = pick(UPSTREAMS, s);
    const ms = 320 + (s % 280);
    noise.push(
      warn(
        min(s),
        ss(s),
        r(),
        `Slow upstream: ${upstream} responded in ${ms}ms`,
      ),
    );
  }

  // Cache miss rate
  r = rotator(1);
  for (let s = 760; s < WINDOW_SEC; s += 690 + (s % 23)) {
    if (duringIncident(s)) continue;
    const ratio = (31 + (s % 6)) / 100;
    noise.push(
      warn(
        min(s),
        ss(s),
        r(),
        `Cache miss rate elevated: ${ratio.toFixed(2)} (expected <0.30)`,
      ),
    );
  }

  return noise;
}

const all: PartialLogLine[] = [...STORY, ...generateNoise()].sort(
  (a, b) => a.timestamp - b.timestamp,
);

export const mockLogs: readonly LogLine[] = all.map((line, i) => ({
  id: `log_${String(i + 1).padStart(4, "0")}`,
  ...line,
}));

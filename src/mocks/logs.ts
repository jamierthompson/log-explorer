import type { LogLine } from "@/types/log";

const ANCHOR = new Date("2026-05-11T13:00:00Z").getTime();
const t = (seconds: number): number => ANCHOR + seconds * 1000;

export const INSTANCES = ["kc4qn", "m7w3p", "t2x8r"] as const;
export type InstanceId = (typeof INSTANCES)[number];

export const REQUEST_IDS = {
  r4d8a2: "kc4qn",
  k9b3c7: "m7w3p",
  p2x6n1: "t2x8r",
} as const satisfies Record<string, InstanceId>;

export type RequestId = keyof typeof REQUEST_IDS;

type Builder = (
  seconds: number,
  instance: InstanceId,
  message: string,
  requestId?: RequestId,
) => LogLine;

let nextIdNum = 0;
const id = (): string => `log_${String(++nextIdNum).padStart(4, "0")}`;

const lvl =
  (level: LogLine["level"]): Builder =>
  (seconds, instance, message, requestId) => ({
    id: id(),
    timestamp: t(seconds),
    instance,
    level,
    message,
    ...(requestId ? { requestId } : {}),
  });

const info = lvl("INFO");
const warn = lvl("WARN");
const err = lvl("ERROR");
const dbg = lvl("DEBUG");

export const mockLogs: readonly LogLine[] = [
  info(0,   "kc4qn", "Server listening on port 3000"),
  info(8,   "m7w3p", "Healthcheck OK"),
  dbg(19,  "kc4qn", "Connection pool: 3/20 active"),
  info(31,  "t2x8r", "Cache warmed (12 keys)"),
  info(44,  "m7w3p", "Heartbeat sent"),
  warn(58,  "kc4qn", "Slow upstream: api.stripe.com responded in 678ms"),
  info(72,  "t2x8r", "GET /api/orders 200 in 51ms", "p2x6n1"),
  err(89,  "kc4qn", "db query failed: pq: too many connections"),
  info(101, "m7w3p", "POST /api/sessions 201 in 64ms", "k9b3c7"),
  info(116, "kc4qn", "GET /api/users 200 in 38ms", "r4d8a2"),
  dbg(133, "t2x8r", "GC paused 14ms"),
  warn(148, "m7w3p", "Cache miss rate elevated: 0.36"),
  info(162, "kc4qn", "Background job completed in 47ms"),
  info(177, "t2x8r", "Healthcheck OK"),
  info(193, "kc4qn", "GET /api/products 200 in 33ms", "r4d8a2"),
  err(208, "m7w3p", "request timeout after 30000ms", "k9b3c7"),
  info(224, "t2x8r", "PATCH /api/orders/42 200 in 72ms", "p2x6n1"),
  info(241, "kc4qn", "Heartbeat sent"),
];

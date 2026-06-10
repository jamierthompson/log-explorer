import { describe, expect, it } from "vitest";

import { DEFAULT_CONTEXT_RANGE } from "@/demo/lib/context-state";
import { mockLogs } from "@/demo/mocks/logs";

/*
 * The demo's copy makes specific claims about this dataset — the cause
 * is invisible to the trace, the errors are pure signal, two of three
 * instances stay healthy. These tests pin those claims to the data so
 * a future edit can't quietly turn the root-cause dialog into fiction.
 */

const CAUSE_MESSAGE = "Config hot-reload applied: db.pool.max 20 → 5";
const RECOVERY_MESSAGE = "Config hot-reload applied: db.pool.max 5 → 20";

const causeLine = mockLogs.find((l) => l.message === CAUSE_MESSAGE);
const recoveryLine = mockLogs.find((l) => l.message === RECOVERY_MESSAGE);

describe("mock incident data", () => {
  it("is sorted by timestamp with unique ids", () => {
    const ids = new Set(mockLogs.map((l) => l.id));
    expect(ids.size).toBe(mockLogs.length);
    for (let i = 1; i < mockLogs.length; i++) {
      expect(mockLogs[i].timestamp).toBeGreaterThanOrEqual(
        mockLogs[i - 1].timestamp,
      );
    }
  });

  it("contains the cause on the failing instance, with no request id", () => {
    expect(causeLine).toBeDefined();
    expect(causeLine?.instance).toBe("kc4qn");
    expect(causeLine?.level).toBe("WARN");
    expect(causeLine?.requestId).toBeUndefined();
  });

  it("keeps every error inside the incident, on the saturated instance", () => {
    const errors = mockLogs.filter((l) => l.level === "ERROR");
    expect(errors.length).toBeGreaterThan(0);
    for (const e of errors) {
      expect(e.instance).toBe("kc4qn");
      expect(e.timestamp).toBeGreaterThan(causeLine!.timestamp);
      expect(e.timestamp).toBeLessThan(recoveryLine!.timestamp);
    }
  });

  it("keeps the failing request's trace short, complete, and causeless", () => {
    const trace = mockLogs.filter((l) => l.requestId === "r4d8a2");
    expect(trace.length).toBeGreaterThanOrEqual(5);
    for (const l of trace) {
      expect(l.instance).toBe("kc4qn");
      expect(l.timestamp).toBeGreaterThan(causeLine!.timestamp);
      expect(l.timestamp).toBeLessThan(recoveryLine!.timestamp);
      expect(l.message).not.toContain("hot-reload");
    }
    expect(trace.some((l) => l.message.includes("→ 503"))).toBe(true);
  });

  it("keeps the healthy instances serving 200s during the incident", () => {
    const during = mockLogs.filter(
      (l) =>
        l.timestamp > causeLine!.timestamp &&
        l.timestamp < recoveryLine!.timestamp &&
        l.instance !== "kc4qn",
    );
    expect(during.some((l) => l.message.includes("→ 200"))).toBe(true);
    expect(during.every((l) => l.level !== "ERROR")).toBe(true);
  });

  it("recovers after the reverse reload", () => {
    const after = mockLogs.filter((l) => l.timestamp > recoveryLine!.timestamp);
    expect(
      after.some((l) => l.message.includes("POST /api/checkout → 200")),
    ).toBe(true);
    expect(after.every((l) => l.level !== "ERROR")).toBe(true);
  });

  it("puts the cause within the first context window of the trace", () => {
    const causeIndex = mockLogs.findIndex((l) => l.message === CAUSE_MESSAGE);
    const firstTraceIndex = mockLogs.findIndex((l) => l.requestId === "r4d8a2");
    expect(causeIndex).toBeGreaterThanOrEqual(0);
    expect(firstTraceIndex).toBeGreaterThan(causeIndex);
    expect(firstTraceIndex - causeIndex).toBeLessThanOrEqual(
      DEFAULT_CONTEXT_RANGE,
    );
  });
});

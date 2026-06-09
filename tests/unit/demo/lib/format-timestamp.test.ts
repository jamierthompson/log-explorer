import { describe, expect, it } from "vitest";

import { formatStreamStart, formatTime } from "@/demo/lib/format-timestamp";

describe("formatTime", () => {
  it("formats a UTC timestamp as HH:MM:SS", () => {
    const t = new Date("2026-05-11T13:04:38Z").getTime();
    expect(formatTime(t)).toBe("13:04:38");
  });

  it("zero-pads hours, minutes, and seconds", () => {
    const t = new Date("2026-05-11T03:07:09Z").getTime();
    expect(formatTime(t)).toBe("03:07:09");
  });

  it("uses UTC regardless of the runner's local timezone", () => {
    const t = new Date("2026-05-11T00:00:00Z").getTime();
    expect(formatTime(t)).toBe("00:00:00");
  });
});

describe("formatStreamStart", () => {
  it("formats a UTC timestamp as MON DD, HH:MM UTC", () => {
    const t = new Date("2026-05-11T13:00:00Z").getTime();
    expect(formatStreamStart(t)).toBe("MAY 11, 13:00 UTC");
  });

  it("zero-pads the time", () => {
    const t = new Date("2026-05-11T03:07:00Z").getTime();
    expect(formatStreamStart(t)).toBe("MAY 11, 03:07 UTC");
  });

  it("uses UTC for date and time regardless of the runner's timezone", () => {
    // Just past midnight UTC — a negative-offset local zone would roll
    // this back to the previous day if the label didn't use UTC.
    const t = new Date("2026-01-01T00:30:00Z").getTime();
    expect(formatStreamStart(t)).toBe("JAN 1, 00:30 UTC");
  });
});

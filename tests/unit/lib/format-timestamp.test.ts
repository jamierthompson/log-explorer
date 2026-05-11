import { describe, expect, it } from "vitest";

import { formatTime } from "@/lib/format-timestamp";

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

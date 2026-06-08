import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LogLine } from "@/demo/features/log-explorer/log-line";
import type { LogLine as LogLineType } from "@/demo/types/log";

const base: LogLineType = {
  id: "log_0001",
  timestamp: new Date("2026-05-11T13:04:38Z").getTime(),
  instance: "kc4qn",
  level: "INFO",
  message: "Sample message",
};

describe("LogLine", () => {
  it("renders time, instance, and message", () => {
    render(<LogLine line={base} />);
    expect(screen.getByText("13:04:38")).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.textContent === "@kc4qn"),
    ).toBeInTheDocument();
    expect(screen.getByText("Sample message")).toBeInTheDocument();
  });

  it("omits the INFO label since it's the default severity", () => {
    render(<LogLine line={base} />);
    expect(screen.queryByText("INFO")).not.toBeInTheDocument();
  });

  it("renders the label for non-default severity levels", () => {
    for (const level of ["WARN", "ERROR", "DEBUG"] as const) {
      const { unmount } = render(<LogLine line={{ ...base, level }} />);
      expect(screen.getByText(level)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders the requestId when present and nothing when absent", () => {
    const { rerender } = render(
      <LogLine line={{ ...base, requestId: "r4d8a2" }} />,
    );
    expect(screen.getByText("req=r4d8a2")).toBeInTheDocument();

    rerender(<LogLine line={base} />);
    expect(screen.queryByText("req=r4d8a2")).not.toBeInTheDocument();
  });
});

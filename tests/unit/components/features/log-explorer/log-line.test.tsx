import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LogLine } from "@/components/features/log-explorer/log-line";
import type { LogLine as LogLineType } from "@/types/log";

const base: LogLineType = {
  id: "log_0001",
  timestamp: new Date("2026-05-11T13:04:38Z").getTime(),
  instance: "kc4qn",
  level: "INFO",
  message: "Sample message",
};

describe("LogLine", () => {
  it("renders time, instance, level, and message", () => {
    render(<LogLine line={base} />);
    expect(screen.getByText("13:04:38")).toBeInTheDocument();
    expect(screen.getByText("kc4qn")).toBeInTheDocument();
    expect(screen.getByText("INFO")).toBeInTheDocument();
    expect(screen.getByText("Sample message")).toBeInTheDocument();
  });

  it("renders the label for every severity level", () => {
    for (const level of ["INFO", "WARN", "ERROR", "DEBUG"] as const) {
      const { unmount } = render(<LogLine line={{ ...base, level }} />);
      expect(screen.getByText(level)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders the requestId when present and nothing when absent", () => {
    const { rerender } = render(
      <LogLine line={{ ...base, requestId: "r4d8a2" }} />,
    );
    expect(screen.getByText("r4d8a2")).toBeInTheDocument();

    rerender(<LogLine line={base} />);
    expect(screen.queryByText("r4d8a2")).not.toBeInTheDocument();
  });
});

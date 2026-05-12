import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LogExplorer } from "@/components/features/log-explorer/log-explorer";
import type { LogLine } from "@/types/log";

const lines: readonly LogLine[] = [
  { id: "1", timestamp: 0, instance: "kc4qn", level: "INFO", message: "Healthcheck OK" },
  { id: "2", timestamp: 1, instance: "m7w3p", level: "ERROR", message: "request timeout" },
  { id: "3", timestamp: 2, instance: "kc4qn", level: "INFO", message: "GET /api/users", requestId: "r4d8a2" },
];

describe("LogExplorer", () => {
  it("renders every line on mount", () => {
    render(<LogExplorer lines={lines} />);
    expect(screen.getByText("Healthcheck OK")).toBeInTheDocument();
    expect(screen.getByText("request timeout")).toBeInTheDocument();
    expect(screen.getByText("GET /api/users")).toBeInTheDocument();
  });

  it("filters to ERROR only when the Errors chip is pressed", async () => {
    const user = userEvent.setup();
    render(<LogExplorer lines={lines} />);
    await user.click(screen.getByRole("button", { name: /errors only/i }));

    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();
    expect(screen.getByText("request timeout")).toBeInTheDocument();
    expect(screen.queryByText("GET /api/users")).not.toBeInTheDocument();
  });

  it("clicking the active chip again clears the filter", async () => {
    const user = userEvent.setup();
    render(<LogExplorer lines={lines} />);
    const errorsChip = screen.getByRole("button", { name: /errors only/i });
    await user.click(errorsChip);
    await user.click(errorsChip);

    expect(screen.getByText("Healthcheck OK")).toBeInTheDocument();
    expect(screen.getByText("request timeout")).toBeInTheDocument();
    expect(screen.getByText("GET /api/users")).toBeInTheDocument();
  });

  it("pressing Esc closes an open context", async () => {
    const user = userEvent.setup();
    render(<LogExplorer lines={lines} />);
    await user.click(screen.getByRole("button", { name: /trace req=r4d8a2/i }));
    await user.click(screen.getByText("GET /api/users"));
    expect(document.querySelector('[data-selected="true"]')).not.toBeNull();

    await user.keyboard("{Escape}");
    expect(document.querySelector('[data-selected="true"]')).toBeNull();
  });

  it("pressing Esc with no contexts but a filter active clears the filter", async () => {
    const user = userEvent.setup();
    render(<LogExplorer lines={lines} />);
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();
    expect(screen.getByText("request timeout")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.getByText("Healthcheck OK")).toBeInTheDocument();
    expect(screen.getByText("request timeout")).toBeInTheDocument();
  });

  it("pressing Shift+Esc closes every open context", async () => {
    const user = userEvent.setup();
    render(<LogExplorer lines={lines} />);
    await user.click(screen.getByRole("button", { name: /trace req=r4d8a2/i }));
    await user.click(screen.getByText("GET /api/users"));
    expect(document.querySelector('[data-selected="true"]')).not.toBeNull();

    await user.keyboard("{Shift>}{Escape}{/Shift}");
    expect(document.querySelector('[data-selected="true"]')).toBeNull();
  });

  it("applies multiple chip filters at once and toggles them independently", async () => {
    const user = userEvent.setup();
    render(<LogExplorer lines={lines} />);
    const errorsChip = screen.getByRole("button", { name: /errors only/i });
    const instanceChip = screen.getByRole("button", { name: /instance kc4qn/i });

    // Only errors: just the ERROR line is visible.
    await user.click(errorsChip);
    expect(screen.getByText("request timeout")).toBeInTheDocument();
    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();

    // Add instance kc4qn: intersection (ERROR on kc4qn) has no lines.
    await user.click(instanceChip);
    expect(screen.queryByText("request timeout")).not.toBeInTheDocument();
    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();

    // Toggle errors off: instance kc4qn alone remains, so kc4qn INFO lines come back.
    await user.click(errorsChip);
    expect(screen.getByText("Healthcheck OK")).toBeInTheDocument();
    expect(screen.getByText("GET /api/users")).toBeInTheDocument();
    expect(screen.queryByText("request timeout")).not.toBeInTheDocument();
  });
});

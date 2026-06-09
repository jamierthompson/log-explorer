import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { LogLine } from "@/demo";
import { ActTwo } from "@/site/features/experience/act-two/act-two";

const lines: readonly LogLine[] = [
  {
    id: "1",
    timestamp: 0,
    instance: "kc4qn",
    level: "INFO",
    message: "Healthcheck OK",
  },
  {
    id: "2",
    timestamp: 1,
    instance: "m7w3p",
    level: "ERROR",
    message: "request timeout",
  },
  {
    id: "3",
    timestamp: 2,
    instance: "kc4qn",
    level: "INFO",
    message: "GET /api/users",
    requestId: "r4d8a2",
  },
];

describe("ActTwo", () => {
  it("holds the root-cause call until context is open", async () => {
    const user = userEvent.setup();
    render(<ActTwo lines={lines} />);

    const call = screen.getByRole("button", { name: /call the root cause/i });
    expect(call).toBeDisabled();

    // A filter alone narrows the view but isn't grounds for a verdict.
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    expect(call).toBeDisabled();

    // Opening context in place is what arms the call.
    await user.click(screen.getByText("request timeout"));
    expect(call).toBeEnabled();

    await user.click(call);
    expect(
      screen.getByRole("dialog", { name: /what was the root cause/i }),
    ).toBeInTheDocument();
  });

  it("checks off the guide as the visitor filters and opens context", async () => {
    const user = userEvent.setup();
    render(<ActTwo lines={lines} />);

    const narrow = screen.getByText("Narrow to the failure");
    const context = screen.getByText("Open context in place");
    expect(narrow.closest("li")).not.toHaveAttribute("data-done");

    await user.click(screen.getByRole("button", { name: /errors only/i }));
    expect(narrow.closest("li")).toHaveAttribute("data-done");

    await user.click(screen.getByText("request timeout"));
    expect(context.closest("li")).toHaveAttribute("data-done");
  });
});

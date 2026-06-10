import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { LogLine } from "@/demo";
import { ActOne } from "@/site/features/experience/act-one/act-one";

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

describe("ActOne", () => {
  it("opens a context view in a new tab instead of expanding in place", async () => {
    const user = userEvent.setup();
    render(<ActOne lines={lines} onAdvance={() => {}} />);

    // Act 1 opens unfiltered; narrow first so a line is clickable.
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));

    expect(screen.getByText(/slice of the live tail/i)).toBeInTheDocument();
    // Nothing expanded in place.
    expect(document.querySelector('[data-selected="true"]')).toBeNull();
  });

  it("keeps the live tail filtered when the visitor returns to it", async () => {
    const user = userEvent.setup();
    render(<ActOne lines={lines} onAdvance={() => {}} />);
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));

    await user.click(screen.getByRole("tab", { name: "Live tail" }));
    // The filter survived the round trip: the non-matching line stays hidden.
    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();
  });

  it("checks off the guide as the visitor filters and opens tabs", async () => {
    const user = userEvent.setup();
    render(<ActOne lines={lines} onAdvance={() => {}} />);

    const filterStep = screen.getByText("Filter the live tail");
    const openStep = screen.getByText("Open a line for context");
    expect(filterStep.closest("li")).not.toHaveAttribute("data-done");
    expect(openStep.closest("li")).not.toHaveAttribute("data-done");

    await user.click(screen.getByRole("button", { name: /errors only/i }));
    expect(filterStep.closest("li")).toHaveAttribute("data-done");

    await user.click(screen.getByText("request timeout"));
    expect(openStep.closest("li")).toHaveAttribute("data-done");
  });

  it("advances to Act 2 via an always-available 'There's a better way'", async () => {
    const user = userEvent.setup();
    const onAdvance = vi.fn();
    render(<ActOne lines={lines} onAdvance={onAdvance} />);

    const better = screen.getByRole("button", { name: /better way/i });
    expect(better).toBeEnabled();
    // The escape-hatch link is gone — the call is the only way forward.
    expect(screen.queryByRole("button", { name: /skip ahead/i })).toBeNull();

    await user.click(better);
    expect(onAdvance).toHaveBeenCalledOnce();
  });
});

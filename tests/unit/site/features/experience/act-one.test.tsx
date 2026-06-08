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
    render(<ActOne lines={lines} onAdvance={vi.fn()} />);

    // Act 1 opens unfiltered; narrow first so a line is clickable.
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));

    expect(
      screen.getByText(/your filter didn’t come with you/i),
    ).toBeInTheDocument();
    // Nothing expanded in place.
    expect(document.querySelector('[data-selected="true"]')).toBeNull();
  });

  it("keeps the live tail filtered when the visitor returns to it", async () => {
    const user = userEvent.setup();
    render(<ActOne lines={lines} onAdvance={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));

    await user.click(screen.getByRole("tab", { name: "Live tail" }));
    // The filter survived the round trip: the non-matching line stays hidden.
    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();
  });
});

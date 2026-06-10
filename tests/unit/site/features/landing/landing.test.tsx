import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import type { LogLine } from "@/demo";
import { Landing } from "@/site/features/landing/landing";

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
];

afterEach(() => {
  window.history.replaceState(null, "", window.location.pathname);
});

describe("Landing", () => {
  it("mounts the demo hidden behind the hero and reveals it on open", async () => {
    const user = userEvent.setup();
    render(<Landing lines={lines} />);

    // Act 1's guide is in the document from first load, just concealed.
    expect(screen.getByText("What's happening")).not.toBeVisible();

    await user.click(screen.getByRole("button", { name: /open the logs/i }));
    expect(screen.getByText("What's happening")).toBeVisible();
  });

  it("preserves demo progress across a trip to the story and back", async () => {
    window.history.replaceState(null, "", "#demo");
    const user = userEvent.setup();
    render(<Landing lines={lines} />);

    // Make progress the demo would lose if it were remounted: filter the
    // tail, which both narrows the stream and latches a guide step.
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    const filterStep = screen.getByText("Filter the live tail");
    expect(filterStep.closest("li")).toHaveAttribute("data-done");

    await user.click(screen.getByRole("button", { name: "Story" }));
    // The demo is concealed while the story is up, not unmounted.
    expect(filterStep).not.toBeVisible();

    // Browser back to the demo (model the pop jsdom won't perform).
    act(() => {
      window.history.replaceState(null, "", "#demo");
      window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
    });

    expect(filterStep).toBeVisible();
    expect(filterStep.closest("li")).toHaveAttribute("data-done");
    // The filter itself survived too, not just the guide's memory of it.
    expect(
      screen.getByRole("button", { name: /errors only/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

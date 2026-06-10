import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import type { LogLine } from "@/demo";
import { Experience } from "@/site/features/experience/experience";

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
  document
    .querySelectorAll("[data-app-scroll-viewport]")
    .forEach((el) => el.remove());
});

describe("Experience", () => {
  it("opens the next act from the top of the page", async () => {
    const user = userEvent.setup();
    const viewport = document.createElement("div");
    viewport.setAttribute("data-app-scroll-viewport", "");
    document.body.appendChild(viewport);
    render(<Experience lines={lines} />);

    // On narrow viewports the advance control sits below the stage, so
    // the visitor has scrolled down by the time they click it.
    viewport.scrollTop = 600;
    await user.click(screen.getByRole("button", { name: /better way/i }));

    expect(screen.getByText("The Method")).toBeVisible();
    expect(viewport.scrollTop).toBe(0);
  });

  it("preserves an act's state when the visitor navigates away and back", async () => {
    const user = userEvent.setup();
    render(<Experience lines={lines} />);

    // Filtering checks Act 1's first guide step. (Role queries ignore the
    // hidden act, so the visible explorer's chip is unambiguous.)
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    const filterStep = screen.getByText("Filter the live tail");
    expect(filterStep.closest("li")).toHaveAttribute("data-done");

    // Leave for Act 2 via the always-available advance, confirm we arrived.
    await user.click(screen.getByRole("button", { name: /better way/i }));
    expect(screen.getByText("The Method")).toBeVisible();

    // Browser back returns to Act 1 (model the pop jsdom won't perform).
    act(() => {
      window.history.replaceState(null, "", window.location.href);
      window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
    });

    // The checked step survived the round trip — Act 1 was never unmounted.
    expect(screen.getByText("What's happening")).toBeVisible();
    expect(filterStep.closest("li")).toHaveAttribute("data-done");
  });
});

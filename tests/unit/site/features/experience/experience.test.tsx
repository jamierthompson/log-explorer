import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import type { LogLine } from "@/demo";
import { Experience } from "@/site/features/experience/experience";

import {
  createAppScrollViewport,
  removeAppScrollViewports,
} from "../../../../helpers/app-scroll-viewport";

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
  removeAppScrollViewports();
});

describe("Experience", () => {
  it("opens the next act from the top of the page", async () => {
    const user = userEvent.setup();
    const viewport = createAppScrollViewport();
    render(<Experience lines={lines} />);

    // On narrow viewports the advance control sits below the stage, so
    // the visitor has scrolled down by the time they click it.
    viewport.scrollTop = 600;
    await user.click(screen.getByRole("button", { name: /better way/i }));

    expect(screen.getByText("The Method")).toBeVisible();
    expect(viewport.scrollTop).toBe(0);
  });

  it("moves focus into the entering act when the visitor advances", async () => {
    const user = userEvent.setup();
    render(<Experience lines={lines} />);

    // Advancing hides the container holding the clicked button, which
    // would otherwise drop focus to the body.
    await user.click(screen.getByRole("button", { name: /better way/i }));

    expect(document.activeElement).toContainElement(
      screen.getByText("The Method"),
    );
  });

  it("does not steal focus on initial mount", () => {
    render(<Experience lines={lines} />);
    expect(document.body).toHaveFocus();
  });

  it("lands focus on Act 1 after a replay remount", async () => {
    const user = userEvent.setup();
    render(<Experience lines={lines} />);

    await user.click(screen.getByRole("button", { name: /better way/i }));
    await user.click(
      screen.getByRole("button", { name: /call the root cause/i }),
    );
    await user.click(screen.getByRole("button", { name: /config reload/i }));
    // Replay remounts both acts, destroying the dialog's focus-restore
    // target — focus must land inside the fresh Act 1, not on the body.
    await user.click(
      screen.getByRole("button", { name: /replay the incident/i }),
    );

    expect(screen.getByText("What’s happening")).toBeVisible();
    expect(document.activeElement).toContainElement(
      screen.getByText("What’s happening"),
    );
  });

  it("announces guide-step completions through the live region", async () => {
    const user = userEvent.setup();
    render(<Experience lines={lines} />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("");

    await user.click(screen.getByRole("button", { name: /errors only/i }));
    expect(status).toHaveTextContent("Step done: Filter the live tail");
  });

  it("clears the live region when the visitor replays", async () => {
    const user = userEvent.setup();
    render(<Experience lines={lines} />);

    await user.click(screen.getByRole("button", { name: /errors only/i }));
    expect(screen.getByRole("status")).not.toHaveTextContent("");

    await user.click(screen.getByRole("button", { name: /better way/i }));
    await user.click(
      screen.getByRole("button", { name: /call the root cause/i }),
    );
    await user.click(screen.getByRole("button", { name: /config reload/i }));
    await user.click(
      screen.getByRole("button", { name: /replay the incident/i }),
    );

    // A fresh run starts silent — a stale announcement would lie.
    expect(screen.getByRole("status")).toHaveTextContent("");
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
    expect(screen.getByText("What’s happening")).toBeVisible();
    expect(filterStep.closest("li")).toHaveAttribute("data-done");
  });

  it("rewinds to Act 1 on a narrative entry, keeping both acts' progress", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Experience lines={lines} entryCount={0} />);

    // Build progress in both acts: filter in Act 1, then advance and
    // filter again so Act 2's triage step latches.
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByRole("button", { name: /better way/i }));
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    const triage = screen.getByText("Triage the symptom");
    expect(triage.closest("li")).toHaveAttribute("data-done");

    // A narrative entry rewinds the sequencing, not the acts' state.
    rerender(<Experience lines={lines} entryCount={1} />);
    expect(screen.getByText("What’s happening")).toBeVisible();
    expect(screen.getByText("The Method")).not.toBeVisible();

    // Advancing again finds Act 2 exactly as it was left.
    await user.click(screen.getByRole("button", { name: /better way/i }));
    expect(triage.closest("li")).toHaveAttribute("data-done");
  });
});

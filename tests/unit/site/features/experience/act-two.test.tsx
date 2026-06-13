import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { LogLine } from "@/demo";
import { ActTwo } from "@/site/features/experience/act-two/act-two";
import { useDemoState } from "@/site/features/experience/demo-state";

import { DemoProviders } from "../../../../helpers/demo-providers";
import { getGuideStep } from "../../../../helpers/experience-dom";

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
  {
    id: "4",
    timestamp: 3,
    instance: "t2x8r",
    level: "ERROR",
    message: "upstream timeout",
  },
];

/* Mirrors how the route view drives Act 2: keyed on the act's run id so a
 * reset remounts it, re-seeding the explorer from the cleared store. */
function ResettableActTwo() {
  const { state, resetAct2 } = useDemoState();
  return <ActTwo key={state.act2.runId} lines={lines} onReset={resetAct2} />;
}

describe("ActTwo", () => {
  it("opens the root-cause call, which is always available", async () => {
    const user = userEvent.setup();
    render(<ActTwo lines={lines} onReset={() => {}} />, {
      wrapper: DemoProviders,
    });

    const call = screen.getByRole("button", { name: /call the root cause/i });
    expect(call).toBeEnabled();

    await user.click(call);
    expect(
      screen.getByRole("dialog", { name: /what was the root cause/i }),
    ).toBeInTheDocument();
  });

  it("checks off the guide as the visitor filters and opens context", async () => {
    const user = userEvent.setup();
    render(<ActTwo lines={lines} onReset={() => {}} />, {
      wrapper: DemoProviders,
    });

    const triage = getGuideStep("triage");
    const context = getGuideStep("context");
    expect(triage).not.toHaveAttribute("data-done");

    await user.click(screen.getByRole("button", { name: /errors only/i }));
    expect(triage).toHaveAttribute("data-done");

    await user.click(screen.getByText("request timeout"));
    expect(context).toHaveAttribute("data-done");
  });

  it("closes the verdict dialog when leaving for the story", async () => {
    const user = userEvent.setup();
    const onReadStory = vi.fn();
    render(
      <ActTwo lines={lines} onReadStory={onReadStory} onReset={() => {}} />,
      {
        wrapper: DemoProviders,
      },
    );

    await user.click(
      screen.getByRole("button", { name: /call the root cause/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /config reload shrank/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /read how it was built/i }),
    );

    expect(onReadStory).toHaveBeenCalledOnce();
    // The act is only hidden on navigation, so a dialog left open would
    // float over the story view.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("latches the blast-radius step across contexts opened one at a time", async () => {
    const user = userEvent.setup();
    render(<ActTwo lines={lines} onReset={() => {}} />, {
      wrapper: DemoProviders,
    });

    const radius = getGuideStep("radius");
    await user.click(screen.getByRole("button", { name: /errors only/i }));

    // Open a context, then close it the way the explorer teaches —
    // one place examined isn't a blast radius yet.
    await user.click(screen.getByText("request timeout"));
    await user.click(screen.getByText("request timeout"));
    expect(radius).not.toHaveAttribute("data-done");

    // Opening another context elsewhere completes the comparison, even
    // though the two were never open at the same time.
    await user.click(screen.getByText("upstream timeout"));
    expect(radius).toHaveAttribute("data-done");
  });

  it("seeds the explorer from a persisted filter on mount", async () => {
    const user = userEvent.setup();

    // Stamp a filter into the store, then mount the act against it.
    function Harness() {
      const { state, setAct2Scenarios } = useDemoState();
      return state.act2.scenarioIds.length === 0 ? (
        <button onClick={() => setAct2Scenarios(["errors"])}>seed</button>
      ) : (
        <ActTwo key={state.act2.runId} lines={lines} onReset={() => {}} />
      );
    }
    render(<Harness />, { wrapper: DemoProviders });
    await user.click(screen.getByRole("button", { name: "seed" }));

    // The act comes up already filtered — the non-matching line never shows.
    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();
  });

  it("clears the filter and the guide when the act resets", async () => {
    const user = userEvent.setup();
    render(<ResettableActTwo />, { wrapper: DemoProviders });

    await user.click(screen.getByRole("button", { name: /errors only/i }));
    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();
    expect(getGuideStep("triage")).toHaveAttribute("data-done");

    await user.click(screen.getByRole("button", { name: /reset this act/i }));

    // Remounted fresh: filter re-seeded empty, checklist back to start.
    expect(screen.getByText("Healthcheck OK")).toBeInTheDocument();
    expect(getGuideStep("triage")).not.toHaveAttribute("data-done");
  });
});

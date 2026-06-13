import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { LogLine } from "@/demo";
import { ActOne } from "@/site/features/experience/act-one/act-one";
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
];

/* Mirrors how the route view drives Act 1: keyed on the act's run id so a
 * reset remounts it, which is the only way the explorer's internal filter
 * gets cleared. */
function ResettableActOne() {
  const { state, resetAct1 } = useDemoState();
  return (
    <ActOne
      key={state.act1.runId}
      lines={lines}
      onAdvance={() => {}}
      onReset={resetAct1}
    />
  );
}

describe("ActOne", () => {
  it("opens a context view in a new tab instead of expanding in place", async () => {
    const user = userEvent.setup();
    render(<ActOne lines={lines} onAdvance={() => {}} onReset={() => {}} />, {
      wrapper: DemoProviders,
    });

    // Act 1 opens unfiltered; narrow first so a line is clickable.
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));

    expect(screen.getByText(/slice of the live tail/i)).toBeInTheDocument();
    // Nothing expanded in place.
    expect(document.querySelector('[data-selected="true"]')).toBeNull();
    // The line the slice centers on is conveyed to AT, not just by color.
    expect(document.querySelector("[data-anchor]")).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("keeps the live tail filtered when the visitor returns to it", async () => {
    const user = userEvent.setup();
    render(<ActOne lines={lines} onAdvance={() => {}} onReset={() => {}} />, {
      wrapper: DemoProviders,
    });
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));

    await user.click(screen.getByRole("tab", { name: "Live tail" }));
    // The filter survived the round trip: the non-matching line stays hidden.
    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();
  });

  it("checks off the guide as the visitor filters and opens tabs", async () => {
    const user = userEvent.setup();
    render(<ActOne lines={lines} onAdvance={() => {}} onReset={() => {}} />, {
      wrapper: DemoProviders,
    });

    const filterStep = getGuideStep("filter");
    const openStep = getGuideStep("open");
    expect(filterStep).not.toHaveAttribute("data-done");
    expect(openStep).not.toHaveAttribute("data-done");

    await user.click(screen.getByRole("button", { name: /errors only/i }));
    expect(filterStep).toHaveAttribute("data-done");

    await user.click(screen.getByText("request timeout"));
    expect(openStep).toHaveAttribute("data-done");
  });

  it("reopening an already-open line reuses its tab", async () => {
    const user = userEvent.setup();
    render(<ActOne lines={lines} onAdvance={() => {}} onReset={() => {}} />, {
      wrapper: DemoProviders,
    });
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));
    expect(screen.getAllByRole("tab", { name: /context slice/i })).toHaveLength(
      1,
    );

    await user.click(screen.getByRole("tab", { name: "Live tail" }));
    await user.click(screen.getByText("request timeout"));

    // No duplicate tab — the existing slice takes the stage again.
    expect(screen.getAllByRole("tab", { name: /context slice/i })).toHaveLength(
      1,
    );
    expect(screen.getByRole("tab", { name: /context slice/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("returns to the live tail when the active slice closes", async () => {
    const user = userEvent.setup();
    render(<ActOne lines={lines} onAdvance={() => {}} onReset={() => {}} />, {
      wrapper: DemoProviders,
    });
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));
    expect(screen.getByRole("tab", { name: /context slice/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    const close = document.querySelector(
      '[role="tab"][aria-label^="Context slice"] + button',
    );
    await user.click(close as HTMLElement);

    expect(screen.getByRole("tab", { name: "Live tail" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // The filtered tail is back on stage, not an empty panel.
    expect(screen.getByText("request timeout")).toBeVisible();
  });

  it("closes the active slice tab with the Delete key", async () => {
    const user = userEvent.setup();
    render(<ActOne lines={lines} onAdvance={() => {}} onReset={() => {}} />, {
      wrapper: DemoProviders,
    });
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));

    const slice = screen.getByRole("tab", { name: /context slice/i });
    slice.focus();
    await user.keyboard("{Delete}");

    expect(
      screen.queryByRole("tab", { name: /context slice/i }),
    ).not.toBeInTheDocument();
    // Focus lands on the tab that takes over, not the body.
    expect(screen.getByRole("tab", { name: "Live tail" })).toHaveFocus();
  });

  it("keeps the close affordance out of the tab order and the accessibility tree", async () => {
    const user = userEvent.setup();
    render(<ActOne lines={lines} onAdvance={() => {}} onReset={() => {}} />, {
      wrapper: DemoProviders,
    });
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));

    // Hidden from AT, so it has no accessible name to query by — select
    // it as the control beside the slice trigger.
    const close = document.querySelector(
      '[role="tab"][aria-label^="Context slice"] + button',
    );
    expect(close).toHaveAttribute("tabindex", "-1");
    expect(close).toHaveAttribute("aria-hidden", "true");
    // Pointer users can still close with it.
    await user.click(close as HTMLElement);
    expect(
      screen.queryByRole("tab", { name: /context slice/i }),
    ).not.toBeInTheDocument();
  });

  it("advances to Act 2 via an always-available 'There's a better way'", async () => {
    const user = userEvent.setup();
    const onAdvance = vi.fn();
    render(<ActOne lines={lines} onAdvance={onAdvance} onReset={() => {}} />, {
      wrapper: DemoProviders,
    });

    const better = screen.getByRole("button", { name: /better way/i });
    expect(better).toBeEnabled();
    // No skip affordance is offered; the advance call is the only way
    // forward.
    expect(screen.queryByRole("button", { name: /skip ahead/i })).toBeNull();

    await user.click(better);
    expect(onAdvance).toHaveBeenCalledOnce();
  });

  it("clears the filtered tail and the guide when the act resets", async () => {
    const user = userEvent.setup();
    render(<ResettableActOne />, { wrapper: DemoProviders });

    await user.click(screen.getByRole("button", { name: /errors only/i }));
    // Filtered: the non-matching line drops out, and the step latches.
    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();
    expect(getGuideStep("filter")).toHaveAttribute("data-done");

    await user.click(screen.getByRole("button", { name: /reset this act/i }));

    // The reset remounts the act fresh: filter gone, guide back to start.
    expect(screen.getByText("Healthcheck OK")).toBeInTheDocument();
    expect(getGuideStep("filter")).not.toHaveAttribute("data-done");
  });
});

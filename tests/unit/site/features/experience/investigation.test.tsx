import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { LogLine } from "@/demo";
import { Investigation } from "@/site/features/experience/investigation/investigation";
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

const noop = () => {};

function renderInvestigation(props?: {
  onCallRootCause?: () => void;
  onReset?: () => void;
}) {
  return render(
    <Investigation
      lines={lines}
      onCallRootCause={props?.onCallRootCause ?? noop}
      onReset={props?.onReset ?? noop}
    />,
    { wrapper: DemoProviders },
  );
}

/* Mirrors how the route view drives the demo: keyed on the investigation's
 * run id so a reset remounts it, which is the only way the explorer's
 * internal filter gets cleared. */
function ResettableInvestigation() {
  const { state, reset } = useDemoState();
  return (
    <Investigation
      key={state.runId}
      lines={lines}
      onCallRootCause={noop}
      onReset={reset}
    />
  );
}

/** Crosses the cut into phase two via the guide's action. */
async function cut(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole("button", { name: /there’s a better way/i }),
  );
}

describe("Investigation — phase one", () => {
  it("opens a context view in a new tab instead of expanding in place", async () => {
    const user = userEvent.setup();
    renderInvestigation();

    // Opens unfiltered; narrow first so a line is clickable.
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));

    // It opened as its own tab, not an in-place expansion.
    expect(
      screen.getByRole("tab", { name: /context slice/i }),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-selected="true"]')).toBeNull();
    // The line the slice centers on is conveyed to AT, not just by color.
    expect(document.querySelector("[data-anchor]")).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("keeps the live tail filtered when the visitor returns to it", async () => {
    const user = userEvent.setup();
    renderInvestigation();
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));

    await user.click(screen.getByRole("tab", { name: "Live tail" }));
    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();
  });

  it("reopening an already-open line reuses its tab", async () => {
    const user = userEvent.setup();
    renderInvestigation();
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));
    expect(screen.getAllByRole("tab", { name: /context slice/i })).toHaveLength(
      1,
    );

    await user.click(screen.getByRole("tab", { name: "Live tail" }));
    await user.click(screen.getByText("request timeout"));

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
    renderInvestigation();
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));

    const close = document.querySelector(
      '[role="tab"][aria-label^="Context slice"] + button',
    );
    await user.click(close as HTMLElement);

    expect(screen.getByRole("tab", { name: "Live tail" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("request timeout")).toBeVisible();
  });

  it("closes the active slice tab with the Delete key", async () => {
    const user = userEvent.setup();
    renderInvestigation();
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));

    const slice = screen.getByRole("tab", { name: /context slice/i });
    slice.focus();
    await user.keyboard("{Delete}");

    expect(
      screen.queryByRole("tab", { name: /context slice/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Live tail" })).toHaveFocus();
  });

  it("keeps the close affordance out of the tab order and the accessibility tree", async () => {
    const user = userEvent.setup();
    renderInvestigation();
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));

    const close = document.querySelector(
      '[role="tab"][aria-label^="Context slice"] + button',
    );
    expect(close).toHaveAttribute("tabindex", "-1");
    expect(close).toHaveAttribute("aria-hidden", "true");
    await user.click(close as HTMLElement);
    expect(
      screen.queryByRole("tab", { name: /context slice/i }),
    ).not.toBeInTheDocument();
  });
});

describe("Investigation — the cut", () => {
  it("clears the scattered tabs and returns to the filtered live tail", async () => {
    const user = userEvent.setup();
    renderInvestigation();

    // Scatter two slices in phase one.
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));
    await user.click(screen.getByRole("tab", { name: "Live tail" }));
    await user.click(screen.getByText("upstream timeout"));
    expect(screen.getAllByRole("tab", { name: /context slice/i })).toHaveLength(
      2,
    );

    await cut(user);

    // The tab chrome is gone — the explorer now expands context in place —
    // but nothing is pre-stacked: the cut hands the work back, so the
    // in-place goal is not yet earned.
    expect(
      screen.queryByRole("tab", { name: "Live tail" }),
    ).not.toBeInTheDocument();
    expect(getGuideStep("inplace")).not.toHaveAttribute("data-done");
    // The forward action is now the closing call, not another cut.
    expect(
      screen.getByRole("button", { name: /call the root cause/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /there’s a better way/i }),
    ).not.toBeInTheDocument();
  });
});

describe("Investigation — phase two", () => {
  it("opens the root-cause call, which is always available", async () => {
    const user = userEvent.setup();
    const onCallRootCause = vi.fn();
    renderInvestigation({ onCallRootCause });
    await cut(user);

    const call = screen.getByRole("button", { name: /call the root cause/i });
    expect(call).toBeEnabled();
    await user.click(call);
    expect(onCallRootCause).toHaveBeenCalledOnce();
  });

  it("earns the in-place goal only when the visitor opens context in place", async () => {
    const user = userEvent.setup();
    renderInvestigation();

    // Filter first so a line is open-able, then cross the cut.
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await cut(user);

    // The cut alone doesn't earn it — the visitor has to do the work.
    expect(getGuideStep("inplace")).not.toHaveAttribute("data-done");

    // Opening context in place (no tab spawns) completes the goal.
    await user.click(screen.getByText("request timeout"));
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(getGuideStep("inplace")).toHaveAttribute("data-done");
  });

  it("stacks a second context in one view, no tab spawned", async () => {
    const user = userEvent.setup();
    renderInvestigation();
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await cut(user);

    await user.click(screen.getByText("request timeout"));
    expect(getGuideStep("stack")).not.toHaveAttribute("data-done");

    // A second context joins the first instead of opening a tab.
    await user.click(screen.getByText("upstream timeout"));
    expect(getGuideStep("stack")).toHaveAttribute("data-done");
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });

  it("clears the filter, the guide, and the phase when reset", async () => {
    const user = userEvent.setup();
    render(<ResettableInvestigation />, { wrapper: DemoProviders });

    await user.click(screen.getByRole("button", { name: /req=r4d8a2/i }));
    expect(getGuideStep("filter")).toHaveAttribute("data-done");
    await cut(user);

    await user.click(screen.getByRole("button", { name: /reset/i }));

    // Remounted fresh: filter gone, checklist back to start, and back to
    // phase one (the cut action is offered again).
    expect(screen.getByText("Healthcheck OK")).toBeInTheDocument();
    expect(getGuideStep("filter")).not.toHaveAttribute("data-done");
    expect(
      screen.getByRole("button", { name: /there’s a better way/i }),
    ).toBeInTheDocument();
  });
});

describe("Investigation — the phase-one checklist", () => {
  it("checks the filter goal when any chip narrows the stream", async () => {
    const user = userEvent.setup();
    renderInvestigation();
    expect(getGuideStep("filter")).not.toHaveAttribute("data-done");

    await user.click(screen.getByRole("button", { name: /errors only/i }));
    expect(getGuideStep("filter")).toHaveAttribute("data-done");
  });

  it("checks open, then pile, as the fan of tabs grows", async () => {
    const user = userEvent.setup();
    renderInvestigation();
    await user.click(screen.getByRole("button", { name: /errors only/i }));

    await user.click(screen.getByText("request timeout"));
    expect(getGuideStep("open")).toHaveAttribute("data-done");
    expect(getGuideStep("pile")).not.toHaveAttribute("data-done");

    await user.click(screen.getByRole("tab", { name: "Live tail" }));
    await user.click(screen.getByText("upstream timeout"));
    expect(getGuideStep("pile")).toHaveAttribute("data-done");
  });
});

describe("Investigation — persistence", () => {
  it("seeds the explorer from a persisted filter on mount", async () => {
    const user = userEvent.setup();

    function Harness() {
      const { state, setScenarios } = useDemoState();
      return state.scenarioIds.length === 0 ? (
        <button onClick={() => setScenarios(["errors"])}>seed</button>
      ) : (
        <Investigation
          key={state.runId}
          lines={lines}
          onCallRootCause={noop}
          onReset={noop}
        />
      );
    }
    render(<Harness />, { wrapper: DemoProviders });
    await user.click(screen.getByRole("button", { name: "seed" }));

    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();
  });
});

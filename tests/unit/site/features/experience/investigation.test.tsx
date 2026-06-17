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

/** Crosses the cut into act two via the guide's action. */
async function cut(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole("button", { name: /there’s a better way/i }),
  );
}

describe("Investigation — act one", () => {
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
    // Target the log row, not its text: the tab title now echoes the line's
    // message, so the message appears both in the list and on the tab.
    await user.click(screen.getByRole("option", { name: /request timeout/i }));
    expect(screen.getAllByRole("tab", { name: /context slice/i })).toHaveLength(
      1,
    );

    await user.click(screen.getByRole("tab", { name: "Live tail" }));
    await user.click(screen.getByRole("option", { name: /request timeout/i }));

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
  it("clears the scattered tabs and the filter, landing act two on a clean live tail", async () => {
    const user = userEvent.setup();
    renderInvestigation();

    // Scatter two slices in act one, narrowed to errors.
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();
    await user.click(screen.getByText("request timeout"));
    await user.click(screen.getByRole("tab", { name: "Live tail" }));
    await user.click(screen.getByText("upstream timeout"));
    expect(screen.getAllByRole("tab", { name: /context slice/i })).toHaveLength(
      2,
    );

    await cut(user);

    // The scattered slice tabs are gone, but the live tail tab stays —
    // the strip and layout hold from act to act. The explorer now expands
    // context in place, and nothing is pre-stacked: the cut hands the work
    // back, so the in-place goal is not yet earned.
    expect(screen.getByRole("tab", { name: "Live tail" })).toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /context slice/i }),
    ).not.toBeInTheDocument();
    expect(getGuideStep("inplace")).not.toHaveAttribute("data-done");
    // The act-one filter is dropped, so act two opens on the full stream and
    // its triage step isn't pre-satisfied by the narrowing carried over.
    expect(screen.getByText("Healthcheck OK")).toBeInTheDocument();
    expect(getGuideStep("triage")).not.toHaveAttribute("data-done");
    // The forward action is now the closing call, not another cut.
    expect(
      screen.getByRole("button", { name: /call the root cause/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /there’s a better way/i }),
    ).not.toBeInTheDocument();
  });
});

describe("Investigation — act two", () => {
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

    await cut(user);

    // The cut alone doesn't earn it — the visitor has to do the work.
    expect(getGuideStep("inplace")).not.toHaveAttribute("data-done");

    // Context opens against a filtered view — it expands the hidden lines
    // around a match — so narrow first, then open context in place.
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));
    // It expanded in place — no slice tab joined the standing live tail.
    expect(
      screen.queryByRole("tab", { name: /context slice/i }),
    ).not.toBeInTheDocument();
    expect(getGuideStep("inplace")).toHaveAttribute("data-done");
  });

  it("earns the second-context step only when a second context is stacked", async () => {
    const user = userEvent.setup();
    renderInvestigation();
    await cut(user);
    // Narrow in act two (the cut drops act one's filter) so lines are
    // open-able, then stack two contexts.
    await user.click(screen.getByRole("button", { name: /errors only/i }));

    await user.click(screen.getByText("request timeout"));
    expect(getGuideStep("stack")).not.toHaveAttribute("data-done");

    // A second context joins the first instead of opening a tab.
    await user.click(screen.getByText("upstream timeout"));
    expect(getGuideStep("stack")).toHaveAttribute("data-done");
    expect(
      screen.queryByRole("tab", { name: /context slice/i }),
    ).not.toBeInTheDocument();
  });

  it("does not earn the second-context step from a filter alone", async () => {
    const user = userEvent.setup();
    renderInvestigation();
    await cut(user);

    // Narrowing to one instance is how you reach the cause line, but the
    // step is earned by stacking a second context — not by the filter.
    await user.click(screen.getByRole("button", { name: /@kc4qn/i }));
    expect(getGuideStep("stack")).not.toHaveAttribute("data-done");
  });

  it("triages by filtering to errors and traces by filtering to the request", async () => {
    const user = userEvent.setup();
    renderInvestigation();
    await cut(user);
    expect(getGuideStep("triage")).not.toHaveAttribute("data-done");
    expect(getGuideStep("trace")).not.toHaveAttribute("data-done");

    await user.click(screen.getByRole("button", { name: /errors only/i }));
    expect(getGuideStep("triage")).toHaveAttribute("data-done");

    // Single-select: selecting the request swaps the errors lens out, so the
    // errors filter is no longer active — but triage stays earned (sticky).
    await user.click(screen.getByRole("button", { name: /req=r4d8a2/i }));
    expect(getGuideStep("trace")).toHaveAttribute("data-done");
    expect(getGuideStep("triage")).toHaveAttribute("data-done");
  });

  it("clears the filter, the guide, and the act when reset", async () => {
    const user = userEvent.setup();
    render(<ResettableInvestigation />, { wrapper: DemoProviders });

    await user.click(screen.getByRole("button", { name: /req=r4d8a2/i }));
    expect(getGuideStep("filter")).toHaveAttribute("data-done");
    await cut(user);

    await user.click(screen.getByRole("button", { name: /reset/i }));

    // Remounted fresh: filter gone, checklist back to start, and back to
    // act one (the cut action is offered again).
    expect(screen.getByText("Healthcheck OK")).toBeInTheDocument();
    expect(getGuideStep("filter")).not.toHaveAttribute("data-done");
    expect(
      screen.getByRole("button", { name: /there’s a better way/i }),
    ).toBeInTheDocument();
  });
});

describe("Investigation — the act-one checklist", () => {
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

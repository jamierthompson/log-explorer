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

/** Crosses the cut into the in-place phase via the guide's action. */
async function cut(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /piece it together/i }));
}

describe("Investigation — the old way", () => {
  it("opens a context view in a new tab instead of expanding in place", async () => {
    const user = userEvent.setup();
    renderInvestigation();

    // Opens unfiltered; narrow first so a line is clickable.
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
    renderInvestigation();
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));

    await user.click(screen.getByRole("tab", { name: "Live tail" }));
    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();
  });

  it("checks off triage but gates the in-place steps behind the cut", async () => {
    const user = userEvent.setup();
    renderInvestigation();

    expect(getGuideStep("triage")).not.toHaveAttribute("data-done");

    await user.click(screen.getByRole("button", { name: /errors only/i }));
    expect(getGuideStep("triage")).toHaveAttribute("data-done");

    // Opening a tab is not opening context in place — that step can't be
    // earned the old way.
    await user.click(screen.getByText("request timeout"));
    expect(getGuideStep("context")).not.toHaveAttribute("data-done");
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
  it("folds the open tabs into stacked in-place contexts", async () => {
    const user = userEvent.setup();
    renderInvestigation();

    // Scatter two slices the old way.
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await user.click(screen.getByText("request timeout"));
    await user.click(screen.getByRole("tab", { name: "Live tail" }));
    await user.click(screen.getByText("upstream timeout"));
    expect(screen.getAllByRole("tab", { name: /context slice/i })).toHaveLength(
      2,
    );

    await cut(user);

    // The tab chrome is gone — the explorer now expands context in place —
    // and the scattered slices carried across as the in-place context step.
    expect(
      screen.queryByRole("tab", { name: "Live tail" }),
    ).not.toBeInTheDocument();
    expect(getGuideStep("context")).toHaveAttribute("data-done");
    // The forward action is now the closing call, not another cut.
    expect(
      screen.getByRole("button", { name: /call the root cause/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /piece it together/i }),
    ).not.toBeInTheDocument();
  });
});

describe("Investigation — in place", () => {
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

  it("checks off triage and context as the visitor works in place", async () => {
    const user = userEvent.setup();
    renderInvestigation();
    await cut(user);

    await user.click(screen.getByRole("button", { name: /errors only/i }));
    expect(getGuideStep("triage")).toHaveAttribute("data-done");

    await user.click(screen.getByText("request timeout"));
    expect(getGuideStep("context")).toHaveAttribute("data-done");
  });

  it("latches the blast-radius step across contexts opened one at a time", async () => {
    const user = userEvent.setup();
    renderInvestigation();
    await cut(user);

    const radius = getGuideStep("radius");
    await user.click(screen.getByRole("button", { name: /errors only/i }));

    // One place examined isn't a blast radius yet.
    await user.click(screen.getByText("request timeout"));
    await user.click(screen.getByText("request timeout"));
    expect(radius).not.toHaveAttribute("data-done");

    // A second place, even though the two were never open together.
    await user.click(screen.getByText("upstream timeout"));
    expect(radius).toHaveAttribute("data-done");
  });

  it("clears the filter, the guide, and the phase when reset", async () => {
    const user = userEvent.setup();
    render(<ResettableInvestigation />, { wrapper: DemoProviders });

    await user.click(screen.getByRole("button", { name: /errors only/i }));
    await cut(user);
    expect(getGuideStep("triage")).toHaveAttribute("data-done");

    await user.click(screen.getByRole("button", { name: /reset/i }));

    // Remounted fresh: filter gone, checklist back to start, and back to
    // the old way (the cut action is offered again).
    expect(screen.getByText("Healthcheck OK")).toBeInTheDocument();
    expect(getGuideStep("triage")).not.toHaveAttribute("data-done");
    expect(
      screen.getByRole("button", { name: /piece it together/i }),
    ).toBeInTheDocument();
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

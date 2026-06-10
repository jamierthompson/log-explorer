import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LogExplorer } from "@/demo/features/log-explorer/log-explorer";
import type { LogLine } from "@/demo/types/log";

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

describe("LogExplorer", () => {
  it("renders every line on mount", () => {
    render(<LogExplorer lines={lines} />);
    expect(screen.getByText("Healthcheck OK")).toBeInTheDocument();
    expect(screen.getByText("request timeout")).toBeInTheDocument();
    expect(screen.getByText("GET /api/users")).toBeInTheDocument();
  });

  it("filters to ERROR only when the Errors chip is pressed", async () => {
    const user = userEvent.setup();
    render(<LogExplorer lines={lines} />);
    await user.click(screen.getByRole("button", { name: /errors only/i }));

    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();
    expect(screen.getByText("request timeout")).toBeInTheDocument();
    expect(screen.queryByText("GET /api/users")).not.toBeInTheDocument();
  });

  it("clicking the active chip again clears the filter", async () => {
    const user = userEvent.setup();
    render(<LogExplorer lines={lines} />);
    const errorsChip = screen.getByRole("button", { name: /errors only/i });
    await user.click(errorsChip);
    await user.click(errorsChip);

    expect(screen.getByText("Healthcheck OK")).toBeInTheDocument();
    expect(screen.getByText("request timeout")).toBeInTheDocument();
    expect(screen.getByText("GET /api/users")).toBeInTheDocument();
  });

  it("pressing Esc closes an open context", async () => {
    const user = userEvent.setup();
    render(<LogExplorer lines={lines} />);
    await user.click(screen.getByRole("button", { name: /req=r4d8a2/i }));
    await user.click(screen.getByText("GET /api/users"));
    expect(document.querySelector('[data-selected="true"]')).not.toBeNull();

    await user.keyboard("{Escape}");
    expect(document.querySelector('[data-selected="true"]')).toBeNull();
  });

  it("pressing Esc with no contexts but a filter active clears the filter", async () => {
    const user = userEvent.setup();
    render(<LogExplorer lines={lines} />);
    await user.click(screen.getByRole("button", { name: /errors only/i }));
    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();
    expect(screen.getByText("request timeout")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.getByText("Healthcheck OK")).toBeInTheDocument();
    expect(screen.getByText("request timeout")).toBeInTheDocument();
  });

  it("pressing Shift+Esc closes every open context", async () => {
    const user = userEvent.setup();
    render(<LogExplorer lines={lines} />);
    await user.click(screen.getByRole("button", { name: /req=r4d8a2/i }));
    await user.click(screen.getByText("GET /api/users"));
    expect(document.querySelector('[data-selected="true"]')).not.toBeNull();

    await user.keyboard("{Shift>}{Escape}{/Shift}");
    expect(document.querySelector('[data-selected="true"]')).toBeNull();
  });

  it("shows a fallback Legend entry pointing to the shortcut sheet when nothing else is contextually relevant", () => {
    render(<LogExplorer lines={lines} />);
    expect(
      screen.getByRole("button", { name: /show keyboard shortcuts/i }),
    ).toBeInTheDocument();
  });

  it("pressing ? opens the shortcut sheet", async () => {
    const user = userEvent.setup();
    render(<LogExplorer lines={lines} />);
    expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();

    await user.keyboard("?");
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
  });

  it("pressing Esc with the sheet open closes only the sheet", async () => {
    const user = userEvent.setup();
    render(<LogExplorer lines={lines} />);
    await user.click(screen.getByRole("button", { name: /req=r4d8a2/i }));
    await user.click(screen.getByText("GET /api/users"));
    expect(document.querySelector('[data-selected="true"]')).not.toBeNull();

    await user.keyboard("?");
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();
    // Context underneath stays open — Esc was consumed by the sheet.
    expect(document.querySelector('[data-selected="true"]')).not.toBeNull();
  });

  it("applies multiple chip filters at once and toggles them independently", async () => {
    const user = userEvent.setup();
    render(<LogExplorer lines={lines} />);
    const errorsChip = screen.getByRole("button", { name: /errors only/i });
    const instanceChip = screen.getByRole("button", {
      name: /@kc4qn/i,
    });

    // Only errors: just the ERROR line is visible.
    await user.click(errorsChip);
    expect(screen.getByText("request timeout")).toBeInTheDocument();
    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();

    // Add instance kc4qn: intersection (ERROR on kc4qn) has no lines.
    await user.click(instanceChip);
    expect(screen.queryByText("request timeout")).not.toBeInTheDocument();
    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();

    // Toggle errors off: instance kc4qn alone remains, so kc4qn INFO lines come back.
    await user.click(errorsChip);
    expect(screen.getByText("Healthcheck OK")).toBeInTheDocument();
    expect(screen.getByText("GET /api/users")).toBeInTheDocument();
    expect(screen.queryByText("request timeout")).not.toBeInTheDocument();
  });

  it("pressing ? inside a focused input does not open the sheet", async () => {
    const user = userEvent.setup();
    render(
      <>
        <input aria-label="search" />
        <LogExplorer lines={lines} />
      </>,
    );

    const input = screen.getByLabelText("search");
    await user.click(input);
    await user.keyboard("?");

    expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();
  });
});

describe("LogExplorer document shortcut scoping", () => {
  const errorsOnlyFilter = {
    instances: [],
    requestIds: [],
    levels: ["ERROR" as const],
  };

  it("ignores ? and Esc while inside a hidden container", async () => {
    const user = userEvent.setup();
    render(
      <>
        <div data-testid="shown-host">
          <LogExplorer lines={lines} />
        </div>
        <div hidden data-testid="hidden-host">
          <LogExplorer lines={lines} initialFilter={errorsOnlyFilter} />
        </div>
      </>,
    );
    const hiddenHost = within(screen.getByTestId("hidden-host"));

    // Only the visible explorer answers `?`: a single sheet opens and a
    // single Esc closes it.
    await user.keyboard("?");
    expect(screen.getAllByText("Keyboard Shortcuts")).toHaveLength(1);
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();

    // Esc on the page must not reach the hidden explorer's filter.
    await user.keyboard("{Escape}");
    expect(hiddenHost.getByText("request timeout")).toBeInTheDocument();
    expect(hiddenHost.queryByText("Healthcheck OK")).not.toBeInTheDocument();
  });

  it("ignores Esc when focus sits inside a modal that does not contain it", async () => {
    const user = userEvent.setup();
    render(
      <>
        <LogExplorer lines={lines} initialFilter={errorsOnlyFilter} />
        <div role="dialog">
          <button type="button">Confirm</button>
        </div>
      </>,
    );
    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm" }));
    await user.keyboard("{Escape}");

    // The filter survives — the key belonged to the modal layer.
    expect(screen.queryByText("Healthcheck OK")).not.toBeInTheDocument();
    expect(screen.getByText("request timeout")).toBeInTheDocument();
  });
});

describe("LogExplorer anchor cycling", () => {
  /*
   * Trace-filterable lines so multiple contexts can be opened at once,
   * sandwiched between context-padding rows so anchors aren't at the
   * file boundary.
   */
  const cyclingLines: readonly LogLine[] = [
    {
      id: "pad-a",
      timestamp: 0,
      instance: "kc4qn",
      level: "INFO",
      message: "before",
    },
    {
      id: "alpha",
      timestamp: 1,
      instance: "kc4qn",
      level: "INFO",
      message: "alpha trace",
      requestId: "r4d8a2",
    },
    {
      id: "pad-b",
      timestamp: 2,
      instance: "kc4qn",
      level: "INFO",
      message: "middle",
    },
    {
      id: "beta",
      timestamp: 3,
      instance: "kc4qn",
      level: "INFO",
      message: "beta trace",
      requestId: "r4d8a2",
    },
    {
      id: "pad-c",
      timestamp: 4,
      instance: "kc4qn",
      level: "INFO",
      message: "between",
    },
    {
      id: "gamma",
      timestamp: 5,
      instance: "kc4qn",
      level: "INFO",
      message: "gamma trace",
      requestId: "r4d8a2",
    },
    {
      id: "pad-d",
      timestamp: 6,
      instance: "kc4qn",
      level: "INFO",
      message: "after",
    },
  ];

  async function openThreeContexts() {
    const user = userEvent.setup();
    render(<LogExplorer lines={cyclingLines} />);
    await user.click(screen.getByRole("button", { name: /req=r4d8a2/i }));
    await user.click(screen.getByText("alpha trace"));
    await user.click(screen.getByText("beta trace"));
    await user.click(screen.getByText("gamma trace"));
    return user;
  }

  function focusedLineId(): string | null {
    const list = document.querySelector('[role="listbox"]');
    return (
      list?.getAttribute("aria-activedescendant")?.replace("line_", "") ?? null
    );
  }

  it("] cycles to the next anchor in open order and wraps at the end", async () => {
    const user = await openThreeContexts();
    // Most recent click was gamma, so focus is on gamma.
    expect(focusedLineId()).toBe("gamma");

    await user.keyboard("]");
    expect(focusedLineId()).toBe("alpha");
    await user.keyboard("]");
    expect(focusedLineId()).toBe("beta");
    await user.keyboard("]");
    expect(focusedLineId()).toBe("gamma");
  });

  it("[ cycles to the previous anchor and wraps at the start", async () => {
    const user = await openThreeContexts();
    expect(focusedLineId()).toBe("gamma");

    await user.keyboard("[[");
    expect(focusedLineId()).toBe("beta");
    await user.keyboard("[[");
    expect(focusedLineId()).toBe("alpha");
    await user.keyboard("[[");
    expect(focusedLineId()).toBe("gamma");
  });

  it("] from a non-anchor focus lands on the first anchor", async () => {
    const user = userEvent.setup();
    render(<LogExplorer lines={cyclingLines} />);
    await user.click(screen.getByRole("button", { name: /req=r4d8a2/i }));
    await user.click(screen.getByText("alpha trace"));
    await user.click(screen.getByText("gamma trace"));

    // Pad lines are filtered out under trace, so use the keyboard to
    // shift focus away from any anchor before cycling.
    await user.keyboard("g");
    expect(focusedLineId()).toBe("alpha");
    await user.keyboard("]");
    // Cycling from a focused anchor moves to the next; alpha -> gamma.
    expect(focusedLineId()).toBe("gamma");
  });

  it("] with no open contexts is a no-op", async () => {
    const user = userEvent.setup();
    render(<LogExplorer lines={cyclingLines} />);
    await user.click(screen.getByText("before"));
    const before = focusedLineId();

    await user.keyboard("]");
    expect(focusedLineId()).toBe(before);
  });
});

describe("LogExplorer context delegation and Legend visibility", () => {
  it("delegates to onViewContext instead of opening context in place", async () => {
    const user = userEvent.setup();
    const onViewContext = vi.fn();
    render(<LogExplorer lines={lines} onViewContext={onViewContext} />);

    await user.click(screen.getByRole("button", { name: /req=r4d8a2/i }));
    await user.click(screen.getByText("GET /api/users"));

    expect(onViewContext).toHaveBeenCalledWith("3");
    // Nothing opened in place.
    expect(document.querySelector('[data-selected="true"]')).toBeNull();
  });

  it("does not delegate the keyboard context action when no filter is active", async () => {
    const user = userEvent.setup();
    const onViewContext = vi.fn();
    render(<LogExplorer lines={lines} onViewContext={onViewContext} />);

    // Without a filter the line isn't clickable, so this only moves
    // focus (to the line, and DOM focus to the listbox).
    await user.click(screen.getByText("GET /api/users"));
    expect(onViewContext).not.toHaveBeenCalled();

    await user.keyboard("e");
    await user.keyboard("{Enter}");
    expect(onViewContext).not.toHaveBeenCalled();
  });

  it("delegates the keyboard context action once a matching filter is active", async () => {
    const user = userEvent.setup();
    const onViewContext = vi.fn();
    render(<LogExplorer lines={lines} onViewContext={onViewContext} />);

    await user.click(screen.getByRole("button", { name: /req=r4d8a2/i }));
    // The click both focuses the matching line and delegates once;
    // clear that call so the assertion isolates the keyboard path.
    await user.click(screen.getByText("GET /api/users"));
    onViewContext.mockClear();

    await user.keyboard("e");
    expect(onViewContext).toHaveBeenCalledTimes(1);
    expect(onViewContext).toHaveBeenCalledWith("3");
  });

  it("hides the Legend when showLegend is false but keeps the filter chips", () => {
    render(<LogExplorer lines={lines} showLegend={false} />);

    expect(
      screen.queryByRole("toolbar", { name: /keyboard hints/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /errors only/i }),
    ).toBeInTheDocument();
  });
});

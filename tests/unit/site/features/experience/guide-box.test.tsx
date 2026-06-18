import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GuideBox } from "@/site/features/experience/guide-box/guide-box";

describe("GuideBox", () => {
  it("renders the title and items with completion status", () => {
    render(
      <GuideBox
        title="The Method"
        items={[
          { id: "a", title: "First step", done: true },
          {
            id: "b",
            title: "Second step",
            description: "Do the second thing.",
          },
        ]}
      />,
    );

    expect(screen.getByText("The Method")).toBeInTheDocument();
    expect(screen.getByText("First step")).toBeInTheDocument();
    expect(screen.getByText("Second step")).toBeInTheDocument();
    // The subtext under a step renders.
    expect(screen.getByText("Do the second thing.")).toBeInTheDocument();
    // Completion is conveyed to assistive tech, not just by color.
    expect(screen.getByText(/^Done:/)).toBeInTheDocument();
    expect(screen.getByText(/^To do:/)).toBeInTheDocument();
  });

  it("announces a step the moment it completes", () => {
    const onAnnounce = vi.fn();
    const { rerender } = render(
      <GuideBox
        title="The Method"
        items={[{ id: "a", title: "Filter the live tail" }]}
        onAnnounce={onAnnounce}
      />,
    );
    expect(onAnnounce).not.toHaveBeenCalled();

    rerender(
      <GuideBox
        title="The Method"
        items={[{ id: "a", title: "Filter the live tail", done: true }]}
        onAnnounce={onAnnounce}
      />,
    );
    expect(onAnnounce).toHaveBeenCalledWith("Step done: Filter the live tail");
  });

  it("stays silent for steps that mount already done", () => {
    const onAnnounce = vi.fn();
    render(
      <GuideBox
        title="The Method"
        items={[{ id: "a", title: "First step", done: true }]}
        onAnnounce={onAnnounce}
      />,
    );
    expect(onAnnounce).not.toHaveBeenCalled();
  });

  it("fires the action when its button is pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <GuideBox
        title="The Method"
        items={[{ id: "a", title: "Step" }]}
        action={{ label: "See what actually happened", onClick }}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "See what actually happened" }),
    );
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("offers a labeled reset control only when a handler is given", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const { rerender } = render(
      <GuideBox title="The Method" items={[{ id: "a", title: "Step" }]} />,
    );
    // No reset affordance without a handler.
    expect(
      screen.queryByRole("button", { name: /reset the investigation/i }),
    ).toBeNull();

    rerender(
      <GuideBox
        title="The Method"
        items={[{ id: "a", title: "Step" }]}
        onReset={onReset}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: /reset the investigation/i }),
    );
    expect(onReset).toHaveBeenCalledOnce();
  });
});

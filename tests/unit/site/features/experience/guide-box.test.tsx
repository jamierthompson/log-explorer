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
          { id: "b", title: "Second step" },
        ]}
      />,
    );

    expect(screen.getByText("The Method")).toBeInTheDocument();
    expect(screen.getByText("First step")).toBeInTheDocument();
    expect(screen.getByText("Second step")).toBeInTheDocument();
    // Completion is conveyed to assistive tech, not just by color.
    expect(screen.getByText(/^Done:/)).toBeInTheDocument();
    expect(screen.getByText(/^To do:/)).toBeInTheDocument();
  });

  it("fires the action when its button is pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <GuideBox
        title="The Method"
        items={[{ id: "a", title: "Step" }]}
        action={{ label: "Call the root cause", onClick }}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Call the root cause" }),
    );
    expect(onClick).toHaveBeenCalledOnce();
  });
});

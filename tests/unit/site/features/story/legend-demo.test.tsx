import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LegendDemo } from "@/site/features/story/legend-demo";

describe("LegendDemo", () => {
  it("retires the entries on Close and restores them from the fallback", async () => {
    const user = userEvent.setup();
    render(<LegendDemo />);

    const expandName = /expand the most recent context/i;
    expect(
      screen.getByRole("button", { name: expandName }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /close the most recent context/i }),
    );
    expect(
      screen.queryByRole("button", { name: expandName }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /restore/i }));
    expect(
      screen.getByRole("button", { name: expandName }),
    ).toBeInTheDocument();
  });

  it("keeps both entries through an Expand press", async () => {
    const user = userEvent.setup();
    render(<LegendDemo />);

    await user.click(
      screen.getByRole("button", { name: /expand the most recent context/i }),
    );
    expect(
      screen.getByRole("button", { name: /expand the most recent context/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /close the most recent context/i }),
    ).toBeInTheDocument();
  });
});

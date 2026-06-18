import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { useRouter } from "next/navigation";

import { InvestigationView } from "@/site/features/experience/investigation/investigation-view";

import { DemoProviders } from "../../../../helpers/demo-providers";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

const push = vi.fn();
vi.mocked(useRouter).mockReturnValue({
  push,
} as unknown as ReturnType<typeof useRouter>);

/** Crosses the cut, then concludes — the only path that opens the debrief. */
async function conclude(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole("button", { name: /there’s a better way/i }),
  );
  await user.click(
    screen.getByRole("button", { name: /what actually happened/i }),
  );
}

describe("InvestigationView", () => {
  it("opens the incident debrief in place when the investigation concludes", async () => {
    const user = userEvent.setup();
    render(<InvestigationView />, { wrapper: DemoProviders });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await conclude(user);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("replays by closing the debrief and resetting back to act one", async () => {
    const user = userEvent.setup();
    render(<InvestigationView />, { wrapper: DemoProviders });
    await conclude(user);

    await user.click(
      screen.getByRole("button", { name: /replay the incident/i }),
    );

    // The debrief is dismissed and the run is reset: the forward action is
    // the act-one cut again, not the act-two close.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /there’s a better way/i }),
    ).toBeInTheDocument();
  });

  it("routes to the story without disturbing the demo state", async () => {
    const user = userEvent.setup();
    render(<InvestigationView />, { wrapper: DemoProviders });
    await conclude(user);

    await user.click(
      screen.getByRole("button", { name: /read how it was built/i }),
    );
    expect(push).toHaveBeenCalledWith("/story");
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRouter } from "next/navigation";

import { useDemoState } from "@/site/features/experience/demo-state";
import { RootCauseView } from "@/site/features/experience/root-cause/root-cause-view";

import { DemoProviders } from "../../../../helpers/demo-providers";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

const push = vi.fn();
const noop = () => {};

beforeEach(() => {
  push.mockClear();
  vi.mocked(useRouter).mockReturnValue({
    push,
    replace: noop,
    prefetch: noop,
    back: noop,
    forward: noop,
    refresh: noop,
  } as unknown as ReturnType<typeof useRouter>);
});

/* Seeds investigation progress and reads it back, so a sibling sharing the
 * same store can assert the Replay action cleared it. */
function StateProbe() {
  const { state, setScenarios, observe } = useDemoState();
  return (
    <div>
      <button
        onClick={() => {
          setScenarios(["errors"]);
          observe({
            triaged: true,
            traced: true,
            examined: true,
            stacked: true,
          });
        }}
      >
        seed
      </button>
      <output data-testid="scenarios">{state.scenarioIds.join(",")}</output>
      <output data-testid="traced">{String(state.progress.traced)}</output>
    </div>
  );
}

describe("RootCauseView", () => {
  it("replays by clearing the whole investigation and returning to the demo", async () => {
    const user = userEvent.setup();
    render(
      <>
        <StateProbe />
        <RootCauseView />
      </>,
      { wrapper: DemoProviders },
    );

    // Seed a filter and a fully-checked checklist into the shared store.
    await user.click(screen.getByRole("button", { name: "seed" }));
    expect(screen.getByTestId("scenarios")).toHaveTextContent("errors");
    expect(screen.getByTestId("traced")).toHaveTextContent("true");

    // Reach the replay control by calling the correct root cause.
    await user.click(screen.getByRole("button", { name: /config reload/i }));
    await user.click(
      screen.getByRole("button", { name: /replay the incident/i }),
    );

    // The shared investigation is wiped as one...
    expect(screen.getByTestId("scenarios")).not.toHaveTextContent("errors");
    expect(screen.getByTestId("traced")).toHaveTextContent("false");
    // ...and the visitor is sent back to the start of the demo.
    expect(push).toHaveBeenCalledWith("/demo");
  });
});

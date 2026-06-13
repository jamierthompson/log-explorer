import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePathname, useRouter } from "next/navigation";

import RootCauseModal from "@/app/demo/@modal/(.)root-cause/page";
import { DemoStateProvider } from "@/site/features/experience/demo-state";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

const push = vi.fn();
const back = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useRouter).mockReturnValue({
    push,
    back,
  } as unknown as ReturnType<typeof useRouter>);
  vi.mocked(usePathname).mockReturnValue("/demo/root-cause");
});

function renderModal() {
  return render(<RootCauseModal />, { wrapper: DemoStateProvider });
}

describe("root-cause modal route", () => {
  it("shows the dialog while on the root-cause path", () => {
    renderModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing once the path has moved on — the slot's stale content is dropped", () => {
    vi.mocked(usePathname).mockReturnValue("/demo");
    renderModal();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("replays the incident back to Act 1", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole("button", { name: /config reload/i }));
    await user.click(
      screen.getByRole("button", { name: /replay the incident/i }),
    );
    expect(push).toHaveBeenCalledWith("/demo");
  });

  it("hands off to the story", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole("button", { name: /config reload/i }));
    await user.click(
      screen.getByRole("button", { name: /read how it was built/i }),
    );
    expect(push).toHaveBeenCalledWith("/story");
  });

  it("closes back to the act on dismiss", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.keyboard("{Escape}");
    expect(back).toHaveBeenCalled();
  });
});

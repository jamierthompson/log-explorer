import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePathname } from "next/navigation";

import { SiteShell } from "@/site/shell/site-shell/site-shell";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("SiteShell", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue("/");
  });

  it("renders the route content", () => {
    render(
      <SiteShell>
        <p>route content</p>
      </SiteShell>,
    );
    expect(screen.getByText("route content")).toBeInTheDocument();
  });

  it("surfaces the footer on the story route", () => {
    vi.mocked(usePathname).mockReturnValue("/story");
    render(
      <SiteShell>
        <p>route content</p>
      </SiteShell>,
    );
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("hides the footer off the story route", () => {
    vi.mocked(usePathname).mockReturnValue("/demo");
    render(
      <SiteShell>
        <p>route content</p>
      </SiteShell>,
    );
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePathname } from "next/navigation";

import { SiteNav } from "@/site/shell/site-nav/site-nav";

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

describe("SiteNav", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue("/");
  });

  it("links each item to its route", () => {
    render(<SiteNav />);
    expect(screen.getByRole("link", { name: "Demo" })).toHaveAttribute(
      "href",
      "/demo",
    );
    expect(screen.getByRole("link", { name: "Story" })).toHaveAttribute(
      "href",
      "/story",
    );
  });

  it("marks the active section from the current path", () => {
    vi.mocked(usePathname).mockReturnValue("/story");
    render(<SiteNav />);
    expect(screen.getByRole("link", { name: "Story" })).toHaveAttribute(
      "data-active",
    );
  });

  it("treats a demo sub-route as the demo section", () => {
    vi.mocked(usePathname).mockReturnValue("/demo/in-context");
    render(<SiteNav />);
    expect(screen.getByRole("link", { name: "Demo" })).toHaveAttribute(
      "data-active",
    );
  });
});

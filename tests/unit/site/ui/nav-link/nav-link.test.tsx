import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";

import { NavLink } from "@/site/ui/nav-link/nav-link";

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

describe("NavLink", () => {
  it("links an internal item to its route", () => {
    render(<NavLink href="/demo">Demo</NavLink>);
    expect(screen.getByRole("link", { name: "Demo" })).toHaveAttribute(
      "href",
      "/demo",
    );
  });

  it("marks the active item as the current page for assistive tech", () => {
    render(
      <NavLink href="/demo" active>
        Demo
      </NavLink>,
    );
    expect(screen.getByRole("link", { name: "Demo" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("omits aria-current when the item is not active", () => {
    render(<NavLink href="/demo">Demo</NavLink>);
    expect(screen.getByRole("link", { name: "Demo" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("renders an external link that opens in a new tab", () => {
    render(
      <NavLink href="https://example.com" external>
        Code
      </NavLink>,
    );

    const link = screen.getByRole("link", { name: /code/i });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
  });
});

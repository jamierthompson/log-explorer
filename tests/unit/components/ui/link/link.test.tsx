import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Link } from "@/components/ui/link/link";

describe("Link", () => {
  it("renders a plain anchor by default", () => {
    render(<Link href="/x">Home</Link>);
    const link = screen.getByRole("link", { name: "Home" });
    expect(link).toHaveAttribute("href", "/x");
    expect(link).not.toHaveAttribute("target");
  });

  it("opens external links safely in a new tab", () => {
    render(
      <Link href="https://example.com" external>
        Code
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Code" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });
});

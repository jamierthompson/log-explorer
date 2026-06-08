import { JetBrains_Mono } from "next/font/google";

/*
 * LogExplorer's own typeface — the demo owns its font choice rather than
 * borrowing the host's. The host mounts `.variable` at the document root
 * (as it imports the demo's stylesheet): `--logx-font` is declared on
 * `:root` in tokens.css and reads `--logx-font-family` through it, and CSS
 * resolves that nested var in the scope where `--logx-font` is declared,
 * so the family must be defined at the same root. tokens.css falls back to
 * a system mono stack when this isn't mounted.
 */
export const demoFont = JetBrains_Mono({
  variable: "--logx-font-family",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});
